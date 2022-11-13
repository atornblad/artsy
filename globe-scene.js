import { sinus, Scene } from './js-demo.js';

export class GlobeScene extends Scene {
    constructor() {
        super();
        this.name = 'Globe';
        this.fading = false;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 3);

        timeSource.watch(11, 28);

        this.globe = await this.loadImage('./globe.png');

        progressCallback(1, 3);

        this.globeDoodles = await this.loadImage('./globeDoodles.png');

        progressCallback(2, 3);

        this.globeCanvas = document.createElement('canvas');
        this.globeCanvas.width = this.globeCanvas.height = 224;
        this.globeContext = this.globeCanvas.getContext("2d");
        this.globeImageData = this.globeContext.createImageData(224, 224);

        const mults = [];
        
        for (let x = 0; x <= 224; ++x) {
            const fromNegToPos = x / 112 - 1;
            const arccos = Math.acos(fromNegToPos);
            const sin = Math.sin(arccos);
            mults.push(sin);
        }

        this.globeMultTable = mults;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 512;
        tempCanvas.height = 512;
        const tempContext = tempCanvas.getContext("2d");
        tempContext.clearRect(0, 0, 512, 512);
        tempContext.drawImage(this.globeDoodles, 0, 0);
        const tempData = tempContext.getImageData(0, 0, 512, 512).data;
        this.globeDoodleBits = Array(512 * 512);
        let index = 0;
        for (let y = 0; y < 512; ++y) {
            for (let x = 0; x < 512; ++x) {
                this.globeDoodleBits[index] = (tempData[index * 4] > 128) ? 112 : 0;
                ++index;
            }
        }

        progressCallback(3, 3);
    }

    handleTime(pos, row) {
        this.fadeStart = this.lastTime;
        this.fading = true;
    }

    render(canvas, context, time) {
        context.fillStyle = "#110000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const halfWidth = canvas.width / 2;
        const halfHeight = canvas.height / 2;
        
        const w = this.globe.width;
        const h = this.globe.height;
        
        context.drawImage(this.globe, halfWidth - w, halfHeight - h, w * 2, h * 2);
        
        const buffer = this.globeImageData.data;
        
        const xOffset = (sinus[(time * 23) & 0xffff] * ((512 - 224) / 2) + 256 - 112) | 0;
        const yOffset = (sinus[(time * 17) & 0xffff] * ((512 - 224) / 2) + 256 - 112) | 0;
        
        let index = 0;
        for (let y = 0; y <= 223; ++y) {
            for (let x = 0; x <= 223; ++x) {
                let alpha = 0;
                buffer[index++] = 255;
                buffer[index++] = 255;
                buffer[index++] = 255;
                
                const yMult = this.globeMultTable[x];
                
                if (yMult > 0) {
                    const yFromMiddle = y - 112;
                    const trueYFromMiddle = (yFromMiddle / yMult) | 0;
                    const trueY = trueYFromMiddle + 112;
                    
                    if (trueY >= 0 && trueY <= 223) {
                        const fetch = (trueY + yOffset) * 512 + x + xOffset;
                        alpha = this.globeDoodleBits[fetch];
                    }
                }

                buffer[index++] = alpha;
            }
        }
        
        this.globeContext.putImageData(this.globeImageData, 0, 0);
        
        context.drawImage(this.globeCanvas, halfWidth - 224, halfHeight - 224, 448, 448);
        
        if (time < 512) {
            context.fillStyle = "#441000";
            context.fillRect(0, 0, canvas.width, 256 - time / 2);
            context.fillRect(0, canvas.height - 256 + time / 2, canvas.width, 256 - time / 2);
        }
        
        if (this.fading) {
            const alpha = Math.min(1.0, (time - this.fadeStart) / 480);
            context.fillStyle = "rgba(0,0,0," + alpha.toFixed(3) + ")";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.lastTime = time;
    }
}
