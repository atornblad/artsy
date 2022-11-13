import { sinus, smooth, Scene } from './js-demo.js';

export class DeadChickenScene extends Scene {
    constructor() {
        super();
        this.name = 'Dead Chicken';
        this.part = -1;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 2);

        timeSource.watch(7, 1);
        timeSource.watch(7, 30);
        timeSource.watch(7, 33);
        timeSource.watch(7, 62);
        timeSource.watch(8, 1);
        timeSource.watch(8, 60);

        this.deadChicken = await this.loadImage('./deadChicken2.png');

        progressCallback(1, 2);

        this.biteArte = await this.loadImage('./biteArte2.png');

        progressCallback(2, 2);
    }

    handleTime(pos, row) {
        const totalRow = (pos - 7) * 64 + row;
        switch (totalRow) {
            case 1:
                this.startPart(0);
                break;
            case 30:
                this.fadeOut(240);
                break;
            case 33:
                this.startPart(1);
                break;
            case 62:
                this.fadeOut(240);
                break;
            case 65:
                this.startPart(2);
                break;
            case 124:
                this.fadeOut(480);
                break;
        }
    }

    startPart(part) {
        this.part = part;
        this.fading = false;
    }

    fadeOut(fadeTime) {
        this.fading = true;
        this.fadeStartTime = this.lastTime;
        this.fadeTime = fadeTime;
    }

    render(canvas, context, time) {
        const angle = (time * 19 + 10000) & 65535;

        const halfWidth = canvas.width / 2;
        const halfHeight = canvas.height / 2;
        
        let x = halfWidth / 2 * sinus[angle & 65535],
            x2 = halfWidth / 2 * sinus[(angle + 32768) & 65535]
        const z = sinus[(angle + 16384) & 65535],
              z2 = -z;
        const mult = 2 / (2 - z),
              mult2 = 2 / (2 - z2);
        x *= mult;
        x2 *= mult2;

        context.fillStyle = "#441010";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const biteWidth = this.biteArte.width;
        const biteHeight = this.biteArte.height;
        
        const chickenWidth = this.deadChicken.width;
        const chickenHeight = this.deadChicken.height;

        let w, h, w2, h2;

        switch (this.part) {
            case 0:
                w = biteWidth * mult;
                h = biteHeight * mult;
                context.drawImage(this.biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                break;
            case 1:
                w = chickenWidth * mult;
                h = chickenHeight * mult;
                if (z > 0) {
                    context.drawImage(this.biteArte, halfWidth - biteWidth / 2, halfHeight - biteHeight / 2);
                }
                context.drawImage(this.deadChicken, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                if (z <= 0) {
                    context.drawImage(this.biteArte, halfWidth - biteWidth / 2, halfHeight - biteHeight / 2);
                }
                break;
            case 2:
                w = biteWidth * mult;
                h = biteHeight * mult;
                w2 = chickenWidth * mult2;
                h2 = chickenHeight * mult2;

                if (z2 > 0) {
                    context.drawImage(this.biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                }
                context.drawImage(this.deadChicken, halfWidth + x2 - w2 / 2, halfHeight - h2 / 2, w2, h2);
                if (z2 <= 0) {
                    context.drawImage(this.biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                }
                break;
        }

        if (this.fading) {
            const factor = (time - this.fadeStartTime) / this.fadeTime
            const alpha = smooth(Math.min(1, factor));

            context.fillStyle = `rgba(68,16,16,${alpha.toFixed(3)})`;
            context.fillRect(0, 0, canvas.width, canvas.height);        
        }

        this.lastTime = time;
    }
}
