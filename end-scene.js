import { Scene } from './js-demo.js';

const hailSalvadoreData = [
    { from:  0, x: 78,  y: 0,   w: 131, h: 81 }, // Head
    { from:  7, x: 0,   y: 91,  w: 69,  h: 22 }, // hail
    { from:  9, x: 85,  y: 91,  w: 216, h: 22 }, // salvadore
    { from: 16, x: 63,  y: 119, w: 91,  h: 22 }, // who
    { from: 22, x: 170, y: 119, w: 76,  h: 22 }, // has
    { from: 23, x: 74,  y: 148, w: 154, h: 28 }, // proved
    { from: 25, x: 21,  y: 181, w: 93,  h: 22 }, // that
    { from: 28, x: 128, y: 181, w: 151, h: 23 }  // loonies
];

const trueArtistsData = [
    { from: 32, x: 67,  y: 0,   w: 70,  h: 16  }, // are
    { from: 39, x: 10,  y: 34,  w: 48,  h: 18  }, // the
    { from: 41, x: 0,   y: 53,  w: 60,  h: 35  }, // only (left part)
    { from: 41, x: 63,  y: 41,  w: 45,  h: 47  }, // only (right part)
    { from: 48, x: 119, y: 46,  w: 84,  h: 36  }, // true
    { from: 51, x: 6,   y: 102, w: 216, h: 43  }, // artists
    { from: 56, x: 41,  y: 154, w: 128, h: 100 }  // Head
];

export class EndScene extends Scene {
    constructor() {
        super();
        this.name = 'End';
        this.pos = 0;
        this.fading = false;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 2);

        const blocks = [...hailSalvadoreData, ...trueArtistsData];
        for (const block of blocks) {
            timeSource.watch(25, block.from);
        }

        timeSource.watch(25, 30); // To fade out hailSalvadore

        this.hailSalvadore = await this.loadImage('./hailSalvadore.png');
        progressCallback(1, 2);
        this.trueArtists = await this.loadImage('./trueArtists.png');
        progressCallback(2, 2);
    }

    handleTime(songPos, row) {
        this.pos = (songPos - 25) * 64 + row;
        if (this.pos === 30) {
            this.fading = this.lastTime;
        }
        else if (this.pos === 32) {
            this.fading = false;
        }
    }

    render(canvas, context, time) {
        let image;
        let blocks;
        let offsetY;
        if (this.pos < trueArtistsData[0].from) {
            image = this.hailSalvadore;
            blocks = hailSalvadoreData;
            offsetY = 60;
        }
        else {
            image = this.trueArtists;
            blocks = trueArtistsData;
            offsetY = 0;
        }
        const offsetX = canvas.width / 2 - image.width / 2;

        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (const block of blocks) {
            if (this.pos >= block.from) {
                context.drawImage(image,
                    block.x, block.y, block.w, block.h,
                    block.x + offsetX, block.y * 2 + offsetY, block.w, block.h * 2);
            }
        }

        if (this.fading) {
            const fade = Math.min(1, (time - this.fading) / 240);
            context.fillStyle = `rgba(0, 0, 0, ${fade})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.lastTime = time;
    }
}
