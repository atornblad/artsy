
import { sinus, smooth, Scene } from './js-demo.js';

let tunnelBitmap, tunnelBitmapWidth, tunnelBitmapHeight, tunnelBitmapData
let tunnelTargetCanvas, tunnelTargetContext, tunnelTargetData;
let tunnelWall, tunnelHanger;
let ceilingOffsets, floorOffsets;

const targetWidth = 320;
const HEIGHT = 512;
const targetHalfWidth = targetWidth / 2;
const targetHeight = (HEIGHT - 128) / 2;
const targetHalfHeight = targetHeight / 2;
const tunnelSpeedFactor = 2;
const hangingWallDistance = 120;

const floorScript =   "    aaa aaaabbbb ccdccaabbccccbddddaaaaaabbbabccdda abdbccdccc    caaabbbbbaaabbbb ccccaabbccccbdaaabbcccdaaa aaaabbbbaaabbcccdaaabbabbcab";
const ceilingScript = "    aaa aabbccddadddddaabbccdd abaabbcccdaaa aacaabbbb ccccbbb    cc ddddaaddddaaaaaabbbbccdda abccccaabbccccbddddaaaaaabbccddadddddaabbcc";

export class BitmapTunnelScene extends Scene {
    
    constructor() {
        super();
        this.name = 'Bitmap Tunnel';
        this.pos = -1;
    }

    render(canvas, context, time) {
        this.lastTime = time;
        const target = tunnelTargetData.data;
        const source = tunnelBitmapData.data;
        const width = canvas.width;
        const halfWidth = width / 2;
        const height = canvas.height;
        const halfHeight = height / 2;
        
        context.fillStyle = "#350000";
        context.fillRect(0, 0, width, 50);
        context.fillRect(0, height - 50, width, 50);
        context.fillStyle = "#46051e";
        context.fillRect(0, 50, width, 14);
        context.fillRect(0, height - 64, width, 14);
        context.fillStyle = "#000000";
        context.fillRect(0, 64, width, height - 128);
        
        let targetIndex = 0;
        
        const maxY = targetHalfHeight;
        
        let veerOffset = time - 15490;
        if (veerOffset < 0)
            veerOffset = 0;
        else if (veerOffset < (16384/5))
            veerOffset = 16384/5*smooth(veerOffset/16384*5);
            const veer = 0.25 * sinus[(veerOffset * 5) & 0xffff];
        
        const zFocus = -150;
        const yFocus = 0;
        const zScreen = -100;
        const zFloor = 0;
        const yFloor = 288;
        const yCeiling = -288;
        
        let slopeOffset = time - 5000;
        if (slopeOffset < 0)
            slopeOffset = 0;
            const trueSlope = sinus[(slopeOffset * 7) & 0xffff] * 1.5;
        
        // Floor equation: y = a*z+b, where b = yFloor, a = slope
        
        const millisUntilEnd = 30720 - time;
        if (millisUntilEnd < 0.0) return;
        const millisUntilMid = 15360 - time;
        
        const millisUntilWall = millisUntilMid > 0 ? millisUntilMid : millisUntilEnd;
        
        const distanceToWallZ = millisUntilWall / tunnelSpeedFactor;
        const showWall = (distanceToWallZ < 500 && distanceToWallZ > 0);
        let wallMinY = maxY, wallMaxY = -maxY;
        let wallMinX, wallMaxX;
        
        let nextHangingWallZ = (time > 16500) ? (1100 - (time / tunnelSpeedFactor) % 1600) : 20000;
        let maxHangingWallIterations = 4;
        while (nextHangingWallZ < 0) {
            --maxHangingWallIterations;
            nextHangingWallZ += hangingWallDistance;
        }
        const hangingWalls = [];
        
        for (let y = -maxY; y <= maxY; y += 1.0) {
            // tracer ray: y = kz + m
            //             y1 = 0, z1 = zFocus
            //             y2 = y, z2 = zScreen
            //             k = dy/dz = y/(zScreen - zFocus);
            if (y == 0) continue;
            
            const slope = (trueSlope * Math.abs(y) / maxY + trueSlope) / 2;
            
            const k = y / (zScreen - zFocus);
            const m = y + (zFloor - zScreen) / (zScreen - zFocus) * (y - yFocus);
            
            // y = kz+m
            // y = az+b
            // kz+m = az+b
            // z = (b-m)/(k-a)
            
            let z = (yFloor - m) / (k - slope);
            
            const upsideDown = (z < 0);
            if (upsideDown) {
                z = (yCeiling - m) / (k - slope);
            }
            
            const offsets = upsideDown ? ceilingOffsets : floorOffsets;
            const inverseZFactor = (z - zFocus) / (-zFocus);
            
            if (upsideDown && z > nextHangingWallZ && z < 500 && (!showWall || z < distanceToWallZ) && maxHangingWallIterations > 0) {
                hangingWalls.push({
                    topY : y,
                    minX : (-targetHalfWidth / inverseZFactor) - z * veer,
                    maxX : (targetHalfWidth / inverseZFactor) - z * veer,
                    height : 100 / inverseZFactor,
                    alpha : (1 - z / 500)
                });
                nextHangingWallZ += hangingWallDistance;
                --maxHangingWallIterations;
            }
            
            let tileBitmapOffsetX = false;
            let veerX = 0;
            let bitmapY = 0;
            let alpha8bit = 0;
            if (showWall && z > distanceToWallZ) {
                //tileBitmapOffsetX = false;
                if (y < wallMinY) wallMinY = y;
                if (y > wallMaxY) {
                    wallMaxY = y;
                    wallMinX = (-targetHalfWidth / inverseZFactor) - distanceToWallZ * veer;
                    wallMaxX = (targetHalfWidth / inverseZFactor) - distanceToWallZ * veer;
                }
            } else if (z < 500) {
                const trueY = z + time / tunnelSpeedFactor;
                alpha8bit = (1 - z / 500) * 256 & 0x1ff;
                
                veerX = z * veer;
                
                const tileScriptPos = (trueY / tunnelBitmapHeight / 4) & 0xff;
                tileBitmapOffsetX = (tileScriptPos >= 0) ? offsets[tileScriptPos] : false;
                bitmapY = (trueY % tunnelBitmapHeight) & 0xff;
            } else {
                //tileBitmapOffsetX = false;
            }
            
            const minScreenX = (-targetHalfWidth / inverseZFactor) - veerX;
            const maxScreenX = (targetHalfWidth / inverseZFactor) - veerX;
            
            for (let x = -targetHalfWidth; x < targetHalfWidth; ++x) {
                if (x < minScreenX || x > maxScreenX || tileBitmapOffsetX === false || tileBitmapOffsetX === undefined) {
                    // outside of renderable x!
                    target[targetIndex++] = //0;
                    target[targetIndex++] = //0;
                    target[targetIndex++] = 0;
                } else {
                    const trueX = (x + veerX) * inverseZFactor;
                    
                    const bitmapX = (((trueX + targetHalfWidth) >> 1) % 20) & 0xfff;
                    const sourceIndex = (bitmapY * tunnelBitmapWidth + bitmapX + tileBitmapOffsetX) * 4;

                    target[targetIndex++] = source[sourceIndex] * alpha8bit >> 8;
                    target[targetIndex++] = source[sourceIndex + 1] * alpha8bit >> 8;
                    target[targetIndex++] = source[sourceIndex + 2] * alpha8bit >> 8;
                }
                target[targetIndex++] = 255;
            }
        }
        
        tunnelTargetContext.putImageData(tunnelTargetData, 0, 0);
        
        context.drawImage(tunnelTargetCanvas, 0, 64, 640, 384);
        
        if (showWall) {
            context.globalAlpha = (1 - distanceToWallZ / 500);
            context.drawImage(tunnelWall, wallMinX * 2 + halfWidth, wallMinY * 2 + halfHeight, (wallMaxX - wallMinX) * 2, (wallMaxY - wallMinY) * 2);
        }
        
        for (let wall, i = hangingWalls.length; wall = hangingWalls[--i];) {
            const l = wall.minX * 2 + halfWidth;
            const w = (wall.maxX - wall.minX) * 2;
            const t = wall.topY * 2 + halfHeight;
            const h = wall.height;
            
            context.globalAlpha = 1;
            context.fillStyle = "#000000";
            context.fillRect(l, t, w, h);
            
            context.globalAlpha = wall.alpha;
            context.drawImage(tunnelHanger, l, t, w, h);
        }
    }

