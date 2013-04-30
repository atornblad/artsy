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
    // ???, Manduel, France
    //
    // Chaos:
    // Dierk Ohlerich, Germany
    
    // From the demo's end credits:
    // This demo is copyrighted 1993 by Sanity.
    // It is no freeware, shareware or PD, it is forbidden to copy it without permission.
    // This permission is generally granted if you don't charge anything for it, not even a small copying fee!
    
    // Minify, step 1: http://closure-compiler.appspot.com/home
    // Minify, step 2: https://github.com/Siorki/RegPack
    
    var dev = false;
    var autoplay = true;
    var rnd = Math.random;
    var create = function(elementName) { return document.createElement(elementName); };
    var timeOffset = 0;
    var frameDiff = 1;
    
    var solidColor = function(r, g, b) {
        return "rgba(" + (r|0) + "," + (g|0) + "," + (b|0) + ",1)";
    };
    
    var getAny = function(names, target, fallback) {
        for (var i = 0; i < names.length; ++i) {
            var name = names[i];
            if (target[name]) {
                return target[name];
            }
        }
        
        return fallback;
    };
    
    var now = function() {
        return (new Date).getTime();
    };
    
    var reqAnimFrameFallback = function(func) {
        var now = (new Date).getTime();
        var next = (now - (now % 17)) + 17;
        var diff = next - now;
        if (diff < 5) diff = 17;
        window.setTimeout(function() {
            func.call(window, (new Date).getTime())
        }, diff);
    };
    
    var requestAnimationFrame = getAny([
        "requestAnimationFrame",
        "mozRequestAnimationFrame",
        "webkitRequestAnimationFrame"
    ], window, reqAnimFrameFallback);
    
    var width = 640;
    var height = 512;
    
    var pi = 4 * Math.atan(1);
    
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    var largestHalf = Math.max(halfWidth, halfHeight);
    
/*    var smoothComplete = function(chapterComplete) {
        return (1 - Math.cos(chapterComplete * pi)) / 2;
    };*/

    var canvas, context, sinus, currentQuality,
        lastTime, startTime, currentTime, currentChapterIndex = 0, currentRenderer,
        playing, livininsanity, select,
        whaaaaat, biteArte, deadChicken;
    
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
    

    // *** Intro text scene (renderer 0)
    // http://youtu.be/_5HacABiXUE?t=0m0s
    // 0.0: Presented at the world of Nostradamus
    // 0.1: So just straight off the tricycle
    // 0.2: Whaaaaat??
    
    var introTextRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Intro/midtro text";
            }
        }

        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        context.textAlign = "center";
        context.textBaseline = "top";
        
        if (subId != 2) {
            context.scale(-0.5, 1);
        }
        switch (subId) {
            case 0:
                var globalAlpha = (chapterOffset >= 4300) ? (4700 - chapterOffset) / 400 : 1;
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
                    context.font = "100px sans-serif";
                    context.fillText("NOSTRADAMUS", -width, 360);
                }
                break;
            case 1:
                var globalAlpha = (chapterOffset >= 3300) ? (3700 - chapterOffset) / 400 : 1;
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
                                      chapterComplete < 0.05 ? (chapterComplete * 20) :
                                      1;
                var w = whaaaaat.width;
                var h = whaaaaat.height;
                context.drawImage(whaaaaat, halfWidth - (w >> 1), halfHeight - (h >> 1));
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
    
    var discIndexOffset = 0;
    var discZOffset = 0;
    var discRotation = 0;
    var discColoredMinIndex = 10;
    var discOffsetMinZ = 1050;
    var discRenderMinIndex = 9;
    var discRenderMaxIndex = 9;
    var discFarA = 32768;
    var discColors = [
        {r : 255, g : 255, b : 255},
        {r : 255, g : 64, b : 128},
        {r : 255, g : 255, b : 255},
        {r : 96, g : 240, b : 255}
    ];
    
    var discTunnelRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Disc tunnel";
            }
        }
