// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name artsy2.min.js
// ==/ClosureCompiler==

(function() {
    // http://bitworld.bitfellas.org/demo.php?id=248
    // http://youtu.be/_5HacABiXUE
    
    // Minify, step 1: http://closure-compiler.appspot.com/home
    // Minify, step 2: https://github.com/Siorki/RegPack
    
    var dev = false;
    var autoplay = !dev;
    var showFrame = false;
    var rnd = Math.random;
    var create = function(elementName) { return document.createElement(elementName); };
    var timeOffset = 0;
    var frameDiff = 1;
    
    var now = function() {
        return (new Date).getTime();
    };
    
    var width = 640;
    var height = 512;
    
    var pi = 4 * Math.atan(1);
    
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    
    var smoothComplete = function(chapterComplete) {
        return (1 - Math.cos(chapterComplete * pi)) / 2;
    };

    var canvas, context, sinus, currentQuality,
        lastTime, startTime, currentTime, currentChapterIndex = 0, currentRenderer,
        playing, elekfunk, select;
    
    // *** Endpart loaded scene (renderer 0)
    // 0.0: Endpart loaded...
    
    var muscleMan;
    
    var endPartLoadedRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Endpart loaded";
            }
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        var textAlpha = chapterOffset < 1300 ? 0 :
                        chapterOffset < 2000 ? (chapterOffset - 1300) / 700 :
                        chapterOffset < 8500 ? 1 :
                        chapterOffset < 9000 ? (9000 - chapterOffset) / 500 :
                        0;
        
        var imageAlpha = chapterOffset < 2300 ? 0 :
                         chapterOffset < 3000 ? (chapterOffset - 2300) / 700 :
                         chapterOffset < 9500 ? 1 :
                         chapterOffset < 10000 ? (10000 - chapterOffset) / 500 :
                         0;
        
        var color = (textAlpha * 0x77) | 0;
        var translate = -chapterComplete - 0.75;
        
        context.save();
        context.fillStyle = "rgba(" + color + "," + color + "," + color + ",1)";
        context.font = "60px sans-serif";
        context.scale(-0.5, 1);
        context.translate(width * translate, 0);
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText("Endpart loaded...", 0, 50);
        context.restore();
        
        context.globalAlpha = imageAlpha;
        context.drawImage(muscleMan, halfWidth - muscleMan.width, 460 - muscleMan.height * 2, muscleMan.width * 2, muscleMan.height * 2);
    };
    
    // *** Dotfield scroller scene (renderer 1)
    // 1.0: Dots and scrolling and wave heights...
    
    var dotfieldTextCanvas, dotfieldTextContext;
    
    var prepareDotfieldScroller = function() {
        dotfieldTextCanvas = create("CANVAS");
        dotfieldTextCanvas.width =
        dotfieldTextCanvas.height = 50;
        
        dotfieldTextContext = dotfieldTextCanvas.getContext("2d");
    };
    
    var dotfieldScrollerRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Dotfield scroller";
            }
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        context.globalAlpha = (chapterComplete < 0.05) ? chapterComplete * 20 :
                              (chapterComplete > 0.95) ? 20 - chapterComplete * 20 :
                              1;
        
        // 0-7s: Just scroll text, increase speed of offset map to 1.0
        // 7s:   Rotate full 360 once, decrease speed of offset map to -1.0
        // 10,6s: Rotate full 360 once
        // 14,2s: Rotate full 360once, increase speed of offset map to 1.0
        
        var angle = chapterOffset < 7000 ? 5000 :
                    chapterOffset < 8456 ? 5000 + (chapterOffset - 7000) * 45 :
                    chapterOffset < 10550 ? 5000 :
                    chapterOffset < 12006 ? 5000 + (chapterOffset - 10550) * 45 :
                    chapterOffset < 14100 ? 5000 :
                    chapterOffset < 15556 ? 5000 + (chapterOffset - 14100) * 45 :
                    5000;
        
        var textX = 60 - chapterComplete * 700;
        
        dotfieldTextContext.fillStyle = "#001700";
        dotfieldTextContext.fillRect(0, 0, 50, 50);
        dotfieldTextContext.textAlign = "left";
        dotfieldTextContext.textBaseline = "middle";
        dotfieldTextContext.fillStyle = "#ffffff";

        dotfieldTextContext.font = "bold 40px sans-serif";
        dotfieldTextContext.fillText("SANITY", textX, 30);
        dotfieldTextContext.font = "30px sans-serif";
        dotfieldTextContext.fillText("atornblad.se for more info!", (textX) + 170, 30);

        dotfieldTextContext.font = "bold 40px sans-serif";
        dotfieldTextContext.fillText("SANITY", (textX) + 560, 30);
        
        var textData = dotfieldTextContext.getImageData(0, 0, 50, 50);
