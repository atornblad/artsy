'use strict';

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name artsy.min.js
// ==/ClosureCompiler==

(function() {
    // http://bitworld.bitfellas.org/demo.php?id=248
    // http://youtu.be/_5HacABiXUE
    
    // Mr. Pet:
    // Peter Cukierski, Germany
    //
    // Ra:
    // Oliviér Bechard, Manduel, France
    //
    // Moby:
    // Frédéric Motte, France
    //
    // Chaos:
    // Dierk Ohlerich, Germany
    
    // From the demo's end credits:
    // This demo is copyrighted 1993 by Sanity.
    // It is no freeware, shareware or PD, it is forbidden to copy it without permission.
    // This permission is generally granted if you don't charge anything for it, not even a small copying fee!
    
    // Minify, step 1: http://closure-compiler.appspot.com/home
    // Minify, step 2: https://github.com/Siorki/RegPack
    
    const dev = false;
    const autoplay = true;
    const showFrame = false;
    let timeOffset = 0;
    let frameDiff = 1;

    let sinus, livininsanity, whaaaaat, biteArte, deadChicken;
    
    /*
    // *** Null renderer 
    var nullRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Null";
            }
        }

        context.fillStyle = "#000073"
        context.fillRect(0, 0, width, height);
        
        if (chapterOffset > 100) {
            var totalTime = chapterOffset / chapterComplete;
            var timeLeft = totalTime - chapterOffset;
            
            context.fillStyle = "#ffffff";
            context.font = "30px sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("This scene is not yet implemented...", halfWidth, halfHeight);
            context.font = "20px sans-serif";
            context.fillText((timeLeft / 1000).toFixed(1) + " seconds to next implemented scene", halfWidth, halfHeight + 40);
        }
    };
    */

    // *** Intro text scene (renderer 0)
    // http://youtu.be/_5HacABiXUE?t=0m0s
    // 0.0: Presented at the world of Nostradamus
    // 0.1: So just straight off the tricycle
    // 0.2: Whaaaaat??
    
    const introTextRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Intro/midtro text";
            }
        }

        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        context.textAlign = "center";
        context.textBaseline = "top";
        
        let globalAlpha;

        switch (subId) {
            case 0:
                context.scale(-0.5, 1);
                globalAlpha = (chapterOffset >= 4300) ? (4700 - chapterOffset) / 400 : 1;
                context.fillStyle = solidColor(0xbb * globalAlpha, 0xaa * globalAlpha, 0xaa * globalAlpha);
                
                if (chapterOffset >= 1000) {
                    context.font = "50px sans-serif";
                    context.fillText("PRESENTED", -width, 40);
                }
                if (chapterOffset >= 1800) {
                    context.font = "50px sans-serif";
                    context.fillText("A T", -width, 110);
                }
                if (chapterOffset >= 2100) {
                    context.font = "50px sans-serif";
                    context.fillText("THE", -width * 1.2, 180);
                }
                if (chapterOffset >= 2800) {
                    context.font = "50px sans-serif";
                    context.fillText("WORLD", -width * 0.85, 180);
                }
                if (chapterOffset >= 3600) {
                    context.font = "40px sans-serif";
                    context.fillText("O F", -width, 270);
                }
                if (chapterOffset >= 3900) {
                    context.font = "bold 100px sans-serif";
                    context.fillText("NOSTRADAMUS", -width, 360);
                }
                break;
            case 1:
                context.scale(-0.5, 1);
                globalAlpha = (chapterOffset >= 3300) ? (3700 - chapterOffset) / 400 : 1;
                context.fillStyle = solidColor(0x99 * globalAlpha, 0x88 * globalAlpha, 0x88 * globalAlpha);
                
                context.font = "50px sans-serif";
                context.fillText("SO", -width * 1.15, 40);
                
                if (chapterOffset >= 800) {
                    context.font = "50px sans-serif";
                    context.fillText("JUST", -width * 0.9, 40);
                }

                if (chapterOffset >= 1100) {
                context.fillStyle = solidColor(0xbb * globalAlpha, 0xaa * globalAlpha, 0xaa * globalAlpha);
                    context.font = "bold 100px sans-serif";
                    context.fillText("Straight", -width, 120);
                }
                if (chapterOffset >= 2000) {
                    context.font = "50px sans-serif";
                    context.fillText("OFF", -width, 260);
                }
                if (chapterOffset >= 2650) {
                    context.font = "50px sans-serif";
                    context.fillText("THE", -width, 310);
                }
                if (chapterOffset >= 2950) {
                    context.font = "bold 120px sans-serif";
                    context.fillText("tricycle", -width, 360);
                }
                break;
            case 2:
                context.globalAlpha = chapterComplete > 0.25 ? (4/3 - chapterComplete / 3 * 4) :
                                      chapterComplete < 0.1 ? (chapterComplete * 10) :
                                      1;
                context.drawImage(whaaaaat, halfWidth - (whaaaaat.width >> 1), halfHeight - (whaaaaat.height >> 1));
                break;
        }
    }

    // *** Disc tunnel effect (renderer 1)
    // http://youtu.be/_5HacABiXUE?t=2m9s
    // 1.0: Single disc going from near screen to far back and then to near screen again, without alpha changing
    //      4000 ms
    // 1.1: Entering tunnel (starting with 0 discs, building up to all ten), all white discs, all in the middle
    // 1.2: Colored discs appearing (starting far back)
    // 1.3: Bending tunnel - first upward, then far center spinning clockwise, ending by exiting through a single disc
    //      16000 ms
    
    let discIndexOffset = 0;
    let discZOffset = 0;
    let discRotation = 0;
    let discColoredMinIndex = 10;
    let discOffsetMinZ = 1050;
    let discRenderMinIndex = 9;
    let discRenderMaxIndex = 9;
    let discFarA = 32768;
    const discColors = [
        {r : 255, g : 255, b : 255},
        {r : 255, g : 64, b : 128},
        {r : 255, g : 255, b : 255},
        {r : 96, g : 240, b : 255}
    ];
    
    const discTunnelRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Disc tunnel";
            }
        }
