const debuggedEffects = {};

const HALF_NOTE_STEP = Math.pow(2, 1 / 12);
const halfNoteSteps = (halfNotes) => Math.pow(2, halfNotes / 12);

class TrackerWorklet extends AudioWorkletProcessor {
    constructor(options) {
        super(options);
        console.log(options);

        this.time = 0;
        this.debug = true;
        this.channels = [ {
            instr: null,
            at: 0,
            period: 0,
            effect: 0,
            volume: 0,
            vibrato: { notes : 0, speed : 0, active : true }
        }, {
            instr: null,
            at: 0,
            period: 0,
            effect: 0,
            volume: 0,
            vibrato: { notes : 0, speed : 0, active : true }
        }, {
            instr: null,
            at: 0,
            period: 0,
            effect: 0,
            volume: 0,
            vibrato: { notes : 0, speed : 0, active : true }
        }, {
            instr: null,
            at: 0,
            period: 0,
            effect: 0,
            volume: 0,
            vibrato: { notes : 0, speed : 0, active : true }
        } ];
        this.port.onmessage = this.onmessage.bind(this);
    }

    onmessage(e) {
        console.log('Tracker Worklet received message:', e.data);
        this.sampleRate = e.data.sampleRate;
        this.rate = 7093789.2 / (this.sampleRate * 2);
        this.data = e.data.data;
        this.nextSongPos = 0;
        this.nextRowIndex = 0;
        this.bpm = 125;
        this.samplesPerTick = (this.sampleRate * 60) / (this.bpm * 4) / 6;
        this.nextTickAfter = 0;
        this.tick = 0;
        this.ticksPerRow = 6;
    }

    nextTick() {
        ++this.tick;
        if (this.tick >= this.ticksPerRow) {
            this.tick = 0;
            this.nextRow();
        }
        this.nextTickAfter += this.samplesPerTick;
    }

    nextRow() {
        const patternIndex = this.data.patternIndices[this.nextSongPos];
        const pattern = this.data.patterns[patternIndex];
        const row = pattern[this.nextRowIndex];

        this.nextRowIndex++;
        if (this.nextRowIndex == 64) {
            this.nextRowIndex = 0;
            this.nextSongPos++;
        }

        for (let i = 0; i < 4; ++i) {
            const ch = this.channels[i];
            if (row[i].instr) {
                const instr = this.data.instruments[row[i].instr - 1];
                ch.instr = instr;
                ch.at = 0;
                ch.volume = Math.max(0, Math.min(1, instr.volume / 64));
            }

            if (row[i].period) {
                ch.period = row[i].period;
            }

            ch.vibrato.active = false;
            if (row[i].effect) {
                const command = row[i].effect >> 8;
                const data = row[i].effect & 0xff;
                const upper = (data & 0xf0) >> 4;
                const lower = data & 0x0f;
                switch (command) {
                    case 0x4:
                        // 4: Vibrato
                        ch.vibrato.active = true;
                        if (upper) ch.vibrato.notes = lower;
                        if (lower) ch.vibrato.speed = upper;
                        console.log(ch.vibrato);
                        break;
                    case 0x9:
                        // 9: Set sample offset
                        ch.at = data * 256;
                        break;
                    case 0xb:
                        // B: Position Jump
                        this.nextRowIndex = 0;
                        this.nextSongPos = data & 0x7f;
                        break;
                    case 0xc:
                        // C: Set volume
                        ch.volume = Math.max(0, Math.min(1, data / 64))
                        break;
                    case 0xd:
                        // D: Pattern Break
                        this.nextRowIndex = (upper >> 4) * 10 + lower;
                        this.nextSongPos++;
                        break;
                    case 0xf:
                        // F: Set speed
                        this.ticksPerRow = data;
                        break;
                    default:
                        const key = command.toString(16);
                        if (!(key in debuggedEffects)) {
                            debuggedEffects[key] = true;
                            console.log(`Unhandled effect ${key}`);
                        }
                }
            }
        }
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const channel = output[0];

        for (let i = 0; i < channel.length; ++i) {
            if (this.nextTickAfter <= 0) {
                this.nextTick();
            }
            this.nextTickAfter--;
            let value = 0.0;

            for (let c = 0; c < 4; ++c) {
                const ch = this.channels[c];
                if (!ch) continue;
                if (!ch.instr) continue;
                value += ch.instr.samples[ch.at | 0] * ch.volume / 200;
                let atStep = this.rate / (ch.period - ch.instr.fineTune);
                if (ch.vibrato.active) {
                    // Not completely sure about this, but it sounds okay for now.
                    atStep *= (1 + (Math.sin(this.time * ch.vibrato.speed * this.bpm * 6) * (halfNoteSteps(ch.vibrato.notes / 8) - 1)));
                }
                ch.at += atStep;
                if (ch.instr.repeat) {
                    if (ch.at >= ch.instr.repeat.start + ch.instr.repeat.length) {
                        ch.at -= ch.instr.repeat.length;
                    }
                }
                else if (ch.at >= ch.instr.length) {
                    ch.instr = null;
                }
            }
            channel[i] = Math.tanh(value);
        }
        this.debug = false;
        this.time += 1 / this.sampleRate;
        return true;
    }
}   

registerProcessor('tracker-worklet', TrackerWorklet);
