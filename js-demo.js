/**
 * Author: Anders Marzi Tornblad
 * Date: 2022-10-23
 * License: Creative Commons Attribution-NonCommercial 4.0 International License
 * 
 * This is a JavaScript framework for creating demoscene-style demos using
 * the Canvas API.
 * 
 */

const prepareCanvas = (canvas, width, height, backgroundColor) => {
    canvas.width = width;
    canvas.height = height;
    canvas.style.backgroundColor = backgroundColor;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    return canvas;
};

const createCanvas = (target, width, height, backgroundColor) => {
    const canvas = document.createElement('canvas');
    prepareCanvas(canvas, width, height, backgroundColor);
    target.appendChild(canvas);
    return canvas;
};

const getElement = (elementOrSelector) => {
    if (typeof elementOrSelector === 'string') {
        return document.querySelector(elementOrSelector);
    }
    return elementOrSelector;
};

export class JsDemo {
    constructor(options) {
        const {
            canvas : providedCanvas,
            width : providedWidth,
            height : providedHeight,
            backgroundColor : providedBackgroundColor,
            target : providedTarget
        } = options;
    
        const width = providedWidth || 640;
        const height = providedHeight || 480;
        const backgroundColor = providedBackgroundColor || 'black';
        const target = getElement(providedTarget || document.body);
        const canvas = providedCanvas ?
                       prepareCanvas(providedCanvas, width, height, backgroundColor) :
                       createCanvas(target, width, height, backgroundColor);
    
        const context = canvas.getContext('2d');

        this.canvas = canvas;
        this.context = context;
        this.animTime = 0.0;

        this.scene = this.loadingScene = new LoadingScene();

        window.requestAnimationFrame(this.animFrame.bind(this));
    }

    async registerScenes(modPlayer, ...scenes) {
        this.modPlayer = modPlayer;

        this.scene = this.loadingScene;
        this.scenes = Array.from(scenes.values());
        this.scenes.sort((a, b) => {
            if (a.from.songPos < b.from.songPos) return -1;
            if (a.from.songPos > b.from.songPos) return 1;
            if (a.from.row < b.from.row) return -1;
            if (a.from.row > b.from.row) return 1;
            return 0;
        });

        const progress = this.scenes.map(s => 0.0);
        let totalDone = 0.0;

        const progressCallback = (index, current, total) => {
            progress[index] = current / total;
            totalDone = progress.reduce((a, b) => a + b, 0.0) / progress.length;
            this.loadingScene.done = totalDone;
        };

        const loaders = scenes.map((s, i) => {
            const scene = s.scene;
            const timeSource = {
                watch: (songPos, row) => modPlayer.watch(songPos, row, (p, r) => scene.handleTime(p, r))
            };
            modPlayer.watch(s.from.songPos, s.from.row, () => this.startScene(i));
            return scene.prepare(timeSource, progressCallback.bind(null, i));
        });

        await Promise.all(loaders);
    }

    startScene(index) {
        this.sceneStartTime = this.animTime;
        this.scene = this.scenes[index].scene;
    }

    animFrame(time) {
        this.animTime = time;
        if (!this.sceneStartTime) this.sceneStartTime = time;
        this.context.save();

        if (this.scene) {
            this.scene.render(this.canvas, this.context, time - this.sceneStartTime);
        }
        this.context.restore();
        this.context.globalAlpha = 1.0;
        window.requestAnimationFrame(this.animFrame.bind(this));
    }

    start() {
        //await this.soundPlayer.play();
        this.modPlayer.watchRows((p,r) => console.log(`Pos ${p} Row ${r}`));
        this.canvas.addEventListener('click', () => this.modPlayer.play());
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                case 'p':
                    this.modPlayer.play();
                    break;
                case '1':
                    if (this.scene !== this.loadingScene) {
                        this.modPlayer.setRow(0, 0);
                    };
                    break;
                case '2':
                    if (this.scene !== this.loadingScene) {
                        this.modPlayer.setRow(2, 0);
                    };
                    break;
                case '3':
                    if (this.scene !== this.loadingScene) {
                        this.modPlayer.setRow(6, 0);
                    };
                    break;
                default:
                    console.log(e.key);
            }
            if (e.key === ' ') {
                this.modPlayer.play();
            }
        });
    }
}

export const solidColor = (r, g, b) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, 1)`;

export const smooth = (complete) => (1 - Math.cos(complete * Math.PI)) / 2

export const range = function* (start, end, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
};

const genProto = Object.getPrototypeOf(range(0, 10));
if (!genProto.map) {
    genProto.map = function* (f) {
        for (const x of this) {
            yield f(x);
        }
    };
}

export const sinus = [...range(0, 65536).map(i => Math.sin(i / 65536 * 2 * Math.PI))];

export class Scene {
    constructor() {
        this.name = 'Default Scene';
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject();
            img.src = url;
        });
    }

    prepare(timeSource, progressCallback) {
        return new Promise((resolve, reject) => { resolve(); });
    }

    render(canvas, context, time) { }
}

export class EmptyScene extends Scene {
    constructor(color) {
        super();
        this.color = color;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(1, 1);
    }

    render(canvas, context, time) {
        context.fillStyle = this.color;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}

class LoadingScene extends Scene {
    constructor() {
        super();
        this.done = 0.0;
        this.wasDone = false;
    }

    setDone(done) {
        this.done = done;
    }

    render(canvas, context, time) {
        const halfWidth = canvas.width / 2;
        const halfHeight = canvas.height / 2;

        context.fillStyle = solidColor(0, 0, 0);
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "#658d4a";
        context.strokeStyle = "#658d4a";
        context.lineWidth = 50;
        context.lineCap = "round";
        
        context.beginPath();
        context.moveTo(halfWidth - 200, halfHeight);
        context.lineTo(halfWidth + 200, halfHeight);
        context.stroke();

        context.fillStyle = "#1b320b";
        context.strokeStyle = "#1b320b";
        context.lineWidth = 42;
        
        context.beginPath();
        context.moveTo(halfWidth - 200, halfHeight);
        context.lineTo(halfWidth + 200, halfHeight);
        context.stroke();

        context.fillStyle = "#baeb9a";
        context.strokeStyle = "#baeb9a";
        context.lineWidth = 40;

        context.beginPath();
        context.moveTo(halfWidth - 200, halfHeight);
        context.lineTo(halfWidth - 200 + 400 * this.done, halfHeight);
        context.stroke();

        if (this.done >= 1.0 && !this.wasDone) {
            this.wasDone = time;
        }

        if (this.wasDone) {
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "20px sans-serif";
            context.fillStyle = "#658d4a";
            context.fillText("Click to start...", halfWidth, halfHeight + 40);
        }
    }
}