    async prepare(timeSource, progressCallback) {
        progressCallback(0, 4);

        tunnelBitmap = await this.loadImage('tunnelBits.png');
        progressCallback(1, 4);
        tunnelWall = await this.loadImage('tunnelWall.png');
        progressCallback(2, 4);
        tunnelHanger = await this.loadImage('tunnelHanger.png');
        progressCallback(3, 4);

        tunnelBitmapWidth = tunnelBitmap.naturalWidth;
        tunnelBitmapHeight = tunnelBitmap.naturalHeight;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tunnelBitmapWidth;
        tempCanvas.height = tunnelBitmapHeight;
        const tempContext = tempCanvas.getContext('2d');
        tempContext.drawImage(tunnelBitmap, 0, 0, tunnelBitmapWidth, tunnelBitmapHeight);        
        tunnelBitmapData = tempContext.getImageData(0, 0, tunnelBitmapWidth, tunnelBitmapHeight);
        
        tunnelTargetCanvas = document.createElement('canvas');
        tunnelTargetCanvas.width = targetWidth;
        tunnelTargetCanvas.height = targetHeight;
        tunnelTargetContext = tunnelTargetCanvas.getContext('2d');
        tunnelTargetData = tunnelTargetContext.createImageData(targetWidth, targetHeight);

        // floorScript and roofScript MUST be the exact same length
        floorOffsets = [];
        ceilingOffsets = [];
        for (let i = 0; i < floorScript.length; ++i) {
            const floorTileLetter = floorScript[i];
            if (floorTileLetter == ' ') {
                floorOffsets.push(false);
            } else {
                floorOffsets.push((floorTileLetter.charCodeAt(0) - 97) * 20);
            }
            
            const ceilingTileLetter = ceilingScript[i];
            if (ceilingTileLetter == ' ') {
                ceilingOffsets.push(false);
            } else {
                ceilingOffsets.push((ceilingTileLetter.charCodeAt(0) - 97) * 20);
            }
        }

        progressCallback(4, 4);
    }
}
