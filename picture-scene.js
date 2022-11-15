import { Scene } from './js-demo.js';

export class PictureScene extends Scene {
    constructor(url, scale, fromColor, fadeInTime, toColor, fadeOutPos, fadeOutRow, fadeOutTime) {
        super();
        const pictureName = url.match(/^(.*\/)?(.*?)(\.(png|jpg|jpeg))?$/)[2];
        this.name = `Picture (${pictureName})`;
        this.url = url;
        this.scale = scale;
        this.fromColor = fromColor;
        this.fadeInTime = fadeInTime;
        this.toColor = toColor;
        this.fadeOutPos = fadeOutPos;
        this.fadeOutRow = fadeOutRow;
        this.fadeOutTime = fadeOutTime;
        this.fadingOut = false;
        this.lastTime = 0.0;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 1);
        timeSource.watch(this.fadeOutPos, this.fadeOutRow);

        this.image = await this.loadImage(this.url);
        progressCallback(1, 1);
    }

    handleTime(songPos, row) {
        this.fadingOut = true;
        this.fadeOutStartTime = this.lastTime;
    }

    render(canvas, context, time) {
        const halfWidth = canvas.width / 2;
        const halfHeight = canvas.height / 2;

        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const iw = this.image.width * this.scale;
        const ih = this.image.height * this.scale;
        context.drawImage(this.image, halfWidth - (iw >> 1), halfHeight - (ih >> 1), iw, ih);

        if (time < this.fadeInTime) {
            this.fadingOut = false;
            context.globalAlpha = (1 - time / this.fadeInTime);
            context.fillStyle = this.fromColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        else if (this.fadingOut) {
            const timeAfterFadeout = time - this.fadeOutStartTime;
            const rawFade = timeAfterFadeout / this.fadeOutTime;
            const fade = Math.min(1, rawFade);
            context.globalAlpha = fade;
            context.fillStyle = this.toColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.globalAlpha = 1.0;

        this.lastTime = time;
    }
}