//        var smoothCC = smoothComplete(chapterComplete);

        context.fillStyle = "#240000";
        context.fillRect(0, 0, width, height);
        
        const centerX = halfWidth;
        const centerY = halfHeight;
        const discFarX = centerX + largestHalf * sinus[discFarA];
        const discFarY = centerY + largestHalf * sinus[(discFarA + 16384) % 65536];
        
        const zOffset = (subId == 0) ? ((sinus[(chapterOffset * 32768 / 4000) & 0xffff]) * 800) : discZOffset;
        const maxDisc = (subId == 0) ? 0 : discRenderMaxIndex;
        const minDisc = (subId == 0) ? 0 : discRenderMinIndex;
        
        for (let disc = maxDisc; disc >= minDisc; --disc) {
            const z = 50 + 100 * disc + zOffset; // From 50 to (50 + 10 * 10) = 1050 
            const alpha = (subId == 0) ? 1 : 1 - (z - 50) / 1000;
            
            const zForOffset = z - discOffsetMinZ;
            const alphaForOffset = Math.min(1, 1 - (zForOffset - 50) / 1000);
            
            const colorIndex = (disc >= discColoredMinIndex) ? (disc + discIndexOffset) % 4 : 0;
            const color = discColors[colorIndex];
            
            const discX = (centerX * alphaForOffset) + (discFarX * (1 - alphaForOffset));
            const discY = (centerY * alphaForOffset) + (discFarY * (1 - alphaForOffset));
                
            context.beginPath();
            for (let a = 0; a <= 65536; a += 256) {
                const outerA = (a * 10) % 65536;
                
                const radius = (1 + sinus[outerA] * 0.3) * halfWidth;
                const x = discX + ((100 / z) * radius) * sinus[(a + discRotation) % 65536];
                const y = discY + ((100 / z) * radius) * sinus[(a + 16384 + discRotation) % 65536];
                
                if (a) {
                    context.lineTo(x, y);
                } else {
                    context.moveTo(x, y);
                }
            }

            for (let a = 65536; a >= 0; a -= 4096) {
                const radius = halfWidth;
                
                const x = discX + ((100 / z) * radius) * sinus[(a + discRotation) % 65536];
                const y = discY + ((100 / z) * radius) * sinus[(a + 16384 + discRotation) % 65536];
                
                context.lineTo(x, y);
            }

            context.closePath();
            
            const r = (color.r * alpha) + (0x24 * (1 - alpha));
            const g = (color.g * alpha);
            const b = (color.b * alpha);
            
            context.fillStyle = solidColor(r, g, b);
            context.fill();
        }
        
        let newDiscZOffset = (discZOffset - 9 * frameDiff);
        while (newDiscZOffset < 0) {
            ++discIndexOffset;
            newDiscZOffset += 100;
            if (subId >= 2 && discColoredMinIndex > 0) {
                --discColoredMinIndex;
            }
            if (subId >= 1 && discRenderMinIndex > 0) {
                --discRenderMinIndex;
            }
            if (subId == 3 && chapterOffset > (16000 - 1050 / 9 * 1000 / 60)) {
                --discRenderMaxIndex;
            }
        }
        discZOffset = newDiscZOffset | 0;
            
        discRotation = (discRotation + 65536 - 473 * frameDiff) & 0xffff;

        if (subId == 3) {
            if (discOffsetMinZ > 0) {
                discOffsetMinZ -= 9 * frameDiff;
            } else {
                discOffsetMinZ = 0;
                discFarA = (discFarA + 65536 - 100 * frameDiff) & 0xffff;
            }
            
        }
    };
    
    // *** Bitmap tunnel effect (renderer 2)
    // http://youtu.be/_5HacABiXUE?t=0m11s
    
    let tunnelBitmap, tunnelBitmapWidth, tunnelBitmapHeight, tunnelBitmapData
    let tunnelTargetCanvas, tunnelTargetContext, tunnelTargetData;
    let tunnelWall, tunnelHanger;
    const targetWidth = 320;
    const targetHalfWidth = targetWidth / 2;
    const targetHeight = (height - 128) / 2;
    const targetHalfHeight = targetHeight / 2;
    const tunnelSpeedFactor = 2;
    
    const floorScript =   "    aaa aaaabbbb ccccaabbccccbddddaaaaaabbbbccdda abdbccdccc    caaabbbbbaaabbbb ccccaabbccccbdaaabbcccdaaa aaaabbbbaaabbcccdaaabbabbcab";
    const ceilingScript = "    aaa aabbccddadddddaabbccdd aaabbcccdaaa aaaabbbb ccccbbb    cc ddddaaddddaaaaaabbbbccdda abccccaabbccccbddddaaaaaabbccddadddddaabbcc";
    
    let floorOffsets, ceilingOffsets;
    
    const bitmapTunnelPrepare = () => {
        tunnelBitmapWidth = tunnelBitmap.width;
        tunnelBitmapHeight = tunnelBitmap.height;
        
        const tempCanvas = create("CANVAS");
        tempCanvas.width = tunnelBitmapWidth;
        tempCanvas.height = tunnelBitmapHeight;

        const tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(tunnelBitmap, 0, 0, tunnelBitmapWidth, tunnelBitmapHeight);
        
        tunnelBitmapData = tempContext.getImageData(0, 0, tunnelBitmapWidth, tunnelBitmapHeight);
        
        tunnelTargetCanvas = create("CANVAS");
        tunnelTargetCanvas.width = targetWidth;
        tunnelTargetCanvas.height = targetHeight;
        tunnelTargetContext = tunnelTargetCanvas.getContext("2d");
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
    };
    
    const hangingWallDistance = 120;
    
    const bitmapTunnelRenderer = (canvas, context, subId, chapterOffset, chapterComplete, frameDiff, quality) => {
        if (dev) {
            if (subId == "getName") {
                return "Bitmap tunnel";
            }
        }
        
        const target = tunnelTargetData.data;
        const source = tunnelBitmapData.data;
        
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
        
        let veerOffset = chapterOffset - 15000;
        if (veerOffset < 0)
            veerOffset = 0;
        else if (veerOffset < (16384/5))
            veerOffset = 16384/5*smoothComplete(veerOffset/16384*5);
            const veer = 0.25 * sinus[(veerOffset * 5) & 0xffff];
        
        const zFocus = -150;
        const yFocus = 0;
        const zScreen = -100;
        const zFloor = 0;
        const yFloor = 288;
        const yCeiling = -288;
        
        let slopeOffset = chapterOffset - 5000;
        if (slopeOffset < 0)
            slopeOffset = 0;
            const trueSlope = sinus[(slopeOffset * 7) & 0xffff] * 1.5;
        
        // Floor equation: y = a*z+b, where b = yFloor, a = slope
        
        const millisUntilEnd = chapterOffset ? (chapterOffset / chapterComplete - chapterOffset) : 30000;
        const millisUntilMid = 15300 - chapterOffset;
        
        const millisUntilWall = millisUntilMid > 0 ? millisUntilMid : millisUntilEnd;
        
        const distanceToWallZ = millisUntilWall / tunnelSpeedFactor;
        const showWall = (distanceToWallZ < 500 && distanceToWallZ > 0);
        let wallMinY = maxY, wallMaxY = -maxY;
        let wallMinX, wallMaxX;
        
        let nextHangingWallZ = (chapterOffset > 16500) ? (1100 - (chapterOffset / tunnelSpeedFactor) % 1600) : 20000;
        let maxHangingWallIterations = 4;
        while (nextHangingWallZ < 0) {
            --maxHangingWallIterations;
            nextHangingWallZ += hangingWallDistance;
        }
        const hangingWalls = [];
        
        const yAdd = Math.round((1 / quality));
        for (let y = -maxY; y <= maxY; y += yAdd) {
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
                const trueY = z + chapterOffset / tunnelSpeedFactor;
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
            if (yAdd != 1) {
                const lineSize = targetWidth * 4;
                const skipSize = (yAdd - 1) * lineSize;
                for (let skip = 0; skip < skipSize; ++skip) {
                    target[targetIndex] = target[targetIndex - lineSize]
                    ++targetIndex;
                }
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
    };
    
    // *** Dead chicken effect (renderer 3)
    // http://youtu.be/_5HacABiXUE?t=0m48s
    
    // 3.0: biteArte
    // 3.1: chicken around biteArte
    // 3.2: chicken and biteArte
    
    const deadChickenRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Dead chicken";
            }
        }
        
        const angle = chapterOffset * 19 + 10000;
        
        context.fillStyle = "#441010";
        context.fillRect(0, 0, width, height);
        
        let x = halfWidth / 2 * sinus[angle & 65535],
            x2 = halfWidth / 2 * sinus[(angle + 32768) & 65535]
        const z = sinus[(angle + 16384) & 65535],
            z2 = -z;
        const mult = 2 / (2 - z),
            mult2 = 2 / (2 - z2);
        x *= mult;
        x2 *= mult2;
        
        const biteWidth = biteArte.width;
        const biteHeight = biteArte.height;
        
        const chickenWidth = deadChicken.width;
        const chickenHeight = deadChicken.height;

        let w, h, w2, h2;
        
        switch (subId) {
            case 0:
                context.globalAlpha = chapterComplete < 0.2 ? chapterComplete * 5 :
                                      chapterComplete < 0.8 ? 1 :
                                      (5 - chapterComplete * 5);
                w = biteWidth * mult;
                h = biteHeight * mult;
                context.drawImage(biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                break;
            case 1:
                context.globalAlpha = chapterComplete < 0.2 ? chapterComplete * 5 :
                                      chapterComplete < 0.8 ? 1 :
                                      (5 - chapterComplete * 5);
                w = chickenWidth * mult;
                h = chickenHeight * mult;
                if (z > 0) {
                    context.drawImage(biteArte, halfWidth - biteWidth / 2, halfHeight - biteHeight / 2);
                }
                context.drawImage(deadChicken, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                if (z <= 0) {
                    context.drawImage(biteArte, halfWidth - biteWidth / 2, halfHeight - biteHeight / 2);
                }
                break;
            case 2:
                context.globalAlpha = chapterComplete < 0.1 ? chapterComplete * 10 :
                                      chapterComplete < 0.9 ? 1 :
                                      (10 - chapterComplete * 10);
                w = biteWidth * mult;
                h = biteHeight * mult;
                w2 = chickenWidth * mult2;
                h2 = chickenHeight * mult2;

                if (z2 > 0) {
                    context.drawImage(biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                }
                context.drawImage(deadChicken, halfWidth + x2 - w2 / 2, halfHeight - h2 / 2, w2, h2);
                if (z2 <= 0) {
                    context.drawImage(biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                }
                break;
        }
    };
    
    // *** Globe effect (renderer 4)
    
    let globeCanvas, globeContext, globeImageData, globeMultTable,
        globe, globeDoodles, globeDoodleBits;
    
    const prepareGlobe = function() {
        globeCanvas = create("CANVAS");
        globeCanvas.width = globeCanvas.height = 224;
        globeContext = globeCanvas.getContext("2d");
        globeImageData = globeContext.createImageData(224, 224);
        
        const mults = [];
        
        for (let x = 0; x <= 224; ++x) {
            const fromNegToPos = x / 112 - 1;
            const arccos = Math.acos(fromNegToPos);
            const sin = Math.sin(arccos);
            mults.push(sin);
        }
        
        globeMultTable = mults;
        
        const tempCanvas = create("CANVAS");
        tempCanvas.width = 512;
        tempCanvas.height = 512;
        const tempContext = tempCanvas.getContext("2d");
        tempContext.clearRect(0, 0, 512, 512);
        tempContext.drawImage(globeDoodles, 0, 0);
        const tempData = tempContext.getImageData(0, 0, 512, 512).data;
        globeDoodleBits = Array(512 * 512);
        let index = 0;
        for (let y = 0; y < 512; ++y) {
            for (let x = 0; x < 512; ++x) {
                globeDoodleBits[index] = (tempData[index * 4] > 128) ? 112 : 0;
                ++index;
            }
        }
    };
    
    const globeRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Globe";
            }
        }
        
        context.fillStyle = "#110000";
        context.fillRect(0, 0, width, height);
        
        const w = globe.width;
        const h = globe.height;
        
        context.drawImage(globe, halfWidth - w, halfHeight - h, w * 2, h * 2);
        
        const buffer = globeImageData.data;
        
        const xOffset = (sinus[(chapterOffset * 23) & 0xffff] * ((512 - 224) / 2) + 256 - 112) | 0;
        const yOffset = (sinus[(chapterOffset * 17) & 0xffff] * ((512 - 224) / 2) + 256 - 112) | 0;
        
        let index = 0;
        for (let y = 0; y <= 223; ++y) {
            for (let x = 0; x <= 223; ++x) {
                let alpha = 0;
                buffer[index++] = 255;
                buffer[index++] = 255;
                buffer[index++] = 255;
                
                const yMult = globeMultTable[x];
                
                if (yMult > 0) {
                    const yFromMiddle = y - 112;
                    const trueYFromMiddle = (yFromMiddle / yMult) | 0;
                    const trueY = trueYFromMiddle + 112;
                    
                    if (trueY >= 0 && trueY <= 223) {
                        const fetch = (trueY + yOffset) * 512 + x + xOffset;
                        alpha = globeDoodleBits[fetch];
                    }
                }

                buffer[index++] = alpha;
            }
        }
        
        globeContext.putImageData(globeImageData, 0, 0);
        
        context.drawImage(globeCanvas, halfWidth - 224, halfHeight - 224, 448, 448);
        
        if (chapterOffset < 512) {
            context.fillStyle = "#441000";
            context.fillRect(0, 0, width, 256 - chapterOffset / 2);
            context.fillRect(0, height - 256 + chapterOffset / 2, width, 256 - chapterOffset / 2);
        }
        
        if (chapterComplete > 0.95) {
            const alpha = chapterComplete * 20 - 19;
            context.fillStyle = "rgba(0,0,0," + alpha.toFixed(3) + ")";
            context.fillRect(0, 0, width, height);
        }
    };
    
    /// *** Simple image screens (renderer 5)
    
    // 5.0: Sanity 1
    // 5.1: Madman
    // 5.2: Einstein
    // 5.3: Sanity 2
    
    let sanity1, madman, einstein, sanity2;
    const simpleImages = [];
    
    const prepareSimpleImages = function() {
        simpleImages.push({
            fadeFrom : "#ffffff",
            fadeTo : "#000000",
            image : sanity1,
            scale : 2
        });
        simpleImages.push({
            fadeFrom : "#000000",
            fadeTo : "#441010",
            image : madman,
            scale : 2
        });
        simpleImages.push({
            fadeFrom : "#ffffff",
            fadeTo : "#000000",
            image : einstein,
            scale : 2
        });
        simpleImages.push({
            fadeFrom : "#000000",
            fadeTo : "#000000",
            image : sanity2,
            scale : 2
        });
    };
    
    const simpleImageRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Simple image";
            }
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        const imageData = simpleImages[subId];
        const image = imageData.image;
        const iw = image.width * imageData.scale;
        const ih = image.height * imageData.scale;
        context.drawImage(image, halfWidth - (iw >> 1), halfHeight - (ih >> 1), iw, ih);
        
        if (chapterOffset < 500) {
            context.globalAlpha = (1 - chapterOffset / 500);
            context.fillStyle = imageData.fadeFrom;
            context.fillRect(0, 0, width, height);
        } else {
            const totalTime = chapterOffset / chapterComplete;
            const timeLeft = totalTime - chapterOffset;
            
            if (timeLeft < 500) {
                context.globalAlpha = (1 - timeLeft / 500);
                context.fillStyle = imageData.fadeTo;
                context.fillRect(0, 0, width, height);
            }
        }
    };
    
    /// *** Stars (renderer 6)
    
    // 6.0: HTML5 logo coming towards the viewer
    // 6.1: Starfield
    
    const html5Coords = (function() {
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
    
    const starsRandomCoords = (function() {
        const result = [];
        for (let i = 0; i < 1000; ++i) {
            result.push(
                        {
                            x : rnd() * 1024 - 512,
                            y : rnd() * 1024 - 512,
                            z : rnd() * 1024 - 512
                        });
        }
        
        return result;
    })();
    
    const limitStarCoord = function(composant) {
        if (composant > 512) {
            return composant - 1024 * Math.floor((composant + 512) / 1024);
        } else if (composant < -512) {
            return composant + 1024 * Math.floor((512 - composant) / 1024);
        } else {
            return composant;
        }
    }
    
    const phaseXStarts = 14000;
    const beatStarts = 15100; // 15.1 seconds into subId 1
    
    const starsRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff, quality) {
        if (dev) {
            if (subId == "getName") {
                return "Stars";
            }
        }
        
        let fade = 1;
        if (chapterComplete > 0.95) {
            fade = (1 - chapterComplete) * 20;
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        let coords, phaseX, phaseY, phaseZ, offsetZ, maxStars;
        
        switch (subId) {
            case 0:
                // html5 logo
                coords = html5Coords;
                phaseX = phaseY = phaseZ = 0;
                if (dev) {
                    chapterOffset %= 4000;
                    chapterComplete = chapterOffset / 4000;
                }
                offsetZ = 1024 - chapterComplete * 2048;
                maxStars = chapterOffset / 4 * quality;
                break;
            case 1:
                // random stars
                coords = starsRandomCoords;
                offsetZ = 0;
                //phaseZ = sinus[chapterOffset] * 2048;
                phaseX = phaseY = phaseZ = offsetZ = 0;
                maxStars = chapterOffset / 4 * quality;
                phaseZ = -chapterOffset / 10;
                let weight = 0;
                if (chapterOffset > 6000) {
                    weight = 1;
                } else if (chapterOffset > 2000) {
                    weight = smoothComplete((chapterOffset - 2000) / 4000);
                }
                phaseZ += weight * sinus[(chapterOffset * 5 + 30000) & 0xffff] * 2048;
                phaseY = weight * sinus[(chapterOffset * 2 + 54000) & 0xffff] * 1024;
                
                if (chapterOffset > phaseXStarts + 4000) {
                    weight = 1;
                } else if (chapterOffset > phaseXStarts) {
                    weight = smoothComplete((chapterOffset - phaseXStarts) / 4000);
                } else {
                    weight = 0;
                }
                phaseX = weight * sinus[((chapterOffset - phaseXStarts) * 3) & 0xffff] * 3072;
                break;
        }
        
        if (maxStars > coords.length) {
            maxStars = coords.length;
        }
        
//        while (phaseZ < -512) phaseZ += 1024;
//        while (phaseZ > 512) phaseZ -= 1024;
        
        context.fillStyle = "#ffffff";
        
        for (let i = 0; i < maxStars; ++i) {
            const star = coords[i];
            
            // Phase
            const x = limitStarCoord(star.x + phaseX);
            const y = limitStarCoord(star.y + phaseY);
            const z = limitStarCoord(star.z + phaseZ) + offsetZ;
            
            if (z > -1000 && z < 1000) {
                const zMultFactor = 512 / (z + 1024);
                
                const screenX = halfWidth + zMultFactor * x;
                const screenY = halfHeight + zMultFactor * y;
                
                if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
                    let alpha = (512 - z) / 1024;
                    if (alpha < 0) alpha = 0; else if (alpha > 1) alpha = 1;
                    context.globalAlpha = alpha * fade;
                    context.fillRect(screenX, screenY, 2, 2);
                }
            }
        }
        
        let beatOffset = chapterOffset - beatStarts;
        
        if (beatOffset >= 0) {
            const beatNumber = (beatOffset / 480 / 8) | 0;
            beatOffset = (beatOffset % 480) | 0;
            
            if (beatOffset < 240) {
                context.globalAlpha = 1;
                context.textAlign = "left";
                context.textBaseline = "top";
            
                switch (beatNumber) {
                    case 0:
                        context.fillStyle = "#999999";
                        context.font = "40px sans-serif";
                        context.fillText("Anders Marzi Tornblad", 10, 10);
                        context.fillStyle = "#666666";
                        context.font = "30px sans-serif";
                        context.fillText("JavaScript, 2013", 10, 55);
                        context.fillStyle = "#666666";
                        context.font = "20px sans-serif";
                        context.fillText("Revisited in 2022", 10, 90);
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
    };
    
    // *** Fat Buddha scene (renderer 7)
    
    let buddha, buddhaBits, buddhaCanvas, buddhaContext, buddhaData;
    const buddhaSceneWidth = 100, buddhaSceneHeight = 100;
    const buddhaFinalScale = 4, buddhaHalfFinalScale = buddhaFinalScale / 2;
    
    const buddhaPrepare = function() {
        // Fetch bits from buddhaBits
        const tempCanvas = create("CANVAS");
        tempCanvas.width = tempCanvas.height = 128;
        const tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(buddha, 0, 0);
        buddhaBits = tempContext.getImageData(0, 0, 128, 128);
        
        // Draw them onto buddhaCanvas, and then blit using drawImage onto the main canvas, stretched
        buddhaCanvas = create("CANVAS");
        buddhaCanvas.width = buddhaSceneWidth;
        buddhaCanvas.height = buddhaSceneHeight;
        buddhaContext = buddhaCanvas.getContext("2d");
        buddhaData = buddhaContext.createImageData(buddhaSceneWidth, buddhaSceneHeight);
    };
    
    const fatBuddhaRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Fat Buddha";
            }
        }
        
        // Clear scene
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        const angle1 = 65536 * (sinus[(smoothComplete(chapterComplete) * 65536) & 0xffff] * 1.5 - 0.5);
        const scale1 = smoothComplete(chapterComplete) * 0.5 + 0.5;
        
        const angle2 = smoothComplete(chapterComplete) * 65536 * 4;
        const scale2 = (chapterComplete < 0.8) ? 0.5 :
                     (chapterComplete < 0.9) ? 0.5 - (chapterComplete - 0.8) * 2.5 :
                     smoothComplete((chapterComplete - 0.9) * 10) * 3.75 + 0.25;
//        var scale2 = (chapterComplete < 0.7) ? 0.25 : smoothComplete((chapterComplete - 0.7) / 0.3) * 3.75 + 0.25
        
        const offsetX1 = sinus[angle2 & 65535] * 80 + 50;
        const offsetY1 = sinus[(angle2 + 23000) & 65535] * 72;
        
        const offsetX2 = sinus[angle1 & 65535] * 50 + 52;
        const offsetY2 = -40;
        
        // Fetch bits from buddhaBits, draw onto buddhaCanvas (via buddhaData);
        const sourceData = buddhaBits.data;
        const targetData = buddhaData.data;
        let targetIndex = 0;
        for (let y = 0; y < buddhaSceneHeight; ++y) {
            for (let x = 0; x < buddhaSceneWidth; ++x) {
                const yy = y - buddhaSceneHeight / 2;
                const xx = x - buddhaSceneWidth / 2;
                
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
                
                let secondWeight = (x + y - buddhaSceneWidth * 2) / (buddhaSceneWidth * 2) + chapterComplete * 2;
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
        }
        
        // Blit buddhaData to buddhaCanvas
        buddhaContext.putImageData(buddhaData, 0, 0);
        
        // Stretch and draw buddhaCanvas onto main canvas
        context.drawImage(buddhaCanvas, halfWidth - buddhaSceneWidth * buddhaHalfFinalScale, halfHeight - buddhaSceneHeight * buddhaHalfFinalScale, buddhaSceneWidth * buddhaFinalScale, buddhaSceneHeight * buddhaFinalScale);
        
        context.fillStyle = "#998888";
        context.textAlign = "center";
        context.font = "italic 50px serif";
        context.textBaseline = "top";
        context.fillText("Learning", halfWidth, 0);
        
        context.font = "italic 25px serif";
        context.textBaseline = "top";
        context.fillText("By reinventing the wheel", halfWidth, halfHeight - buddhaSceneHeight * buddhaHalfFinalScale + buddhaSceneHeight * buddhaFinalScale);
        
        if (chapterComplete < 0.05) {
            context.fillStyle = "rgba(0,0,0," + (1 - chapterComplete * 20).toFixed(3) + ")";
            context.fillRect(0, 0, width, height);
        }
        
        if (chapterComplete > 0.9) {
            context.fillStyle = "rgba(0,0,0," + (chapterComplete * 10 - 9).toFixed(3) + ")";
            context.fillRect(0, 0, width, height);
        }
    };
    
    // *** Hail Salvadore (renderer 8)
    
    // 8.0: Hail Salvadore...
    // 8.1: ...true artists
    
    let hailSalvadore, trueArtists;
    
    const hailSalvadoreData = [
        { from: 0,    x: 78,  y: 0,   w: 131, h: 81 }, // Head
        { from: 800,  x: 0,   y: 91,  w: 69,  h: 22 }, // hail
        { from: 1200, x: 85,  y: 91,  w: 216, h: 22 }, // salvadore
        { from: 2100, x: 63,  y: 119, w: 91,  h: 22 }, // who
        { from: 2700, x: 170, y: 119, w: 76,  h: 22 }, // has
        { from: 2900, x: 74,  y: 148, w: 154, h: 28 }, // proved
        { from: 3100, x: 21,  y: 181, w: 93,  h: 22 }, // that
        { from: 3400, x: 128, y: 181, w: 151, h: 23 }  // loonies
    ];
    
    const trueArtistsData = [
        { from: 0,    x: 67,  y: 0,   w: 70,  h: 16  }, // are
        { from: 800,  x: 10,  y: 34,  w: 48,  h: 18  }, // the
        { from: 1100, x: 0,   y: 53,  w: 60,  h: 35  }, // only (left part)
        { from: 1100, x: 63,  y: 41,  w: 45,  h: 47  }, // only (right part)
        { from: 1900, x: 119, y: 46,  w: 84,  h: 36  }, // true
        { from: 2300, x: 6,   y: 102, w: 216, h: 43  }, // artists
        { from: 2900, x: 41,  y: 154, w: 128, h: 100 }  // Head
    ];
    
    const hailSalvadoreRenderer = function(canvas, context, subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Hail Salvadore";
            }
        }
        
        // Clear scene
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        const data = subId ? trueArtistsData : hailSalvadoreData;
        const img = subId ? trueArtists : hailSalvadore;
        const offsetY = subId ? 0 : 60;
        const offsetX = halfWidth - img.width / 2;
        
        context.globalAlpha = (chapterComplete < 0.9) ? 1 : (10 - chapterComplete * 10);
        
        for (let i = 0; i < data.length; ++i) {
            const item = data[i];
            if (chapterOffset > item.from) {
                context.drawImage(img, item.x, item.y, item.w, item.h, item.x + offsetX, item.y * 2 + offsetY, item.w, item.h * 2);
            }
        }
    };
    
    const renderers = [
            introTextRenderer,
            discTunnelRenderer,
            bitmapTunnelRenderer,
            deadChickenRenderer,
            globeRenderer,
            simpleImageRenderer,
            starsRenderer,
            fatBuddhaRenderer,
            hailSalvadoreRenderer
        ];

    const chapters = [
        {
            from : 0,
            to : 4700,
            rendererIndex : 0,
            subId : 0
        }, {
            from : 4700,
            to : 8400,
            rendererIndex : 0,
            subId : 1
        }, {
            from : 8400,
            to : 9500,
            rendererIndex : 0,
            subId : 2
        }, {
            from : 9500,
            to : 40000,
            rendererIndex : 2,
            subId : 0
        }, {
            from : 40000,
            to : 44000,
            rendererIndex : 5,
            subId : 0
        }, {
            from : 44000,
            to : 48000,
            rendererIndex : 5,
            subId : 1
        }, {
            from : 48000,
            to : 52000,
            rendererIndex : 3,
            subId : 0
        }, {
            from : 52000,
            to : 56000,
            rendererIndex : 3,
            subId : 1
        }, {
            from : 56000,
            to : 63300,
            rendererIndex : 3,
            subId : 2
        }, {
            from : 63300,
            to : 82500,
            rendererIndex : 4,
            subId : 0
        }, {
            from : 82500,
            to : 90000,
            rendererIndex : 5,
            subId : 2
        }, {
            from : 90000,
            to : 94000,
            rendererIndex : 5,
            subId : 3
        }, {
            from : 94000,
            to : 98000,
            rendererIndex : 6,
            subId : 0
        }, {
            from : 98000,
            to : 128500,
            rendererIndex : 6,
            subId : 1
        }, {
            from : 128500,
            to : 132500,
            rendererIndex : 1,
            subId : 0
        }, {
            from : 132500,
            to : 139500,
            rendererIndex : 1,
            subId : 1
        }, {
            from : 139500,
            to : 147000,
            rendererIndex : 1,
            subId : 2
        }, {
            from : 147000,
            to : 163000,
            rendererIndex : 1,
            subId : 3
        }, {
            from : 163000,
            to : 178300,
            rendererIndex : 7,
            subId : 0
        }, {
            from : 178300,
            to : 182300,
            rendererIndex : 8,
            subId : 0
        }, {
            from : 182300,
            to : 188000,
            rendererIndex : 8,
            subId : 1
        },
        false
    ];
    
    const preCalcSinusTables = function() {
        const sin = [];
        
        for (let i = 0; i <= 65535; ++i) {
            const value = Math.sin(i * pi / 32768);
            sin.push(value);
        }
        
        sinus = sin;
    };

    const precalcs = [
        preCalcSinusTables,
        prepareGlobe,
        prepareSimpleImages,
        bitmapTunnelPrepare,
        buddhaPrepare
    ];
    
    const onDemoDone = function() {
        window.location.href = "part-2/";
    };

    const loadResources = () => {
        livininsanity = loadAudio("livin-insanity.ogg", "livin-insanity.mp3");
        whaaaaat = loadImage("whaaaaat.png");
        biteArte = loadImage("biteArte2.png");
        deadChicken = loadImage("deadChicken2.png");
        globe = loadImage("globe.png");
        globeDoodles = loadImage("globeDoodles.png");
        sanity1 = loadImage("sanity1.png");
        madman = loadImage("madman.png");
        tunnelBitmap = loadImage("tunnelBits.png");
        tunnelWall = loadImage("tunnelWall.png");
        tunnelHanger = loadImage("tunnelHanger.png");
        einstein = loadImage("einstein.png");
        sanity2 = loadImage("sanity2.png");
        buddha = loadImage("seventies.png");
        hailSalvadore = loadImage("hailSalvadore.png");
        trueArtists = loadImage("trueArtists.png");
    };

    const play = () => livininsanity.play();
    
    demo(renderers, chapters, precalcs, loadResources, play, onDemoDone);

})();
