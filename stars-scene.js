import { sinus, smooth, Scene } from './js-demo.js';

const limitStarCoord = (composant) => {
    if (composant > 512) {
        return composant - 1024 * Math.floor((composant + 512) / 1024);
    } else if (composant < -512) {
        return composant + 1024 * Math.floor((512 - composant) / 1024);
    } else {
        return composant;
    }
}

export class StarsScene extends Scene {
    constructor() {
        super();
        this.name = 'Stars';
        this.phaseXStarted = false;
        this.showText = false;
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 1);

        timeSource.watchRows();

        this.html5Coords = (function() {
            const lines = [
                { x1 : 31, y1 : 0, x2 : 481, y2: 0},
                { x1 : 481, y1 : 0, x2 : 440, y2 : 460},
                { x1 : 440, y1 : 460, x2 : 256, y2 : 511},
                { x1 : 256, y1 : 511, x2 : 71, y2 : 460},
                { x1 : 71, y1 : 460, x2 : 31, y2 : 0},
                
                { x1 : 256, y1 : 37, x2 : 440, y2 : 37},
                { x1 : 440, y1 : 37, x2 : 405, y2 : 431},
                { x1 : 405, y1 : 431, x2 : 256, y2 : 472},
                { x1 : 256, y1 : 472, x2 : 256, y2 : 413},
                { x1 : 256, y1 : 355, x2 : 256, y2 : 264},
                { x1 : 256, y1 : 208, x2 : 256, y2 : 150},
                { x1 : 256, y1 : 94, x2 : 256, y2 : 37},
                
                { x1 : 114, y1 : 94, x2 : 397, y2 : 94},
                { x1 : 397, y1 : 94, x2 : 391, y2 : 150},
                { x1 : 391, y1 : 150, x2 : 175, y2 : 150},
                { x1 : 175, y1 : 150, x2 : 180, y2 : 208},
                { x1 : 180, y1 : 208, x2 : 386, y2 : 208},
                { x1 : 386, y1 : 208, x2 : 371, y2 : 381},
                { x1 : 371, y1 : 381, x2 : 256, y2 : 413},
                { x1 : 256, y1 : 413, x2 : 140, y2 : 381},
                { x1 : 140, y1 : 381, x2 : 132, y2 : 293},
                { x1 : 132, y1 : 293, x2 : 188, y2 : 293},
                { x1 : 188, y1 : 293, x2 : 192, y2 : 338},
                { x1 : 192, y1 : 338, x2 : 256, y2 : 355},
                { x1 : 256, y1 : 355, x2 : 318, y2 : 338},
                { x1 : 318, y1 : 338, x2 : 325, y2 : 264},
                { x1 : 325, y1 : 264, x2 : 129, y2 : 264},
                { x1 : 129, y1 : 264, x2 : 114, y2 : 94}
            ];
            
            const result = [];
            
            let lineIndex = 0;
            let totalStars = 0;
            let distSteps = 80;
            let dist = 0;
            let firstTimeAround = true;
            while (distSteps > 10) {
                const line = lines[lineIndex];
                const totalDist = Math.sqrt((line.x2-line.x1)*(line.x2-line.x1) + (line.y2-line.y1)*(line.y2-line.y1));
                if (firstTimeAround && dist == 0) {
                    dist = 0.1;
                } else if (dist == 0) {
                    dist = distSteps / 2;
                } else {
                    dist += distSteps;
                }
                if (dist > totalDist) {
                    dist = 0;
                    lineIndex = (lineIndex + 1) % lines.length;
                    if (lineIndex == 0) {
                        if (firstTimeAround) {
                            firstTimeAround = false;
                        } else {
                            distSteps /= 2;
                        }
                    }
                } else {
                    const x = line.x1 - 256 + (dist / totalDist * (line.x2 - line.x1));
                    const y = line.y1 - 256 + (dist / totalDist * (line.y2 - line.y1));
                    const z = Math.abs(x) * 0.1;
                    result.push({x : x, y : y, z : z});
                    ++totalStars;
                }
            }
            
            return result;
        })();

        this.starsRandomCoords = (function() {
            const result = [];
            for (let i = 0; i < 1000; ++i) {
                result.push(
                            {
                                x : Math.random() * 1024 - 512,
                                y : Math.random() * 1024 - 512,
                                z : Math.random() * 1024 - 512
                            });
            }
            
            return result;
        })();

