import { sinus, solidColor, Scene } from './js-demo.js';

const discColors = [
    {r : 255, g : 255, b : 255},
    {r : 255, g : 64, b : 128},
    {r : 255, g : 255, b : 255},
    {r : 96, g : 240, b : 255}
];

export class DiscTunnelScene extends Scene {
    constructor() {
        super();
        this.name = 'Disc Tunnel';
        this.part = -1;
        this.discFarA = 32768;
        this.discZOffset = 0;
        this.discRenderMinIndex = 9;
        this.discRenderMaxIndex = 9;
        this.discColoredMinIndex = 10;
        this.discIndexOffset = 0;
        this.discRotation = 0;
        this.discOffsetMinZ = 1050;
    }

    async prepare(timeSource, progressCallback) {
        timeSource.watch(18, 0);
        timeSource.watch(19, 0);
        timeSource.watch(20, 0);
        timeSource.watch(21, 0);
        timeSource.watch(22, 48);
        progressCallback(1, 1);
    }

    handleTime(pos, row) {
        if (pos === 18 && row === 0) {
            this.part = 0;
        }
        if (pos === 19 && row === 0) {
            this.part = 1;
        }
        if (pos === 20 && row === 0) {
            this.part = 2;
        }
        if (pos === 21 && row === 0) {
            this.part = 3;
        }
        if (pos === 22 && row === 48) {
            this.part = 4;
        }
    }

    render(canvas, context, time) {
        const frameDiff = (this.lastTime ? time - this.lastTime : 16) / 1000 * 60;
        context.fillStyle = "#240000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const discFarX = centerX + canvas.width / 2 * sinus[this.discFarA];
        const discFarY = centerY + canvas.width / 2 * sinus[(this.discFarA + 16384) % 65536];

        const zOffset = (this.part == 0) ? ((sinus[(time * 32768 / 3840) & 0xffff]) * 800) : this.discZOffset;
        const maxDisc = (this.part == 0) ? 0 : this.discRenderMaxIndex;
        const minDisc = (this.part == 0) ? 0 : this.discRenderMinIndex;

        for (let disc = maxDisc; disc >= minDisc; --disc) {
            const z = 50 + 100 * disc + zOffset; // From 50 to (50 + 10 * 10) = 1050 
            const alpha = (this.part == 0) ? 1 : 1 - (z - 50) / 1000;
            
            const zForOffset = z - this.discOffsetMinZ;
            const alphaForOffset = Math.min(1, 1 - (zForOffset - 50) / 1000);
            
            const colorIndex = (disc >= this.discColoredMinIndex) ? (disc + this.discIndexOffset) % 4 : 0;
            const color = discColors[colorIndex];
            
            const discX = (centerX * alphaForOffset) + (discFarX * (1 - alphaForOffset));
            const discY = (centerY * alphaForOffset) + (discFarY * (1 - alphaForOffset));
            
            context.beginPath();
            for (let a = 0; a <= 65536; a += 256) {
                const outerA = (a * 10) % 65536;
                
                const radius = (1 + sinus[outerA] * 0.3) * canvas.width / 2;
                const x = discX + ((100 / z) * radius) * sinus[(a + this.discRotation) % 65536];
                const y = discY + ((100 / z) * radius) * sinus[(a + 16384 + this.discRotation) % 65536];
                
                if (a) {
                    context.lineTo(x, y);
                } else {
                    context.moveTo(x, y);
                }
            }

            for (let a = 65536; a >= 0; a -= 4096) {
                const radius = canvas.width / 2;
                
                const x = discX + ((100 / z) * radius) * sinus[(a + this.discRotation) % 65536];
                const y = discY + ((100 / z) * radius) * sinus[(a + 16384 + this.discRotation) % 65536];
                
                context.lineTo(x, y);
            }

            context.closePath();
            
            const r = (color.r * alpha) + (0x24 * (1 - alpha));
            const g = (color.g * alpha);
            const b = (color.b * alpha);
            
            context.fillStyle = solidColor(r, g, b);
            context.fill();
        }

        let newDiscZOffset = (this.discZOffset - 9 * frameDiff);
        while (newDiscZOffset < 0) {
            ++this.discIndexOffset;
            newDiscZOffset += 100;
            if (this.part >= 2 && this.discColoredMinIndex > 0) {
                --this.discColoredMinIndex;
            }
            if (this.part >= 1 && this.discRenderMinIndex > 0) {
                --this.discRenderMinIndex;
            }
            if (this.part == 4) {
                --this.discRenderMaxIndex;
            }
        }
        this.discZOffset = newDiscZOffset | 0;
            
        this.discRotation = (this.discRotation + 65536 - 473 * frameDiff) & 0xffff;

        if (this.part >= 3) {
            if (this.discOffsetMinZ > 0) {
                this.discOffsetMinZ -= 9 * frameDiff;
            } else {
                this.discOffsetMinZ = 0;
                this.discFarA = (this.discFarA + 65536 - 100 * frameDiff) & 0xffff;
            }
            
        }

        this.lastTime = time;
    }
}
