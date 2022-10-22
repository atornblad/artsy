// Source materials:
// - https://www.ocf.berkeley.edu/~eek/index.html/tiny_examples/ptmod/ap12.html
// - https://qooiii.blogspot.com/2016/07/simple-amiga-mod-file-player-effects.html
// - http://lclevy.free.fr/mo3/mod.txt
// - https://www.eblong.com/zarf/blorb/mod-spec.txt

const debug = {
    log : (info) => {
        console.log(info);
    },
    code : (info) => {
        console.log(`%c${info}`, 'font-family:monospace');
    },
    dump : (data, maxLength) => {
        const length = maxLength ? Math.min(maxLength, data.byteLength) : data.byteLength;
        debug.log(`Showing ${length} of ${data.byteLength} bytes`);
        for (let i = 0; i < length; i += 16) {
            const length = Math.min(16, data.byteLength - i);
            const view = Array.from(new Uint8Array(data, i, length));
            const addr = i.toString(16).padStart(5, '0');
            const hex = view.map(d => d.toString(16).padStart(2, '0')).join(' ');
            const ascii = view.map(d => (d >= 32 && d <= 126) ? String.fromCharCode(d) : '-').join('');
            debug.code(`${addr}: ${hex}   ${ascii}`);
        }
    }
}

const getString = (data, offset, maxLength) => {
    const view = new Uint8Array(data, offset, maxLength);
    const str = [];
    for (let i = 0; i < maxLength && view[i] > 0; ++i) {
        str.push(String.fromCharCode(view[i]));
    }
    return str.join('');
}

const getUint16 = (data, offset) => {
    const view = new Uint8Array(data, offset, 2);
    // Big-endian
    return view[0] * 256 + view[1];
}

const getUint8 = (data, offset) => {
    const view = new Uint8Array(data, offset, 1);
    return view[0];
}

const getUint8Array = (data, offset, length) => {
    const view = new Uint8Array(data, offset, length);
    return Array.from(view);
}

const getInt8Array = (data, offset, length) => {
    const view = new Int8Array(data, offset, length);
    return Array.from(view);
}

const getInt4 = (data, offset) => {
    const view = new Uint8Array(data, offset, 1);
    const byteValue = view[0];
    if (byteValue & 0x08) {
        return (byteValue & 0x0f) - 0x10;
    }
    else {
        return byteValue & 0x0f;
    }
}

const makePattern = (rawData) => {
    const ticks = [];
    let i = 0;
    for (let row = 0; row < 64; ++row) {
        const notes = [];
        for (let note = 0; note < 4; ++note) {
            const instrNumber = (rawData[i] & 0xf0) | ((rawData[i + 2] & 0xf0) >> 4);
            const notePeriod = ((rawData[i] & 0x0f) << 8) | rawData[i + 1];
            const effectCommand = ((rawData[i + 2] & 0x0f) << 8) | rawData[i + 3];
            i += 4;
            notes.push({instr: instrNumber, period: notePeriod, effect: effectCommand});
        }
        ticks.push(notes);
    }
    return ticks;
};

const tracker = async (url) => {

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`ModTracker Could not fetch ${url}: ${response.status}`)
    }
    const data = await response.arrayBuffer();
    //debug.dump(data, 32768);

    // Magic string 'M.K.' at offset 0x438
    if (data.byteLength < 0x43c) {
        throw new Error(`${url} is not a real MOD file`);
    }
    const magicCheck = new Uint32Array(data, 0x438, 1)[0];
    if (magicCheck != 0x2e4b2e4d) {
        throw new Error(`${url} is not a real MOD file`);
    }

    const songName = getString(data, 0, 20);

    let instrumentCount = 0;
    const instruments = [];
    for (let i = 0; i < 31; ++i) {
        const instrStart = 20 + 30 * i;
        const instrName = getString(data, instrStart, 22);
        const sampleLength = getUint16(data, instrStart + 22) * 2;
        const fineTune = getInt4(data, instrStart + 24);
        const volume = getUint8(data, instrStart + 25);
        const repeatPoint = getUint16(data, instrStart + 26) * 2;
        const repeatLength = getUint16(data, instrStart + 28) * 2;
        instruments.push({
            name: instrName,
            length: sampleLength,
            fineTune: fineTune,
            volume: Math.min(64, Math.max(0, volume)),
            repeat: (repeatLength && (repeatPoint != 0 || repeatLength != 2)) ? { start: repeatPoint, length: repeatLength } : null
        });
        if (sampleLength) ++instrumentCount;
    }

    const songLength = getUint8(data, 950);
    const repeat = getUint8(data, 951);
    const songPositions = getUint8Array(data, 952, 128);
    const maxPatternId = Math.max(...songPositions);
    const patterns = [];

    for (let i = 0; i <= maxPatternId; ++i) {
        const patternRawData = getUint8Array(data, 1084 + 1024 * i, 1024);
        const pattern = makePattern(patternRawData);
        patterns.push(pattern);
    }

    // TODO: samples
    let instrStart = 1084 + 1024 * patterns.length;
    for (let instr of instruments) {
        if (instr.length) {
            instr.samples = getInt8Array(data, instrStart, instr.length);
            instrStart += instr.length;
        }
    }
    
    let playing = false;
    let loaded = false;
    let audio = null;
    let processor = null;
    let processorConnected = false;
    const callbacks = {};

    const workletData = {
        instruments : instruments,
        instrumentCount : instrumentCount,
        length : songLength,
        repeat : repeat,
        patternIndices : songPositions,
        maxPatternId : maxPatternId,
        patterns: patterns
    };

    const load = async () => {
        if (!audio) {
            audio = new AudioContext();
            await audio.audioWorklet.addModule('./tracker-worklet.js');
            processor = new AudioWorkletNode(audio, 'tracker-worklet');
            processor.port.onmessage = (e) => {
                switch (e.data.event) {
                    case 'watch':
                        const { name, songPos, row, tick } = e.data;
                        if (callbacks[name]) {
                            callbacks[name](songPos, row, tick);
                        }
                        break;
                }
            }
        }
        processor.port.postMessage({
            command: 'load',
            sampleRate: audio.sampleRate,
            data: workletData
        });
        loaded = true;
        playing = false;
    };

    const watch = (name, songPos, row, callback) => {
        if (!processor) {
            throw new Error('ModTracker not loaded');
        }
        if (!callbacks[name]) {
            callbacks[name] = callback;
        }
        processor.port.postMessage({
            command: 'watch',
            name: name,
            songPos: songPos,
            row: row
        });
    };

    const play = async () => {
        if (playing) return;
        if (!loaded) await this.load();

        if (!processorConnected) {
            const gain = audio.createGain();
            gain.gain = 1.5;
            processor.connect(gain).connect(audio.destination);
            processorConnected = true;
            audio.resume();
        }

        processor.port.postMessage({
            command: 'play'
        });
        playing = true;
    };

    return {
        ...workletData,
        name : songName,
        load : load,
        watch : watch,
        play : play
    }
};
