import { sinus, smooth, Scene } from './js-demo.js';

const SIZE = 96;

export class DemonWarpScene extends Scene {
    constructor() {
        super();
        this.name = 'Demon Warp';
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 2);
        const demon = await this.loadImage('./demonic-buddha.png');

        progressCallback(1, 2);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tempCanvas.height = demon.width;
        const tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(demon, 0, 0);
        this.demonBits = tempContext.getImageData(0, 0, demon.width, demon.width);

        this.demonCanvas = document.createElement('canvas');
        this.demonCanvas.width = SIZE;
        this.demonCanvas.height = SIZE;
        this.demonContext = this.demonCanvas.getContext("2d");
        this.demonData = this.demonContext.createImageData(SIZE, SIZE);

        progressCallback(2, 2);
    }

    render(canvas, context, time) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        const chapterComplete = time / (32 * 480);

        const angle1 = 65536 * (sinus[(smooth(chapterComplete) * 65536) & 0xffff] * 1.5 - 0.5);
        const scale1 = smooth(chapterComplete) * 0.5 + 0.5;
        
        const angle2 = smooth(chapterComplete) * 65536 * 4;
        const scale2 = (chapterComplete < 0.8) ? 0.5 :
                     (chapterComplete < 0.9) ? 0.5 - (chapterComplete - 0.8) * 2.5 :
                     smooth((chapterComplete - 0.9) * 10) * 3.75 + 0.25;
        
        const offsetX1 = sinus[angle2 & 65535] * 80 + 48;
        const offsetY1 = sinus[(angle2 + 23000) & 65535] * 72;
        
        const offsetX2 = sinus[angle1 & 65535] * 48 + 64;
        const offsetY2 = -40;

        const sourceData = this.demonBits.data;
        const targetData = this.demonData.data;
        let targetIndex = 0;
        for (let y = 0; y < SIZE; ++y) {
            for (let x = 0; x < SIZE; ++x) {
                const yy = y - SIZE / 2;
                const xx = x - SIZE / 2;
                
                let ya1 = yy * sinus[(angle1 + 16384) & 65535] + xx * sinus[angle1 & 65535];
                let xa1 = xx * sinus[(angle1 + 16384) & 65535] - yy * sinus[angle1 & 65535];
                xa1 -= offsetX1;
                ya1 -= offsetY1;
                ya1 /= scale1;
                xa1 /= scale1;
                
                let ya2 = yy * sinus[(angle2 + 16384) & 65535] + xx * sinus[angle2 & 65535];
                let xa2 = xx * sinus[(angle2 + 16384) & 65535] - yy * sinus[angle2 & 65535];
                ya2 /= scale2;
                xa2 /= scale2;
                xa2 -= offsetX2;
                ya2 -= offsetY2;
                
                let secondWeight = (x + y - SIZE * 2) / (SIZE * 2) + chapterComplete * 2;
//                var secondWeight = (x * 1.5 + y * 1.5 - buddhaSceneWidth - buddhaSceneHeight) / ((buddhaSceneWidth + buddhaSceneHeight) * 2) + chapterComplete * 3 - 1;
                
                if (secondWeight < 0) secondWeight = 0;
                if (secondWeight > 1) secondWeight = 1;
                
                let x2 = xa1 * (1 - secondWeight) + xa2 * secondWeight;
                let y2 = ya1 * (1 - secondWeight) + ya2 * secondWeight;
                
                x2 = x2 & 127;
                y2 = y2 & 127;
                const sourceIndex = (y2 * 128 + x2) * 4;
                
                targetData[targetIndex++] = sourceData[sourceIndex];
                targetData[targetIndex++] = sourceData[sourceIndex + 1];
                targetData[targetIndex++] = sourceData[sourceIndex + 2];
                targetData[targetIndex++] = 255;
            }

            this.demonContext.putImageData(this.demonData, 0, 0);
            context.drawImage(this.demonCanvas, canvas.width / 2 - SIZE * 2, canvas.height / 2 - SIZE * 2, SIZE * 4, SIZE * 4);
        }
    }
}
