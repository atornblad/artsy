
import { solidColor, Scene } from './js-demo.js';

export class IntroTextScene extends Scene {
    
    constructor() {
        super();
        this.name = 'Intro Text';
        this.pos = -1;
        this.lastTime = 0;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 1);
        timeSource.watch(0, 0);
        timeSource.watch(0, 7);
        timeSource.watch(0, 9);
        timeSource.watch(0, 16);
        timeSource.watch(0, 23);
        timeSource.watch(0, 25);
        timeSource.watch(0, 28);

        timeSource.watch(0, 32);
        timeSource.watch(0, 39);
        timeSource.watch(0, 41);
        timeSource.watch(0, 48);
        timeSource.watch(0, 55);
        timeSource.watch(0, 57);
        timeSource.watch(0, 60);

        timeSource.watch(1, 0);

        progressCallback(1, 1);
    }

    handleTime(songPos, row) {
        this.pos = songPos * 64 + row;
        this.timeOfLastMessage = this.lastTime;
    }

    render(canvas, context, time) {
        this.lastTime = time;
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.textBaseline = "top";

        if (this.pos < 32) {
            this.drawFirstPage(context, canvas.width, canvas.height);
        }
        else if (this.pos < 64) {
            this.drawSecondPage(context, canvas.width, canvas.height);
        }
    }

    drawFirstPage(context, width, height) {
        context.scale(-0.5, 1);
        if (this.pos >= 28) {
            const alpha = Math.min(1, Math.max(0, 1.0 - (this.lastTime - this.timeOfLastMessage) / 400));
            context.fillStyle = solidColor(0x99 * alpha, 0x88 * alpha, 0x88 * alpha);
        }
        else {
            context.fillStyle = '#998888';
        }

        context.font = "50px sans-serif";
        context.fillText("PRESENTED", -width, 40);

        if (this.pos >= 7) {
            context.fillText("A T", -width, 110);
        }

        if (this.pos >= 9) {
            context.fillText("THE", -width * 1.2, 180);
        }

        if (this.pos >= 16) {
            context.fillText("WORLD", -width * 0.85, 180);
        }

        if (this.pos >= 23) {
            context.font = "40px sans-serif";
            context.fillText("O F", -width, 270);
        }
        if (this.pos >= 25) {
            context.font = "bold 100px sans-serif";
            context.fillText("NOSTRADAMUS", -width, 360);
        }
    }

    drawSecondPage(context, width, height) {
        context.scale(-0.5, 1);
        if (this.pos >= 60) {
            const alpha = Math.min(1, Math.max(0, 1.0 - (this.lastTime - this.timeOfLastMessage) / 400));
            context.fillStyle = solidColor(0x99 * alpha, 0x88 * alpha, 0x88 * alpha);
        }
        else {
            context.fillStyle = '#998888';
        }

        context.font = "50px sans-serif";
        context.fillText("SO", -width * 1.15, 40);

        if (this.pos >= 39) {
            context.fillText("JUST", -width * 0.9, 40);
        }

        if (this.pos >= 41) {
            context.font = "bold 100px sans-serif";
            context.fillText("Straight", -width, 120);
        }

        if (this.pos >= 48) {
            context.font = "50px sans-serif";
            context.fillText("OFF", -width, 260);
        }

        if (this.pos >= 55) {
            context.fillText("THE", -width, 310);
        }
        if (this.pos >= 57) {
            context.font = "bold 120px sans-serif";
            context.fillText("tricycle", -width, 360);
        }
    }
};