        progressCallback(1, 1);
    }

    handleTime(pos, row) {
        this.pos = pos;
        this.row = row;
        if (pos === 14 && row === 0) {
            this.starsStart = this.lastTime;
        }
        if (pos === 16 && row === 0) {
            this.phaseXStarted = this.lastTime - this.starsStart;
        }
        if (pos === 17 && row === 56) {
            this.fadeOutStarted = this.lastTime;
        }
        const beat = (pos - 16) * 64 + row;
        if (beat >= 0 && beat < 95) {
            this.showText = (beat % 4) <= 1;
            this.textIndex = Math.floor(beat / 32);
        }
        else {
            this.showText = false;
        }
    }

    render(canvas, context, time) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (this.pos === 13) {
            this.useHtmlLogoCoords(time);
        }
        else {
            this.useStarsCoords(time - this.starsStart);
        }

        if (this.maxStars > this.coords.length) {
            this.maxStars = this.coords.length;
        }

        context.fillStyle = "#ffffff";

        let fade = 1.0;
        if (this.fadeOutStarted) {
            fade = Math.max(0.0, (960 - (time - this.fadeOutStarted)) / 960); // ???
        }
        
        for (let i = 0; i < this.maxStars; ++i) {
            const star = this.coords[i];
            
            // Phase
            const x = limitStarCoord(star.x + this.phaseX);
            const y = limitStarCoord(star.y + this.phaseY);
            const z = limitStarCoord(star.z + this.phaseZ) + this.offsetZ;
            
            if (z > -1000 && z < 1000) {
                const zMultFactor = 512 / (z + 1024);
                
                const screenX = canvas.width / 2 + zMultFactor * x;
                const screenY = canvas.width / 2 + zMultFactor * y;
                
                if (screenX >= 0 && screenX < canvas.width && screenY >= 0 && screenY < canvas.height) {
                    let alpha = (512 - z) / 1024;
                    if (alpha < 0) alpha = 0; else if (alpha > 1) alpha = 1;
                    alpha *= fade;
                    context.globalAlpha = alpha; // TODO:  * fade;
                    context.fillRect(screenX, screenY, 2, 2);
                }
            }
        }

        this.renderText(context);

        this.lastTime = time;
    }

    renderText(context) {
        if (this.showText) {
            context.globalAlpha = 1;
            context.textAlign = "left";
            context.textBaseline = "top";

            switch (this.textIndex) {
                case 0:
                    context.fillStyle = "#999999";
                    context.font = "40px sans-serif";
                    context.fillText("Anders Marzi Tornblad", 10, 10);
                    context.fillStyle = "#666666";
                    context.font = "30px sans-serif";
                    context.fillText("JavaScript, 2013", 10, 55);
                    context.fillStyle = "#666666";
                    context.font = "20px sans-serif";
                    context.fillText("Refactored, 2022–2023", 10, 90);
                    break;
                case 1:
                    context.fillStyle = "#999999";
                    context.font = "40px sans-serif";
                    context.fillText("Olivi\u00e9r Bechard (RA)", 10, 10);
                    context.fillStyle = "#666666";
                    context.font = "30px sans-serif";
                    context.fillText("Graphics, 1993", 10, 55);
                    break;
                case 2:
                    context.fillStyle = "#999999";
                    context.font = "40px sans-serif";
                    context.fillText("Fr\u00e9d\u00e9ric Motte (Moby)", 10, 10);
                    context.fillStyle = "#666666";
                    context.font = "30px sans-serif";
                    context.fillText("Music, 1993", 10, 55);
                    break;
            }
        }
    }

    useHtmlLogoCoords(time) {
        const chapterComplete = time / 3840;
        this.coords = this.html5Coords;
        this.phaseX = this.phaseY = this.phaseZ = 0;
        this.offsetZ = 1024 - chapterComplete * 2048;
        this.maxStars = time / 7;
    }

    useStarsCoords(time) {
        this.coords = this.starsRandomCoords;
        this.offsetZ = 0;
        //phaseZ = sinus[chapterOffset] * 2048;
        this.phaseX = this.phaseY = this.phaseZ = this.offsetZ = 0;
        this.maxStars = time / 4;
        this.phaseZ = -time / 10;
        let weight = 0;
        if (time > 6000) {
            weight = 1;
        } else if (time > 2000) {
            weight = smooth((time - 2000) / 4000);
        }
        this.phaseZ += weight * sinus[(time * 5 + 30000) & 0xffff] * 2048;
        this.phaseY = weight * sinus[(time * 2 + 54000) & 0xffff] * 1024;
        
        if (this.phaseXStarted) {
            weight = Math.min(1.0, (time - this.phaseXStarted) / 4000);
            weight = smooth(weight);
            this.phaseX = weight * sinus[((time - this.phaseXStarted) * 3) & 0xffff] * 3072;
        }
        else {
            weight = 0;
        }
    }
}