//        context.drawImage(dotfieldTextCanvas, 0, 20);
        
        var textDataOffset = 0;
        
        var heightMapOffset = (chapterOffset < 8000) ? smoothComplete(chapterOffset / 8000) :
                              (chapterOffset < 15000) ? 1 - smoothComplete((chapterOffset - 8000) / 7000) :
                              smoothComplete((chapterOffset - 15000) / 8000);
        
        var heightMapZOffset = heightMapOffset * 160;
        
        for (var z = 25; z > -25; --z) {
            for (var x = -25; x < 25; ++x) {
                // 1: Rotate (x,y) coordinate around center
                var rx = x * sinus[(angle + 16384) & 65535] - z * sinus[angle & 65535];
                var rz = z * sinus[(angle + 16384) & 65535] + x * sinus[angle & 65535];
                
                // 2: Tranform into screen coordinates
                var screenX = halfWidth + rx * 2500 / (300 + rz * 2);
                var screenY = halfHeight + (10 - rz) * 1200 / (300 + rz * 2);
                
                // 3: Check text bit
                var isTextBit = textData.data[textDataOffset] > 127;
                
                // 4: Get height map height
                var midXBooster = 1 - (Math.abs(x) / 25);
                var smallMidXBooster = 0.5 + midXBooster / 2;
                var offZ = (z + heightMapZOffset) | 0;
                var highZBooster = offZ / 100;
                var mapHeight = sinus[((x - 7 + offZ) * 6000) & 65535] * midXBooster +
                                sinus[(-x * 900) & 65535] +
                                sinus[((x + 13) * 1300) & 65535] * smallMidXBooster +
                                sinus[((offZ + 20) * 8000) & 65535] * midXBooster +
                                sinus[(offZ * 1100) & 65535] +
                                sinus[((offZ + 10) * 1700) & 65535] * smallMidXBooster;
                
                mapHeight = (mapHeight - 2) / 4 + highZBooster * smallMidXBooster;
                
                var hasHeight = mapHeight > 0;
                
                if (hasHeight && isTextBit) {
                    context.fillStyle = "rgba(255,130,130,0.65)";
                    context.fillRect(screenX, (screenY - mapHeight * 50 - 20), 2, 2);
                } else if (isTextBit) {
                    context.fillStyle = "rgba(255,27,24,0.67)";
                    context.fillRect(screenX, (screenY - 20), 2, 2);
                } else if (hasHeight) {
                    context.fillStyle = "rgba(255,27,24,0.67)";
                    context.fillRect(screenX, (screenY - mapHeight * 50), 2, 2);
                } else {
                    context.fillStyle = "rgba(80,83,255,0.9)";
                    context.fillRect(screenX, screenY, 2, 2);
                }
                
                textDataOffset += 4;
            }
        }
    };
    
    // *** Sine plasma renderer (renderer 2)
    
    var sinePlasmaWidth = width >> 2;
    var sinePlasmaHeight = height >> 2;
    
    var sinePlasmaCanvas, sinePlasmaContext, sinePlasmaData;
    
    var sineColors;
    
    var sinePlasma; // The image;
    
    var sinePlasmaPrepare = function() {
        sinePlasmaCanvas = create("CANVAS");
        sinePlasmaCanvas.width = sinePlasmaWidth;
        sinePlasmaCanvas.height = sinePlasmaHeight;
        
        sinePlasmaContext = sinePlasmaCanvas.getContext("2d");
        
        sinePlasmaData = sinePlasmaContext.createImageData(sinePlasmaWidth, sinePlasmaHeight);
        
        sineColors = [];
        
        for (var i = 200; i > 0; --i) {
            var r = i * 3.5, g = i * 1.9, b = i * 0.7;
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            sineColors.push(r | 0, g | 0, b | 0);
        }
        
        sineColors.push(0, 0, 0);
        
        for (var i = 1; i <= 200; ++i) {
            var r = i * 0.6, g = i * 1.5, b = i * 2.7;
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            sineColors.push(r | 0, g | 0, b | 0);
        }
    }
    
    var sinePlasmaRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Sine plasma";
            }
        }
        
        var sinePlasmaOffsetA = chapterOffset * 80;
        var sinePlasmaFactorA = sinus[(chapterOffset * 20 + 16000) & 65535] * 900 * (1 - chapterComplete) + 1200;
        
        var sinePlasmaOffsetB = chapterOffset * 17;
        var sinePlasmaFactorB = sinus[(chapterOffset * 11 + 16000) & 65535] * 100 + 2500;
        
        var sineWeightA = 1 - chapterComplete;
        var sineWeightB = 0.4 - 0.2 * chapterComplete;;
        
        var data = sinePlasmaData.data;
        
        var offset = 0;
        
        for (y = 0; y < sinePlasmaHeight; ++y) {
            var yIndexA = (y * sinePlasmaFactorA - sinePlasmaOffsetA) & 65535;
            var yIndexB = (y * sinePlasmaFactorB - sinePlasmaOffsetB) & 65535;

            for (x = sinePlasmaWidth; x > 0; --x) {
                var xIndexA = (x * sinePlasmaFactorA - sinePlasmaOffsetA) & 65535;
                var xIndexB = (x * sinePlasmaFactorB - sinePlasmaOffsetB) & 65535;
                
                var value = sineWeightA * (sinus[xIndexA] + sinus[yIndexA]) + sineWeightB * (sinus[xIndexB] + sinus[yIndexB]);
                var colorIndex = 3 * ((value * 50 + 200) | 0);
                
                data[offset++] = sineColors[colorIndex++];
                data[offset++] = sineColors[colorIndex++];
                data[offset++] = sineColors[colorIndex++];
                data[offset++] = 255;
            }
        }
        
        sinePlasmaContext.putImageData(sinePlasmaData, 0, 0);
        
        context.drawImage(sinePlasmaCanvas, 0, 0, width, height);
        
        if (chapterOffset < 2000) {
            var fromStart = chapterOffset / 2000;
            var tilDone = (2000 - chapterOffset) / 2000;
            var tilDoneSquare = tilDone * tilDone;
            var inverse = 1 - tilDoneSquare;
            var blockTop = (200 - inverse * 200);
            var blockBottom = height * inverse + blockTop;
            var blockLeft = (400 - inverse * 400);
            var blockRight = blockLeft + width * inverse;
            context.fillStyle = "#000000";
            context.fillRect(0, 0, width, blockTop);
            context.fillRect(0, blockBottom, width, height - blockBottom + 1);
            context.fillRect(0, blockTop - 1, blockLeft, blockBottom - blockTop + 2);
            context.fillRect(blockRight, blockTop - 1, width - blockRight + 1, blockBottom - blockTop + 2);
        }
        
        if (chapterOffset >= 22800 && chapterOffset <= 30300) {
            var imageY = (chapterOffset < 23300) ? height - 220 * (smoothComplete((chapterOffset - 22800) / 500)) :
                         (chapterOffset >= 29800) ? height - 220 * (smoothComplete((30300 - chapterOffset) / 500)) :
                         height - 220;
            
            context.drawImage(sinePlasma, 0, imageY, 128, 220);
        }
        
        if (chapterComplete > 0.98) {
            var alpha = (chapterComplete - 0.98) * 50;
            context.fillStyle = "rgba(0,0,0," + alpha.toFixed(3) + ")";
            context.fillRect(0, 0, width, height);
        }
    };

    // *** Stripe ball renderer (renderer 3)
    
    var stripeBallWidths;
    
    var stripeBallPrepare = function() {
        // Get width for yy:-100..100 (step 10)
        stripeBallWidths = [];
        
        for (var y = -100; y <= 100; y += 5) {
            stripeBallWidths.push(Math.sin(Math.acos(y * 0.0099)));
        }
    };
    
    var stripeBallRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Stripe ball";
            }
        }
        
        context.fillStyle = "#110000";
        context.fillRect(0, 0, width, 340);
        
        context.fillStyle = "#330000";
        context.fillRect(0, 340, width, height - 340);
        
        var phaseOffset = (1 / 6) - ((chapterOffset % 500) / 3000);
        var z = sinus[(chapterOffset * 19 + 32768) & 65535] * 100;
        var zFactor = 300 / (400 + z);

        var y = halfHeight + 50 - Math.abs(sinus[(chapterOffset * 41) & 65535]) * zFactor * 200;
        var x = halfWidth + sinus[(chapterOffset * 19 + 49152) & 65535] * zFactor * 200;
        if (chapterOffset < 600) {
            x -= 600 - 600 * smoothComplete(chapterOffset / 600);
        }
        if (chapterOffset > 14000) {
            y += 600 * smoothComplete((chapterOffset - 14000) / 600);
        }
        
        var totalRadius = 200 * zFactor;
        
        // Six strips back
        
        context.fillStyle = "#442222";
        context.beginPath();
        for (var i = 0; i < 6; ++i) {
            var x1 = i / 6 + phaseOffset - 1/24;
            var x2 = x1 + 1 / 12;
            x1 = smoothComplete(x1) * 2 - 1;
            x2 = smoothComplete(x2) * 2 - 1;
            
            var widthIndex = 0;
            
            for (var j = 0; j <= 40; ++j) {
                var yy = -1 + 0.05 * j;
                var widthHere = stripeBallWidths[j];
                var px = widthHere * x1 * totalRadius + x;
                var py = yy * totalRadius + y;
                
                if (j == 0) context.moveTo(px, py); else context.lineTo(px, py);
            }
            
            for (var j = 40; j >= 0; --j) {
                var yy = -1 + 0.05 * j;
                var widthHere = stripeBallWidths[j];
                var px = widthHere * x2 * totalRadius + x;
                var py = yy * totalRadius + y;
                
                context.lineTo(px, py);
            }
        }
        
        context.closePath();
        context.fill();
        
        // Six strips front
        
        var shinePos = x - totalRadius * 0.6 * zFactor;
        var gradient = context.createRadialGradient(shinePos, y, totalRadius * 0.2, x, y, totalRadius);
        
        gradient.addColorStop(0, "rgba(" + (255 * zFactor).toFixed(0) + "," +
                                           (221 * zFactor).toFixed(0) + "," +
                                           (221 * zFactor).toFixed(0) + ",255)");
        gradient.addColorStop(0.5, "#997777");
        gradient.addColorStop(1, "#553333");
        
        context.fillStyle = gradient;
        context.beginPath();
        for (var i = 0; i < 6; ++i) {
            var x1 = i / 6 + phaseOffset - 1/24;
            var x2 = x1 + 1 / 12;
            x1 = 1 - smoothComplete(x1) * 2;
            x2 = 1 - smoothComplete(x2) * 2;
            
            var widthIndex = 0;
            
            for (var j = 0; j <= 40; ++j) {
                var yy = -1 + 0.05 * j;
                var widthHere = stripeBallWidths[j];
                var px = widthHere * x1 * totalRadius + x;
                var py = yy * totalRadius + y;
                
                if (j == 0) context.moveTo(px, py); else context.lineTo(px, py);
            }
            
            for (var j = 40; j >= 0; --j) {
                var yy = -1 + 0.05 * j;
                var widthHere = stripeBallWidths[j];
                var px = widthHere * x2 * totalRadius + x;
                var py = yy * totalRadius + y;
                
                context.lineTo(px, py);
            }
        }
        
        context.closePath();
        context.fill();
        
        if (chapterComplete > 0.98) {
            context.globalAlpha = (chapterComplete - 0.98) * 50;
            context.fillStyle = "#000000";
            context.fillRect(0, 0, width, height);
        }
    };
    
    // *** Html5 Inside renderer (renderer 4)
    
    var murky, murkyImageData, murkyCanvas, murkyContext, murkyTargetData;
    var intelOutside;
    
    var intelOutsideHtmlShieldCoords = [
        31, 0, 481, 0, 440, 460, 256, 511, 71, 460
    ];
    var intelOutsideHtmlShineCoords = [
        256, 37, 440, 37, 405, 431, 256, 472
    ];
    var intelOutsideHtmlFiveCoords = [
        114, 94, 397, 94, 391, 150, 175, 150, 180, 208, 386, 208, 371, 381, 256, 413, 140, 381, 132, 293, 188, 293, 192, 338, 256, 355, 318, 338, 325, 264, 129, 264
    ];
    
    var html5InsidePrepare = function() {
        var canv = create("CANVAS");
        canv.width = murky.width;
        canv.height = murky.height;
        var cont = canv.getContext("2d");
        cont.drawImage(murky, 0, 0);
        murkyImageData = cont.getImageData(0, 0, murky.width, murky.height);
        
        murkyCanvas = create("CANVAS");
        murkyCanvas.width = murkyCanvas.height = 100;
        murkyContext = murkyCanvas.getContext("2d");
        murkyTargetData = murkyContext.createImageData(100, 100);
    };
    
    var html5InsideDrawPolygon = function(coords, alpha, angle, mult, offsetX, offsetY, fillStyle) {
        context.save();
        context.translate(offsetX, offsetY);
        context.scale(mult, mult);
        context.rotate(angle);
        context.translate(-256, -256);

        context.beginPath();
        for (var len = coords.length, i = 0; i < len; i += 2) {
            if (i == 0) {
                context.moveTo(coords[i], coords[i + 1]);
            } else {
                context.lineTo(coords[i], coords[i + 1]);
            }
        }
        context.closePath();
        context.globalAlpha = alpha;
        context.fillStyle = fillStyle;
        context.fill();
        context.restore();
    };
    
    var html5InsideRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "HTML5 Inside";
            }
        }
        
        var targetIndex = 0;
        
        var offsetX = sinus[(chapterOffset * 17) & 65535] * 78 + 128;
        var offsetY = sinus[(chapterOffset * 13 + 9000) & 65535] * 78 + 128;
        
        for (var y = -49.5; y < 50; ++y) {
            var yFactor = 1 / Math.sin(Math.acos(y / 50));
            
            for (var x = -49.5; x < 50; ++x) {
                var distanceSquared = x * x + y * y;
                
                if (distanceSquared >= 2500) {
                    murkyTargetData.data[targetIndex++] =
                    murkyTargetData.data[targetIndex++] =
                    murkyTargetData.data[targetIndex++] =
                    murkyTargetData.data[targetIndex++] = 0;
                } else {
                    var xFactor = 1 / Math.sin(Math.acos(x / 50));
//                    var realDistance = Math.sqrt(distanceSquared);
//                    var maxDistance = Math.max(Math.abs(x), Math.abs(y));
//                    var fetchX = ((x / realDistance * maxDistance) + offsetX) | 0;
//                    var fetchY = ((y / realDistance * maxDistance) + offsetY) | 0;
                    var fetchX = (x * yFactor + offsetX) | 0;
                    var fetchY = (y * xFactor + offsetY) | 0;
                    var fetchOffset = (fetchY * 256 + fetchX) * 4;
                    
                    if (distanceSquared > 2100) {
                        var alpha = (2500 - distanceSquared) / 400;
                        murkyTargetData.data[targetIndex++] = (murkyImageData.data[fetchOffset++] * alpha) | 0;
                        murkyTargetData.data[targetIndex++] = (murkyImageData.data[fetchOffset++] * alpha) | 0;
                        murkyTargetData.data[targetIndex++] = (murkyImageData.data[fetchOffset++] * alpha) | 0;
                    } else {
                        murkyTargetData.data[targetIndex++] = murkyImageData.data[fetchOffset++];
                        murkyTargetData.data[targetIndex++] = murkyImageData.data[fetchOffset++];
                        murkyTargetData.data[targetIndex++] = murkyImageData.data[fetchOffset++];
                    }
                    murkyTargetData.data[targetIndex++] = 255;
                }
            }
        }
        
        murkyContext.putImageData(murkyTargetData, 0, 0);
        
        var globalAlpha = 1;
        
        if (chapterComplete > 0.96) {
            globalAlpha = (1 - chapterComplete) * 25;
        }
        
        context.fillStyle = "#000000";
        context.globalAlpha = 1;
        context.fillRect(0, 0, width, height);

        context.globalAlpha = globalAlpha;
        context.drawImage(murkyCanvas, halfWidth - 200, height - 400, 400, 400);
        
        if (chapterOffset > 1000) {
            var ioAlpha = chapterOffset > 1500 ? 1 : (chapterOffset - 1000) / 500;
            
            context.fillStyle = "#000000";
            context.globalAlpha = ioAlpha * globalAlpha;
            context.drawImage(intelOutside, halfWidth - 223, 0, 446, 102);
        }
        
        if (chapterOffset > 6300) {
            var alpha = (chapterOffset > 6800) ? 1 : (chapterOffset - 6300) / 500;
            var angle = smoothComplete(alpha) * -0.2;
            var mult = 1.25 - alpha;
            var offsetX = halfWidth + 15;
            var offsetY = 60 + 300 - 300 * alpha;
            
            html5InsideDrawPolygon(intelOutsideHtmlShieldCoords, alpha * globalAlpha, angle, mult, offsetX, offsetY, "#f83100");
            html5InsideDrawPolygon(intelOutsideHtmlShineCoords, alpha * globalAlpha, angle, mult, offsetX, offsetY, "#ff5301");
            html5InsideDrawPolygon(intelOutsideHtmlFiveCoords, alpha * globalAlpha, angle, mult, offsetX, offsetY, "rgba(240, 248, 255, 0.9)");
        }
    }
    
    // *** Simple images renderer (renderer 5)
    
    // 5.0: m.monroe
    // 5.1: shiffer
    // 5.2: crawford
    // 5.3: arte
    
    var mMonroe, shiffer, crawford, arte;
    var simpleImages = [];
    
    var prepareSimpleImages = function() {
        simpleImages.push({
            fadeFrom : "#000000",
            fadeTo : "#000000",
            image : mMonroe,
            scaleX : 1,
            scaleY : 2
        });
        simpleImages.push({
            fadeFrom : "#000000",
            fadeTo : "#000000",
            image : shiffer,
            scaleX : 1,
            scaleY : 2
        });
        simpleImages.push({
            fadeFrom : "#000000",
            fadeTo : "#ffffff",
            image : crawford,
            scaleX : 1,
            scaleY : 2
        });
        simpleImages.push({
            fadeFrom : "#ffffff",
            fadeTo : "#000000",
            image : arte,
            scaleX : 2,
            scaleY : 2
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
        var iw = image.width * imageData.scaleX;
        var ih = image.height * imageData.scaleY;
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

    // *** Rainbox chaos zoom renderer (renderer 6)
    
    var rainbowChaosColors = [
        0, 0, 0,
        0x19, 0x13, 0,
        0x33, 0x27, 0,
        0x66, 0x2b, 0,
        0x88, 0x31, 0,
        0xbb, 0x28, 0,
        0xbb, 0x45, 0,
        0xcd, 0x65, 0,
        0xdd, 0x98, 0,
        0xdf, 0xb7, 0,
        0xde, 0xe5, 2,
        0x67, 0xe9, 11,
        0x13, 0xee, 17,
        0x09, 0xff, 0x7b,
        0x02, 0xff, 0xf2,
        1, 0x87, 0xff
    ];
    
    var rainbowChaosCanvas, rainbowChaosContext, rainbowChaosTarget;
    
    var rainbowChaosPrepare = function() {
        rainbowChaosCanvas = create("CANVAS");
        rainbowChaosCanvas.width = 96;
        rainbowChaosCanvas.height = 86;
        
        rainbowChaosContext = rainbowChaosCanvas.getContext("2d");
        
        rainbowChaosTarget = rainbowChaosContext.createImageData(96, 86);
    };
    
    var fromAngleTo64k = 32768 / (4 * Math.atan(1));
    
    var rainbowChaosRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Rainbow chaos zoom";
            }
        }
        
        var index = 0;
        var offset = chapterOffset * 10;
        var angleOffset = 100000 * sinus[(chapterOffset * 3) & 65535];
        
        for (var y = -42.5; y < 43; ++y) {
            for (var x = -47.5; x < 48; ++x) {
                var distanceSquared = x * x + y * y; // 0..4153-ish
                var distance = Math.sqrt(distanceSquared);
                
                // 1: Rotate (x,y) coordinate around center
                var rx = x * sinus[(angleOffset + 16384) & 65535] - y * sinus[angleOffset & 65535];
                var ry = y * sinus[(angleOffset + 16384) & 65535] + x * sinus[angleOffset & 65535];
                
                var angle = Math.atan(rx / ry);
                
                var chapter = (offset / 100 - distance) / 50;
                var chapterInt = chapter | 0;
                var chapterDist = chapter - chapterInt;
                
                var factor1 = chapter < 0 ? 0 : ((chapterInt * 7) & 3) + 1;
                var factor2 = chapter < 0 ? 0 : (((chapterInt * 13) & 13) + 5) >> 1;
                var factor3 = chapter < 0 ? 0 : (((chapterInt * 9) & 7) + 2) << 2;
                var factor4 = chapter < 0 ? 0 : (((chapterInt * 7) & 7) + 1) << 1;
                
                if (chapterDist > 0.9 && chapter > 0) {
                    var nextChapter = chapterInt + 1;
                    var factor1b = ((nextChapter * 7) & 3) + 1;
                    var factor2b = (((nextChapter * 13) & 13) + 5) >> 1;
                    var factor3b = (((nextChapter * 9) & 7) + 2) << 2;
                    var factor4b = (((nextChapter * 7) & 7) + 1) << 1;
                    
                    var nextWeight = (chapterDist - 0.9) * 10;
                    var weight = 1 - nextWeight;
                    factor1 = factor1 * weight + factor1b * nextWeight;
                    factor2 = factor2 * weight + factor2b * nextWeight;
                    factor3 = factor3 * weight + factor3b * nextWeight;
                    factor4 = factor4 * weight + factor4b * nextWeight;
                }
                
                var value1 = sinus[(offset - distanceSquared * factor1) & 65535];
                var value2 = sinus[(angle * fromAngleTo64k * factor2) & 65535];
                
                value = (value1 * factor3 + value2 * factor4) & 15;
                value *= 3;
                
                rainbowChaosTarget.data[index++] = rainbowChaosColors[value++];
                rainbowChaosTarget.data[index++] = rainbowChaosColors[value++];
                rainbowChaosTarget.data[index++] = rainbowChaosColors[value++];
                rainbowChaosTarget.data[index++] = 255;
            }
        }
        
        rainbowChaosContext.putImageData(rainbowChaosTarget, 0, 0);
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        context.drawImage(rainbowChaosCanvas, halfWidth - 192, halfHeight - 172, 384, 344);
        
        if (chapterComplete > 0.95) {
            context.globalAlpha = (chapterComplete - 0.95) * 20;
            context.fillRect(0, 0, width, height);
        }
    };
    
    // *** Artwork renderer (renderer 7)
    
    var artwork;
    
    var artworkColors = (function() {
        var result = [];
        
        for (var i = 0; i <= 7; ++i) {
            var r = (0x88 + ((255 - 0x88) / 7) * i) | 0;
            var gb = (0x44 + ((0xaa - 0x44) / 7) * i) | 0;
            
            result.push("#" + (0x1000000 + (65536 * r) + (256 * gb) + gb).toString(16).substr(1));
            result.push("#" + (0x1000000 + (65536 * r) + (256 * r) + r).toString(16).substr(1));
        }
        
        return result;
    })();
    
    var artworkRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Artwork";
            }
        }
        
        var pictureY = 0;
        
        if (subId == 0) {
            pictureY = height;
            
            var cameraZ = 5 * sinus[(chapterOffset * 13) & 65535] + 23;
            var cameraY = 2 * sinus[(chapterOffset * 9 + 16384) & 65535] + 2;
            var cameraX = 2.5 * sinus[(chapterOffset * 5 + 50000) & 65535] + 2.5;
            
            var pic = (chapterComplete - 0.9) * 10;
            
            if (pic > 0) {
                var cameraZPic = 15;
                var cameraYPic = pic * 0.8465 + 3;
                var cameraXPic = 0;
                
                cameraX = cameraX * (1 - pic) + cameraXPic * pic;
                pic = smoothComplete(pic);
                cameraZ = cameraZ * (1 - pic) + cameraZPic * pic;
                cameraY = cameraY * (1 - pic) + cameraYPic * pic;
            }
            
            context.fillStyle = "#442133";
            context.fillRect(0, 0, width, height);
            
            for (var z = 0; z <= 12; ++z) {
                var mult = 40 / (cameraZ - z);
                
                for (var y = 0; y <= 4; ++y) {
                    var barTop = (y - cameraY - 0.25) * mult * 200 + halfHeight;
                    var barBottom = (y - cameraY + 0.25) * mult * 200 + halfHeight;
                    
                    if (z == 12 && y == 4 && pic > 0) {
                        pictureY = barTop;
                    }
                    
                    if (barBottom > 0 && barTop < height) {
                        if (z == 0) {
                            context.fillStyle ="#553244";
                            context.fillRect(0, barTop, width, barBottom - barTop);
                        }
                    
                        for (var x = 0; x <= 5; ++x) {
                            var xColorOffset = (x * x) & 1;
                            
                            var barLeft = (x - cameraX - 0.25) * mult * 200 + halfWidth;
                            var barRight = (x - cameraX + 0.25) * mult * 200 + halfWidth;
                            
                            if (barRight > 0 && barLeft < width) {
                                context.fillStyle = artworkColors[z + xColorOffset];
                                context.fillRect(barLeft, barTop, barRight - barLeft, barBottom - barTop);
                            }
                        }
                    }
                }
            }
            
            if (chapterComplete < 0.05) {
                context.globalAlpha = 1 - (chapterComplete * 20);
                context.fillStyle = "#000000";
                context.fillRect(0, 0, width, height);
            }
        }
        
        if (pictureY < height) {
            context.drawImage(artwork, 0, pictureY, 640, 512);
            if (subId == 1 && chapterComplete > 0.95) {
                context.globalAlpha = (chapterComplete - 0.95) * 20;
                context.fillStyle = "#441022";
                context.fillRect(0, 0, width, height);
            }
        }
    };
    
    // *** Chaos rotation zoom renderer
    
    var chaosBufferCanvases, chaosBufferContexts;
    
    var chaosRotationPrepare = function() {
        chaosBufferCanvases = [];
        chaosBufferContexts = [];
        
        for (var i = 0; i < 2; ++i) {
            var canv = create("CANVAS");
            canv.width = width;
            canv.height = height;
            var cont = canv.getContext("2d");
            cont.fillStyle = "#441022";
            cont.fillRect(0, 0, width, height);
            
            chaosBufferCanvases.push(canv);
            chaosBufferContexts.push(cont);
        }
    };
    
    var chaosBufferIndex = 0;
    
    var chaosBlockSize = 16;
    var chaosHalfBlockSize = 8;
    
    var chaosRotationRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Chaos rotation";
            }
        }
        
        var source = chaosBufferCanvases[chaosBufferIndex];
        chaosBufferIndex = 1 - chaosBufferIndex;
        var target = chaosBufferContexts[chaosBufferIndex];
        
        for (var y = 0; y < height; y += chaosBlockSize) {
            var midY = y + chaosHalfBlockSize;
            var yFromCenter = midY - halfHeight;
            
            for (var x = 0; x < width; x += chaosBlockSize) {
                var midX = x + chaosHalfBlockSize;
                var xFromCenter = midX - halfWidth;
                
                var sourceX = (xFromCenter + yFromCenter / 48) * 0.995 + halfWidth - chaosHalfBlockSize;
                var sourceY = (yFromCenter - xFromCenter / 48) * 0.995 + halfHeight - chaosHalfBlockSize;
                
                if (sourceX < 0) sourceX = 0;
                if (sourceX > (width - chaosBlockSize)) sourceX = width - chaosBlockSize;
                if (sourceY < 0) sourceY = 0;
                if (sourceY > (height - chaosBlockSize)) sourceY = height - chaosBlockSize;
                
                target.drawImage(source, sourceX, sourceY, chaosBlockSize, chaosBlockSize, x, y, chaosBlockSize, chaosBlockSize);
            }
        }
        
        if (chapterComplete < 0.75) {
            var angle = chapterOffset * 17;
            var phase = chapterOffset * 7;
            
            target.fillStyle = "#ffffff";
            var distance = 30 * sinus[phase & 65535] + 90;
            var posX = halfWidth + distance * sinus[angle & 65535] - 10;
            var posY = halfHeight + distance * sinus[(angle + 16384) & 65535] - 10;
            for (var i = 0; i < 9; ++i) {
                target.fillRect((rnd() * 20 + posX), (rnd() * 20 + posY), 2, 2);
            }
            
            angle *= -1.1;
            angle += 7000;
            phase *= 1.05;
            
            target.fillStyle = "#883366";
            distance = 30 * sinus[phase & 65535] + 90;
            posX = halfWidth + distance * sinus[angle & 65535] - 10;
            posY = halfHeight + distance * sinus[(angle + 16384) & 65535] - 10;
            for (var i = 0; i < 9; ++i) {
                target.fillRect((rnd() * 20 + posX), (rnd() * 20 + posY), 2, 2);
            }
            
            angle *= -0.8;
            phase *= -1.05;
            
            target.fillStyle = "#aa7766";
            distance = 30 * sinus[phase & 65535] + 90;
            posX = halfWidth + distance * sinus[angle & 65535] - 10;
            posY = halfHeight + distance * sinus[(angle + 16384) & 65535] - 10;
            for (var i = 0; i < 9; ++i) {
                target.fillRect((rnd() * 20 + posX), (rnd() * 20 + posY), 2, 2);
            }
            
            angle *= -1.2;
            phase *= -0.9;
            
            target.fillStyle = "#ee8899";
            distance = 30 * sinus[phase & 65535] + 90;
            posX = halfWidth + distance * sinus[angle & 65535] - 10;
            posY = halfHeight + distance * sinus[(angle + 16384) & 65535] - 10;
            for (var i = 0; i < 9; ++i) {
                target.fillRect((rnd() * 20 + posX), (rnd() * 20 + posY), 2, 2);
            }
        }
        
        target.fillStyle = "#441022";
        target.beginPath();
        target.arc(halfWidth, halfHeight, 64, 0, 2 * Math.PI, false);
        target.closePath();
        target.fill();
        
        context.drawImage(chaosBufferCanvases[chaosBufferIndex], 0, 0);
        
        if (chapterComplete > 0.95) {
            context.globalAlpha = (chapterComplete - 0.95) * 20;
            context.fillStyle = "#000000";
            context.fillRect(0, 0, width, height);
        }
    };
    
    // *** Anti digit mode renderer
    
    var antiDigitPics = [];
    
    var antiDigitRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Anti digit mode";
            }
        }
        
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        
        context.save();
        context.scale(0.5, 1);
        context.font = "bold 80px sans-serif";
        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText("anti digit mode", width, 0);
        context.restore();
        
        if (chapterOffset > 4520) {
            context.drawImage(antiDigitPics[4], halfWidth - 160, 120, 320, 256);
        } else if (chapterOffset > 3640) {
            context.drawImage(antiDigitPics[3], halfWidth - 160, 120, 320, 256);
        } else if (chapterOffset > 2760) {
            context.drawImage(antiDigitPics[2], halfWidth - 160, 120, 320, 256);
        } else if (chapterOffset > 1880) {
            context.drawImage(antiDigitPics[1], halfWidth - 160, 120, 320, 256);
        } else if (chapterOffset > 1000) {
            context.drawImage(antiDigitPics[0], halfWidth - 160, 120, 320, 256);
        }
        
        if (chapterComplete > 0.9) {
            context.globalAlpha = (chapterComplete - 0.9) * 10;
            context.fillStyle = "#000000";
            context.fillRect(0, 0, width, height);
        }
    };
    
    // *** Shame on us renderer
    
    var shameParts = [
        { // SHAME
            from : 0,
            l : 119,
            t : 0,
            r : 210,
            b : 18
        }, { // ON
            from : (3*60+10.9)*1000 - 189500,
            l : 224,
            t : 0,
            r : 263,
            b : 18
        }, { // US
            from : (3*60+11.8)*1000 - 189500,
            l : 278,
            t : 0,
            r : 310,
            b : 18
        }, { // IT'S
            from : (3*60+12.7)*1000 - 189500,
            l : 191,
            t : 26, 
            r : 229,
            b : 44
        }, { // PRACTICALLY
            from : (3*60+13.5)*1000 - 189500,
            l : 96,
            t : 52, 
            r : 270,
            b : 70
        }, { // THE
            from : (3*60+14.4)*1000 - 189500,
            l : 282,
            t : 52, 
            r : 330,
            b : 70
        }, { // E
            from : (3*60+15.0)*1000 - 189500,
            l : 173,
            t : 78, 
            r : 185,
            b : 96
        }, { // N
            from : (3*60+15.3)*1000 - 189500,
            l : 199,
            t : 78, 
            r : 217,
            b : 96
        }, { // D
            from : (3*60+15.65)*1000 - 189500,
            l : 232,
            t : 78, 
            r : 249,
            b : 96
        }, { // OF
            from : (3*60+16.0)*1000 - 189500,
            l : 191,
            t : 108, 
            r : 223,
            b : 126
        }, { // ARTE
            from : (3*60+16.6)*1000 - 189500,
            l : 0,
            t : 126, 
            r : 416,
            b : 188
        }
    ];
    
    var shameOnUs;
    
    var shameOnUsRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Shame on us";
            }
        }

        context.fillStyle = "#000000"
        context.fillRect(0, 0, width, height);
        
        for (var i = 0; i < shameParts.length; ++i) {
            var part = shameParts[i];
            if (chapterOffset > part.from) {
                context.drawImage(shameOnUs, part.l, part.t, part.r-part.l, part.b-part.t,
                                  halfWidth - shameOnUs.width / 2 + part.l, halfHeight - shameOnUs.height + part.t * 2,
                                  (part.r - part.l), (part.b - part.t) * 2);
            }
        }
        
        if (chapterComplete > 0.9) {
            context.globalAlpha = (chapterComplete - 0.9) * 10;
            context.fillStyle = "#000000";
            context.fillRect(0, 0, width, height);
        }
    };
    
    // *** No AGA renderer
    
    var noAgaTroll, flash, silverlight, webGl, aga;
    
    var noAgaRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "No AGA";
            }
        }

        context.fillStyle = "#000000"
        context.fillRect(0, 0, width, height);
        
        if (chapterOffset < 3000) {
            var alpha = (chapterOffset < 500) ? chapterOffset / 500 :
                        (chapterOffset > 2500) ? (3000 - chapterOffset) / 500 :
                        1;
            context.globalAlpha = alpha;
            
            context.drawImage(aga, 109+228, 119+98, 118, 130);
        }
        
        if (chapterOffset > 2500 && chapterOffset < 5000) {
            var alpha = (chapterOffset < 3000) ? (chapterOffset - 2500) / 500 :
                        (chapterOffset > 4500) ? (5000 - chapterOffset) / 500 :
                        1;
            context.globalAlpha = alpha * 0.5;
            
            context.drawImage(flash, 109+228, 119+71, 118, 138);
        }
        
        if (chapterOffset > 4500 && chapterOffset < 7000) {
            var alpha = (chapterOffset < 5000) ? (chapterOffset - 4500) / 500 :
                        (chapterOffset > 6500) ? (7000 - chapterOffset) / 500 :
                        1;
            context.globalAlpha = alpha;
            
            context.drawImage(silverlight, 109+228, 119+82, 118, 117);
        }
        
        if (chapterOffset > 6500 && chapterOffset < 9000) {
            var alpha = (chapterOffset < 7000) ? (chapterOffset - 6500) / 500 :
                        (chapterOffset > 8500) ? (9000 - chapterOffset) / 500 :
                        1;
            context.globalAlpha = alpha * 0.5;
            
            context.drawImage(webGl, 109+228, 119+114, 200, 89);
        }
        
        context.globalAlpha = (chapterOffset < 500) ? chapterOffset / 500 :
                              (chapterOffset > 8500) ? (9000 - chapterOffset) / 500 :
                              1;
        
        context.drawImage(noAgaTroll, 109, 119, 422, 274);
    };
    
    var renderers = [
            endPartLoadedRenderer,
            dotfieldScrollerRenderer,
            sinePlasmaRenderer,
            stripeBallRenderer,
            html5InsideRenderer,
            simpleImageRenderer,
            rainbowChaosRenderer,
            artworkRenderer,
            chaosRotationRenderer,
            antiDigitRenderer,
            shameOnUsRenderer,
            noAgaRenderer
        ],

    chapters = [
        {
            from : 0,
            to : 10000,
            rendererIndex : 0,
            subId : 0
        }, {
            from : 10000,
            to : 29400,
            rendererIndex : 1,
            subId : 0
        }, {
            from : 29400,
            to : 62400,
            rendererIndex : 2,
            subId : 0
        }, {
            from : 62400,
            to : 77000,
            rendererIndex : 3,
            subId : 0
        }, {
            from : 77000,
            to : 90000,
            rendererIndex : 4,
            subId : 0
        }, {
            from : 90000,
            to : 92700,
            rendererIndex : 5,
            subId : 0
        }, {
            from : 92700,
            to : 94500,
            rendererIndex : 5,
            subId : 1
        }, {
            from : 94500,
            to : 96200,
            rendererIndex : 5,
            subId : 2
        }, {
            from : 96200,
            to : 105000,
            rendererIndex : 5,
            subId : 3
        }, {
            from : 105000,
            to : 133000,
            rendererIndex : 6,
            subId : 0
        }, {
            from : 133000,
            to : 147000,
            rendererIndex : 7,
            subId : 0
        }, {
            from : 147000,
            to : 154200,
            rendererIndex : 7,
            subId : 1
        }, {
            from : 154200,
            to : 182000,
            rendererIndex : 8,
            subId : 0
        }, {
            from : 182000,
            to : 189500,
            rendererIndex : 9,
            subId : 0
        }, {
            from : 189500,
            to : 200000,
            rendererIndex : 10,
            subId : 0
        }, {
            from : 200000,
            to : 209000,
            rendererIndex : 11,
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
        prepareDotfieldScroller();
        sinePlasmaPrepare();
        stripeBallPrepare();
        html5InsidePrepare();
        prepareSimpleImages();
        rainbowChaosPrepare();
        chaosRotationPrepare();
    },
    
    animFrame = function(time) {
        if (startTime) {
            frameDiff = (time - lastTime) / 1000 * 60;
            
            timeOffset = time - startTime;
            
            var currentChapter = dev ? chapters[select.value] : chapters[currentChapterIndex];
            if (dev) {
                currentChapter.to -= currentChapter.from;
                currentChapter.from = 0;
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
            } else {
                playing = false;
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
            
            if (showFrame || dev) {
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
            if (currentTime < 1) {
//            if (!lastTime) {
                startTime = time - 1000 * currentTime - 250;
            }
            lastTime = time;
        }
        
        if (playing) {
            requestAnimationFrame(animFrame);
        } else {
            var event = document.createEvent("Event");
            event.initEvent("demoDone", true, true);
            
            window.dispatchEvent(event);
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
        image.src = src + "?ts=" + now();
        
        return image;
    },
    
    startingTimerId = null;
    
    onLoadingDone = function() {
        if (startingTimerId) {
            window.clearTimeout(startingTimerId);
            startingTimerId = null;
        }
        
        preCalc();
        
        elekfunk.play();
    };
    
    onItemsLoader = function(event) {
        if (startingTimerId) {
            window.clearTimeout(startingTimerId);
            startingTimerId = null;
        }
        
        context.fillStyle = "#000000"
        context.fillRect(0, 0, width, height);
        context.fillStyle = "#000073";
        context.strokeStyle = "#000073";
        context.lineWidth = 50;
        context.lineCap = "round";
        
        context.beginPath();
        context.moveTo(halfWidth - 200, halfHeight);
        context.lineTo(halfWidth + 200, halfHeight);
        context.stroke();
        
        if (event.done < event.total) {
            context.strokeStyle = "#000000";
            context.lineWidth = 40;
            context.beginPath();
            context.moveTo(halfWidth - 200, halfHeight);
            context.lineTo(halfWidth + 200, halfHeight);
            context.stroke();
            
            context.strokeStyle = "#000073";
            context.lineWidth = 41;
            context.beginPath();
            context.moveTo(halfWidth - 200, halfHeight);
            context.lineTo(halfWidth - 200 + (400 * event.done / event.total), halfHeight);
            context.stroke();
        }
        
        if (event.done == event.total) {
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "20px sans-serif";
            context.fillStyle = "#8080e6";
            context.fillText("Click to start...", halfWidth, halfHeight + 40);
            
            if (autoplay) {
                window.setTimeout(onLoadingDone, 1);
            }
            
            canvas.addEventListener("click", onLoadingDone, false);
        }
    },
    
    onDemoDone = function() {
        //window.location.href = "../part-3/";
    },
    
    onload = function() {
        canvas = document.getElementById("demo");
        context = canvas.getContext("2d");
        
        playing = false;
        
        window.addEventListener("itemsLoader", onItemsLoader, false);
        window.addEventListener("demoDone", onDemoDone, false);
        
        elekfunk = loadAudio("elekfunk.ogg", "elekfunk.mp3");
        muscleMan = loadImage("muscleMan.png");
        sinePlasma = loadImage("sinePlasma.png");
        murky = loadImage("murky.png");
        intelOutside = loadImage("intelOutside2.png");
        mMonroe = loadImage("mMonroe2.png");
        shiffer = loadImage("shiffer2.png");
        crawford = loadImage("crawford2.png");
        arte = loadImage("arte2.png");
        artwork = loadImage("artwork.png");
        antiDigitPics.push(loadImage("antiDigit1.png"));
        antiDigitPics.push(loadImage("antiDigit2.png"));
        antiDigitPics.push(loadImage("antiDigit3.png"));
        antiDigitPics.push(loadImage("antiDigit4.png"));
        antiDigitPics.push(loadImage("antiDigit5.png"));
        shameOnUs = loadImage("shameOnUs.png");
        noAgaTroll = loadImage("noAgaTroll.png");
        aga = loadImage("aga.png");
        flash = loadImage("flash.png");
        silverlight = loadImage("silverlight.png");
        webGl = loadImage("webGL.png");
        
        if (dev) {
            select = document.createElement("SELECT");
            for (var i = 0; i < chapters.length - 1; ++i) {
                var chapter = chapters[i];
                var name = renderers[chapter.rendererIndex]("getName") + ", part " + chapter.subId;
                var option = document.createElement("OPTION");
                option.value = i;
                option.appendChild(document.createTextNode(name));
                if (chapter.rendererIndex == 11) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
            document.body.insertBefore(select, document.body.firstChild);
        }
    };

    window.onload = onload;
})();
