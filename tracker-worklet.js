
class TrackerWorklet extends AudioWorkletProcessor {
    constructor(options) {
        super(options);
        console.log(options);

        this.time = 0;
        this.debug = true;
        this.channels = [ null, null, null, null ];
        this.port.onmessage = this.onmessage.bind(this);
    }

    onmessage(e) {
        console.log('Tracker Worklet received message:', e.data);
        this.sampleRate = e.data.sampleRate;
        this.rate = 7093789.2 / (this.sampleRate * 2);
        this.data = e.data.data;
        const songPos = 0;
        const patternIndex = this.data.patternIndices[0];
        const pattern = this.data.patterns[patternIndex];
        const rowIndex = 0;
        const row = pattern[rowIndex];
        for (let i = 0; i < 4; ++i) {
            if (row[i].instr) {
                const instr = this.data.instruments[row[i].instr - 1];

                this.channels[i] = {
                    instr: instr,
                    at: 0,
                    period: row[i].period,
                    effect: row[i].effectCommand,
                    volume: Math.max(0, Math.min(1, instr.volume / 64))
                };
            }
            else {
                this.channels[i] = null;
            }
        }
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const channel = output[0];

        for (let i = 0; i < channel.length; ++i) {
            let value = 0.0;

            for (let c = 0; c < 4; ++c) {
                const ch = this.channels[c];
                if (!ch) continue;
                value += ch.instr.samples[ch.at | 0] * ch.volume / 200;
                ch.at += this.rate / (ch.period + ch.instr.fineTune);
                if (ch.instr.repeat) {
                    if (ch.at >= ch.instr.repeat.start + ch.instr.repeat.length) {
                        ch.at -= ch.instr.repeat.length;
                    }
                }
                else if (ch.at >= ch.instr.length) {
                    this.channels[i] = null;
                }
            }
            channel[i] = Math.tanh(value);
        }
        this.debug = false;
        return true;
    }
}   

registerProcessor('tracker-worklet', TrackerWorklet);
