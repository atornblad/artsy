(function() {
    // http://bitworld.bitfellas.org/demo.php?id=248
    
    // Minify, step 1: http://closure-compiler.appspot.com/home
    // Minify, step 2: http://www.iteral.com/jscrush/
    
    var dev = false;
    var rnd = Math.random;
    var timeOffset = 0;
    var frameDiff = 1;
    
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
        playing, mod, livininsanity, select;

    // *** Disc tunnel effect (renderer 0)
    // http://youtu.be/_5HacABiXUE?t=2m9s
    // 0.0: Single disc going from near screen to far back and then to near screen again, without alpha effect
    //      4000 ms!
    // 0.1: Entering tunnel (starting with 0 discs, building up to all ten), all white discs, all in the middle
    // 0.2: Colored discs appearing (starting far back)
    // 0.3: Bending tunnel - first upward, then far center spinning clockwise, ending by exiting
    //      16000 ms!
    
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
    
    var nullRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Null";
            }
        }

        context.fillStyle = "#240000"
        context.fillRect(0, 0, width, height);
    };
    
    var discTunnelRenderer = function(subId, chapterOffset, chapterComplete, frameDiff) {
        if (dev) {
            if (subId == "getName") {
                return "Disc tunnel";
            }
        }
//        var smoothCC = smoothComplete(chapterComplete);

        context.fillStyle = "#240000"
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
    
    var renderers = [
            nullRenderer,
            discTunnelRenderer
        ],
    
        chapters = [
            {
                from : 0,
                to : 127500,
                rendererIndex : 0,
                subId : 0
            }, {
                from : 127500,
                to : 131500,
                rendererIndex : 1,
                subId : 0
            }, {
                from : 131500,
                to : 138500,
                rendererIndex : 1,
                subId : 1
            }, {
                from : 138500,
                to : 146000,
                rendererIndex : 1,
                subId : 2
            }, {
                from : 146000,
                to : 162000,
                rendererIndex : 1,
                subId : 3
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
                    context.save();
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
            console.log("onplay");
            playing = true;
            requestAnimationFrame(animFrame);
            document.getElementById("pressPlay").style.display = "none";
            if (!dev) {
                mod.style.position = "absolute";
                mod.style.left = "-1000px";
                mod.style.top = "-1000px";
            }
        },
        
        ontimeupdate = function(e) {
            currentTime = livininsanity.currentTime;
        },
        
        onload = function() {
            canvas = document.getElementById("demo");
            context = canvas.getContext("2d");
            mod = document.getElementById("mod");
            livininsanity = document.getElementById("livininsanity");
            playing = false;
            livininsanity.addEventListener("play", onplay, false);
            livininsanity.addEventListener("timeupdate", ontimeupdate, false);
            preCalc();
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
                mod.appendChild(select);
            } else {
                document.getElementById("pressPlay").innerHTML = "Press play!";
                livininsanity.currentTime = 126.5;
                livininsanity.play();
            }
        };
    
    window.onload = onload;
})();