//        var smoothCC = smoothComplete(chapterComplete);

        context.fillStyle = "#240000";
        context.fillRect(0, 0, width, height);
        
        var centerX = halfWidth;
        var centerY = halfHeight;
        var discFarX = centerX + largestHalf * sinus[discFarA];
        var discFarY = centerY + largestHalf * sinus[(discFarA + 16384) % 65536];
        
        var zOffset = (subId == 0) ? ((sinus[(chapterOffset * 32768 / 4000) & 0xffff]) * 800) : discZOffset;
        var maxDisc = (subId == 0) ? 0 : discRenderMaxIndex;
        var minDisc = (subId == 0) ? 0 : discRenderMinIndex;
        
        for (var disc = maxDisc; disc >= minDisc; --disc) {
            var z = 50 + 100 * disc + zOffset; // From 50 to (50 + 10 * 10) = 1050 
            var alpha = (subId == 0) ? 1 : 1 - (z - 50) / 1000;
            
            var zForOffset = z - discOffsetMinZ;
            var alphaForOffset = 1 - (zForOffset - 50) / 1000;
            if (alphaForOffset > 1) alphaForOffset = 1;
            
            var colorIndex = (disc >= discColoredMinIndex) ? (disc + discIndexOffset) % 4 : 0;
            var color = discColors[colorIndex];
            
            var discX = (centerX * alphaForOffset) + (discFarX * (1 - alphaForOffset));
            var discY = (centerY * alphaForOffset) + (discFarY * (1 - alphaForOffset));
                
            context.beginPath();
            for (var a = 0; a <= 65536; a += 256) {
                var outerA = (a * 10) % 65536;
                
                var radius = (1 + sinus[outerA] * 0.3) * halfWidth;
                var x = discX + ((100 / z) * radius) * sinus[(a + discRotation) % 65536];
                var y = discY + ((100 / z) * radius) * sinus[(a + 16384 + discRotation) % 65536];
                
                if (a) {
                    context.lineTo(x, y);
                } else {
                    context.moveTo(x, y);
                }
            }

            for (var a = 65536; a >= 0; a -= 4096) {
                var radius = halfWidth;
                
                var x = discX + ((100 / z) * radius) * sinus[(a + discRotation) % 65536];
                var y = discY + ((100 / z) * radius) * sinus[(a + 16384 + discRotation) % 65536];
                
                context.lineTo(x, y);
            }

            context.closePath();
            
            var r = (color.r * alpha) + (0x24 * (1 - alpha));
            var g = (color.g * alpha);
            var b = (color.b * alpha);
            
            context.fillStyle = "rgba(" + r.toFixed(0) + "," + g.toFixed(0) + "," + b.toFixed(0) + ",1)";
            context.fill();
        }
        
        var newDiscZOffset = (discZOffset - 9 * frameDiff);
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
    
    var tunnelBitmap, tunnelBitmapWidth, tunnelBitmapHeight, tunnelBitmapData
    var tunnelTargetCanvas, tunnelTargetContext, tunnelTargetData;
    var targetWidth = 320;
    var targetHalfWidth = targetWidth / 2;
    var targetHeight = (height - 128) / 2;
    var targetHalfHeight = targetHeight / 2;
    
    var bitmapTunnelPrepare = function() {
        tunnelBitmapWidth = tunnelBitmap.width;
        tunnelBitmapHeight = tunnelBitmap.height;
        
        var tempCanvas = create("CANVAS");
        tempCanvas.width = tunnelBitmapWidth;
        tempCanvas.height = tunnelBitmapHeight;

        var tempContext = tempCanvas.getContext("2d");
        tempContext.drawImage(tunnelBitmap, 0, 0, tunnelBitmapWidth, tunnelBitmapHeight);
        
        tunnelBitmapData = tempContext.getImageData(0, 0, tunnelBitmapWidth, tunnelBitmapHeight);
        
        tunnelTargetCanvas = create("CANVAS");
        tunnelTargetCanvas.width = targetWidth;
        tunnelTargetCanvas.height = targetHeight;
        tunnelTargetContext = tunnelTargetCanvas.getContext("2d");
        tunnelTargetData = tunnelTargetContext.createImageData(targetWidth, targetHeight);
    };
    
    var bitmapTunnelRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Bitmap tunnel";
            }
        }
        
        var target = tunnelTargetData.data;
        var source = tunnelBitmapData.data;

        context.fillStyle = "#350000";
        context.fillRect(0, 0, width, 50);
        context.fillRect(0, height - 50, width, 50);
        context.fillStyle = "#46051e";
        context.fillRect(0, 50, width, 14);
        context.fillRect(0, height - 64, width, 14);
        context.fillStyle = "#000000";
        context.fillRect(0, 64, width, height - 128);
        
        var targetIndex = 0;
        var targetIndex2 = (targetHeight - 1) * targetWidth * 4;
        
        var maxY = targetHalfHeight - 32;
        
        for (var y = 0; y < maxY; ++y) {
            // y = 0 => z är alltid sådant att faktorn blir /1
            // y = targetHalfHeight => z är oändligt långt bort
            var inverseZFactor = maxY / (maxY - y);
            var trueY = y * inverseZFactor + chapterOffset / 10;
            var alpha = 255 / inverseZFactor;
            
            var bitmapY = (trueY % tunnelBitmapHeight) & 0xff;
            
            for (var x = -targetHalfWidth; x < targetHalfWidth; ++x) {
                var trueX = x * inverseZFactor;
                
                if (trueX < -targetHalfWidth || trueX > targetHalfWidth) {
                    target[targetIndex++] = 0;
                    target[targetIndex++] = 0;
                    target[targetIndex++] = 0;
                    target[targetIndex++] = 255;
                    target[targetIndex2++] = 0;
                    target[targetIndex2++] = 0;
                    target[targetIndex2++] = 0;
                    target[targetIndex2++] = 255;
                } else {
                    var bitmapX = (((trueX + targetHalfWidth) >> 1) % 20) & 0xff;
                    var sourceIndex = (bitmapY * tunnelBitmapWidth + bitmapX) * 4;

                    target[targetIndex++] = source[sourceIndex];
                    target[targetIndex2++] = source[sourceIndex++];
                    target[targetIndex++] = source[sourceIndex];
                    target[targetIndex2++] = source[sourceIndex++];
                    target[targetIndex++] = source[sourceIndex];
                    target[targetIndex2++] = source[sourceIndex++];
                    target[targetIndex++] = alpha;
                    target[targetIndex2++] = alpha;
                }
            }
            
            targetIndex2 -= targetWidth * 8;
        }
        
        tunnelTargetContext.putImageData(tunnelTargetData, 0, 0);
        
        context.drawImage(tunnelTargetCanvas, 0, 64, 640, 384);
        
        context.fillStyle = "#998888";
        context.font = "30px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "center";
        context.fillText("To do: Finish bitmap tunnel effect", halfWidth, halfHeight);
    };
    
    // *** Dead chicken effect (renderer 3)
    // http://youtu.be/_5HacABiXUE?t=0m48s
    
    // 3.0: biteArte
    // 3.1: chicken around biteArte
    // 3.2: chicken and biteArte
    
    var deadChickenRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Dead chicken";
            }
        }
        
        var angle = chapterOffset * 19 + 10000;
        
        context.fillStyle = "#441010";
        context.fillRect(0, 0, width, height);
        
        var x = halfWidth / 2 * sinus[angle & 65535],
            x2 = halfWidth / 2 * sinus[(angle + 32768) & 65535]
        var z = sinus[(angle + 16384) & 65535],
            z2 = -z;
        var mult = 2 / (2 - z),
            mult2 = 2 / (2 - z2);
        x *= mult;
        x2 *= mult2;
        
        var biteWidth = biteArte.width;
        var biteHeight = biteArte.height;
        
        var chickenWidth = deadChicken.width;
        var chickenHeight = deadChicken.height;
        
        switch (subId) {
            case 0:
                context.globalAlpha = chapterComplete < 0.2 ? chapterComplete * 5 :
                                      chapterComplete < 0.8 ? 1 :
                                      (5 - chapterComplete * 5);
                var w = biteWidth * mult;
                var h = biteHeight * mult;
                context.drawImage(biteArte, halfWidth + x - w / 2, halfHeight - h / 2, w, h);
                break;
            case 1:
                context.globalAlpha = chapterComplete < 0.2 ? chapterComplete * 5 :
                                      chapterComplete < 0.8 ? 1 :
                                      (5 - chapterComplete * 5);
                var w = chickenWidth * mult;
                var h = chickenHeight * mult;
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
                var w = biteWidth * mult;
                var h = biteHeight * mult;
                var w2 = chickenWidth * mult2;
                var h2 = chickenHeight * mult2;

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
    
    var globeCanvas, globeContext, globeImageData, globeMultTable,
        globe, globeDoodles, globeDoodleBits;
    
    var prepareGlobe = function() {
        globeCanvas = create("CANVAS");
        globeCanvas.width = globeCanvas.height = 224;
        globeContext = globeCanvas.getContext("2d");
        globeImageData = globeContext.createImageData(224, 224);
        
        var mults = [];
        
        for (var x = 0; x <= 224; ++x) {
            var fromNegToPos = x / 112 - 1;
            var arccos = Math.acos(fromNegToPos);
            var sin = Math.sin(arccos);
            mults.push(sin);
        }
        
        globeMultTable = mults;
        
        var tempCanvas = create("CANVAS");
        tempCanvas.width = 512;
        tempCanvas.height = 512;
        var tempContext = tempCanvas.getContext("2d");
        tempContext.clearRect(0, 0, 512, 512);
        tempContext.drawImage(globeDoodles, 0, 0);
        var tempData = tempContext.getImageData(0, 0, 512, 512).data;
        globeDoodleBits = Array(512 * 512);
        var index = 0;
        for (var y = 0; y < 512; ++y) {
            for (var x = 0; x < 512; ++x) {
                globeDoodleBits[index] = (tempData[index * 4] > 128);
                ++index;
            }
        }
    };
    
    var globeRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Globe";
            }
        }
        
        context.fillStyle = "#110000";
        context.fillRect(0, 0, width, height);
        
        var w = globe.width;
        var h = globe.height;
        
        context.drawImage(globe, halfWidth - w, halfHeight - h, w * 2, h * 2);
        
        var buffer = globeImageData.data;
        
        var xOffset = (sinus[(chapterOffset * 23) & 0xffff] * ((512 - 224) / 2) + 256 - 112) | 0;
        var yOffset = (sinus[(chapterOffset * 17) & 0xffff] * ((512 - 224) / 2) + 256 - 112) | 0;
        
        var index = 0;
        for (var y = 0; y <= 223; ++y) {
            for (var x = 0; x <= 223; ++x) {
                var alpha = 0;
                buffer[index++] = 255;
                buffer[index++] = 255;
                buffer[index++] = 255;
                
                var yMult = globeMultTable[x];
                
                if (yMult > 0) {
                    var yFromMiddle = y - 112;
                    var trueYFromMiddle = (yFromMiddle / yMult) | 0;
                    var trueY = trueYFromMiddle + 112;
                    
                    if (trueY >= 0 && trueY <= 223) {
                        var fetch = (trueY + yOffset) * 512 + x + xOffset;
                        alpha = globeDoodleBits[fetch] ? 128 : 0;
                    }
                }

                buffer[index++] = alpha;
            }
        }
        
        globeContext.clearRect(0, 0, 224, 224);
        globeContext.putImageData(globeImageData, 0, 0);
        
        context.drawImage(globeCanvas, halfWidth - 224, halfHeight - 224, 448, 448);
        
        if (chapterOffset < 512) {
            context.fillStyle = "#441000";
            context.fillRect(0, 0, width, 256 - chapterOffset / 2);
            context.fillRect(0, height - 256 + chapterOffset / 2, width, 256 - chapterOffset / 2);
        }
        
        if (chapterComplete > 0.95) {
            var alpha = chapterComplete * 20 - 19;
            context.fillStyle = "rgba(0,0,0," + alpha.toFixed(3) + ")";
            context.fillRect(0, 0, width, height);
        }
    };
    
    /// *** Simple image screens (renderer 5)
    
    // 5.0: Sanity 1
    // 5.1: Madman
    // 5.2: Einstein
    // 5.3: Sanity 2
    
    var sanity1, madman, einstein, sanity2;
    var simpleImages = [];
    
    var prepareSimpleImages = function() {
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
    
    var simpleImageRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Simple image";
            }
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        var imageData = simpleImages[subId];
        var image = imageData.image;
        var iw = image.width * imageData.scale;
        var ih = image.height * imageData.scale;
        context.drawImage(image, halfWidth - (iw >> 1), halfHeight - (ih >> 1), iw, ih);
        
        if (chapterOffset < 500) {
            context.globalAlpha = (1 - chapterOffset / 500);
            context.fillStyle = imageData.fadeFrom;
            context.fillRect(0, 0, width, height);
        } else {
            var totalTime = chapterOffset / chapterComplete;
            var timeLeft = totalTime - chapterOffset;
            
            if (timeLeft < 500) {
                context.globalAlpha = (1 - timeLeft / 500);
                context.fillStyle = imageData.fadeTo;
                context.fillRect(0, 0, width, height);
            }
        }
    };
    
    /// *** Stars (renderer 6)
    
    // 6.0: HTML5 logo coming towards the viewer
    
    var html5Coords = (function() {
        var lines = [
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
        
        var result = [];
        
        var lineIndex = 0;
        var totalStars = 0;
        var distSteps = 80;
        var dist = 0;
        var firstTimeAround = true;
        while (distSteps > 10) {
            var line = lines[lineIndex];
            var totalDist = Math.sqrt((line.x2-line.x1)*(line.x2-line.x1) + (line.y2-line.y1)*(line.y2-line.y1));
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
                var x = line.x1 - 256 + (dist / totalDist * (line.x2 - line.x1));
                var y = line.y1 - 256 + (dist / totalDist * (line.y2 - line.y1));
                var z = Math.abs(x) * 0.1;
                result.push({x : x, y : y, z : z});
                ++totalStars;
            }
        }
        
        console.log(totalStars);
        return result;
    })();
    
    var starsRandomCoords = (function() {
        var result = [];
        for (var i = 0; i < 1000; ++i) {
            result.push(
                        {
                            x : rnd() * 1024 - 512,
                            y : rnd() * 1024 - 512,
                            z : rnd() * 1024 - 512
                        });
        }
        
        return result;
    })();
    
    var limitStarCoord = function(composant) {
        if (composant > 512) {
            return composant - 1024 * Math.floor((composant + 512) / 1024);
        } else if (composant < -512) {
            return composant + 1024 * Math.floor((512 - composant) / 1024);
        } else {
            return composant;
        }
    }
    
    var starsRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Stars";
            }
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        var coords, phaseX, phaseY, phaseZ, offsetZ, maxStars;
        
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
                maxStars = chapterOffset / 4;
                break;
            case 1:
                // random stars
                coords = starsRandomCoords;
                phaseX = phaseY = phaseZ = offsetZ = 0;
                maxStars = chapterOffset / 4;
                phaseZ = -chapterOffset / 10;
                break;
        }
        
        if (maxStars > coords.length) {
            maxStars = coords.length;
        }
        
        while (phaseZ < -512) phaseZ += 1024;
        while (phaseZ > 512) phaseZ -= 1024;
        
        context.fillStyle = "#ffffff";
        
        for (var i = 0; i < maxStars; ++i) {
            var star = coords[i];
            
            // Phase
            var x = limitStarCoord(star.x + phaseX);
            var y = limitStarCoord(star.y + phaseY);
            var z = limitStarCoord(star.z + phaseZ);
            
            // Offset:
            z += offsetZ;
            
            if (z > -1000 && z < 1000) {
                var zMultFactor = 512 / (z + 1024);
                
                var screenX = halfWidth + zMultFactor * x;
                var screenY = halfHeight + zMultFactor * y;
                
                if (screenX > 0 && screenX < width && screenY > 0 && screenY < height) {
                    var alpha = (1000 - z) / 2000;
                    context.globalAlpha = alpha;
                    context.fillRect(screenX, screenY, 2, 2);
                }
            }
        }
        
        if (subId == 1) {
            context.fillStyle = "#998888";
            context.font = "30px sans-serif";
            context.textAlign = "center";
            context.textBaseline = "center";
            context.globalAlpha = 0.75;
            context.fillText("To do: Finish star effect", halfWidth, halfHeight);
        }
    }
    
    var renderers = [
            introTextRenderer,
            discTunnelRenderer,
            bitmapTunnelRenderer,
            deadChickenRenderer,
            globeRenderer,
            simpleImageRenderer,
            starsRenderer,
            nullRenderer
        ],
    
    nullRendererIndex = 7,

    chapters = [
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
            to : 188000,
            rendererIndex : nullRendererIndex,
            subId : 0
        },
        false
    ],
    
    preCalcSinusTables = function() {
        var sin = [];
        var pi = 4 * Math.atan(1);
        
        for (var i = 0; i <= 65535; ++i) {
            var value = Math.sin(i * pi / 32768);
            sin.push(value);
        }
        
        sinus = sin;
    },
    
    preCalc = function() {
        preCalcSinusTables();
        prepareGlobe();
        prepareSimpleImages();
        bitmapTunnelPrepare();
    },
    
    animFrame = function(time) {
        if (startTime) {
            frameDiff = (time - lastTime) / 1000 * 60;
            
            timeOffset = time - startTime;
            
            var currentChapter = dev ? chapters[select.value] : chapters[currentChapterIndex];
            if (dev) {
                currentChapter.from = 0;
                currentChapter.to = 99999999;
            }
            if (currentChapter && (timeOffset >= currentChapter.to)) {
                ++currentChapterIndex;
                currentChapter = chapters[currentChapterIndex];
            }
            
            
            if (currentChapter) {
                var chapterTime = timeOffset - currentChapter.from;
                var chapterComplete = chapterTime / (currentChapter.to - currentChapter.from);
                currentRenderer = renderers[currentChapter.rendererIndex];
                
                var starting = now();
                context.globalAlpha = 1;
                context.save();
                currentRenderer.call(this, currentChapter.subId, chapterTime, chapterComplete, frameDiff);
                context.restore();
            }
            
            var ended = now();
            var ms = ended - starting;
            var qualityStep = (22 - ms - 10 * frameDiff) / 200;
            if (qualityStep > 0) {
                qualityStep *= 0.005;
            }
            var newQuality = currentQuality + qualityStep;
            if (newQuality > 1) {
                newQuality = 1;
            } else if (newQuality < 0.1) {
                newQuality = 0.1;
            }
            currentQuality = newQuality;
            
            if (dev) {
                context.fillStyle = "#000000";
                context.fillRect(0, 0, 60, 13);
                context.fillStyle = "#ffffff";
                context.font = "10px Helvetica";
                context.textAlign = "right";
                context.textBaseline = "top";
                context.fillText((timeOffset / 1000).toFixed(3).replace('.',':'), 60, 0);
            }
        }
        
        if (currentTime) {
            if (!lastTime) {
                startTime = time - 1000 * currentTime;
            }
            lastTime = time;
        }
        
        if (playing) {
            requestAnimationFrame(animFrame);
        }
    },
    
    onplay = function() {
        playing = true;
        requestAnimationFrame(animFrame);
    },
    
    ontimeupdate = function(event) {
        currentTime = this.currentTime;
    },
    
    areLoading = [],
    totalLoadingAdded = 0,
    
    addToLoading = function(item) {
        areLoading.push(item);
        ++totalLoadingAdded;

        var event = document.createEvent("Event");
        event.initEvent("itemsLoader", true, true);
        event.total = totalLoadingAdded;
        event.done = totalLoadingAdded - areLoading.length;
        
        window.dispatchEvent(event);
    },
    
    loadingDone = function(item) {
        var newLoading = [];
        for (var i = 0; i < areLoading.length; ++i) {
            if (areLoading[i] != item) {
                newLoading.push(areLoading[i]);
            }
        }
        areLoading = newLoading;
        
        var event = document.createEvent("Event");
        event.initEvent("itemsLoader", true, true);
        event.total = totalLoadingAdded;
        event.done = totalLoadingAdded - areLoading.length;
        
        window.dispatchEvent(event);
    },
    
    audioProgressTimerId = null,
    
    onIpadAudioProgressHack = function(audio) {
        audioProgressTimerId = null;
        audio.removeEventListener("progress", onAudioProgress, false);
        loadingDone(audio);
    },
    
    onAudioProgress = function(event) {
        if (audioProgressTimerId) {
            window.clearTimeout(audioProgressTimerId);
        }
        var audio = this;
        audioProgressTimerId = window.setTimeout(function() { onIpadAudioProgressHack(audio); }, 2000);
    },
    
    onAudioCanPlay = function(event) {
        if (audioProgressTimerId) {
            window.clearTimeout(audioProgressTimerId);
            audioProgressTimerId = null;
        }
        this.removeEventListener("progress", onAudioProgress, false);
        loadingDone(this);
    },
    
    loadAudio = function(oggSource, mp3Source) {
        // returns a reference to the AUDIO element
        var audio = create("AUDIO");
        audio.controls = true;
        audio.preload = "auto";
        
        addToLoading(audio);
        
        audio.addEventListener("play", onplay, false);
        audio.addEventListener("timeupdate", ontimeupdate, false);
        audio.addEventListener("progress", onAudioProgress, false);
        audio.addEventListener("canplay", onAudioCanPlay, false);
        
        var canPlayOgg = audio.canPlayType("audio/ogg");
        var canPlayMp3 = audio.canPlayType("audio/mpeg");
        
        if (canPlayOgg == "probably" || (canPlayOgg == "maybe" && canPlayMp3 != "probably")) {
            audio.src = oggSource;
        } else if (canPlayMp3 == "probably" || canPlayMp3 == "maybe") {
            audio.src = mp3Source;
        }
        
        audio.load();
        
        return audio;
    },
    
    onImageLoad = function() {
        loadingDone(this);
    },
    
    loadImage = function(src) {
        var image = new Image();
        
        addToLoading(image);
        
        image.addEventListener("load", onImageLoad, false);
        image.src = src;
        
        return image;
    },
    
    startingTimerId = null;
    
    onLoadingDone = function() {
        if (startingTimerId) {
            window.clearTimeout(startingTimerId);
            startingTimerId = null;
        }
        
        preCalc();
        
        livininsanity.play();
    };
    
    onItemsLoader = function(event) {
        if (startingTimerId) {
            window.clearTimeout(startingTimerId);
            startingTimerId = null;
        }
        
        context.fillStyle = "#000000"
        context.fillRect(0, 0, width, height);
        context.fillStyle = "#ffffff";
        
        if (event.done == event.total) {
            context.font = "50px sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("Loading done!", halfWidth, halfHeight);
            context.font = "20px sans-serif";
            context.fillText("Click to start...", halfWidth, halfHeight + 40);
            
            if (autoplay) {
                window.setTimeout(onLoadingDone, 10);
            }
            canvas.addEventListener("click", onLoadingDone, false);
        } else {
            context.font = "30px sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("Loading...", halfWidth, halfHeight);
            context.font = "20px sans-serif";
            context.fillText((event.done / event.total * 100).toFixed(0) + " % done", halfWidth, halfHeight + 40);
        }
    },
    
    onload = function() {
        canvas = document.getElementById("demo");
        context = canvas.getContext("2d");
        
        playing = false;
        
        window.addEventListener("itemsLoader", onItemsLoader, false);
        
        livininsanity = loadAudio("livin-insanity.ogg", "livin-insanity.mp3");
        whaaaaat = loadImage("whaaaaat.png");
        biteArte = loadImage("biteArte.png");
        deadChicken = loadImage("deadChicken.png");
        globe = loadImage("globe.png");
        globeDoodles = loadImage("globeDoodles.png");
        sanity1 = loadImage("sanity1.png");
        madman = loadImage("madman.png");
        tunnelBitmap = loadImage("tunnelBits.png");
        einstein = loadImage("einstein.png");
        sanity2 = loadImage("sanity2.png");
        
        if (dev) {
            select = document.createElement("SELECT");
            for (var i = 0; i < chapters.length - 1; ++i) {
                var chapter = chapters[i];
                var name = renderers[chapter.rendererIndex]("getName") + ", part " + chapter.subId;
                var option = document.createElement("OPTION");
                option.value = i;
                option.appendChild(document.createTextNode(name));
                if (i == 0) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
            document.body.insertBefore(select, document.body.firstChild);
        }
    };

    window.onload = onload;
})();
