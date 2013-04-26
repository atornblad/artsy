(function() {
    // http://bitworld.bitfellas.org/demo.php?id=248
    
    var dev = true;
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

    // *** Disc tunnel effect (episode #?)
    // http://youtu.be/_5HacABiXUE?t=2m9s
    
    var discIndexOffset = 0;
    var discZOffset = 0;
    var discRotation = 0;
    var discFarA = 0;
    var discFarR = halfWidth;
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

        context.fillStyle = "#240000"
        context.fillRect(0, 0, width, height);
        
        var discFarX = halfWidth + sinus[discFarA] * discFarR;
        var discFarY = halfHeight + sinus[(discFarA + 16384) % 65536] * discFarR;
        
        discFarA = (discFarA + 100) % 65536;
        
        for (var disc = 9; disc >= 0; --disc) {
            var z = 50 + 100 * disc + discZOffset; // From 50 to (50 + 10 * 10) = 1050 
            var alpha = 1 - (z - 50) / 1000;
            
            var centerX = halfWidth;
            var centerY = halfHeight;
            var colorIndex = (disc + discIndexOffset) % 4;
            var color = discColors[colorIndex];
            
            var discX = (centerX * alpha) + (discFarX * (1 - alpha));
            var discY = (centerY * alpha) + (discFarY * (1 - alpha));
                
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

            for (var a = 65536; a >= 0; a -= 1024) {
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
        
        var newDiscZOffset = (discZOffset + 91) % 100;
        if (newDiscZOffset > discZOffset) {
            ++discIndexOffset;
        }
        discZOffset = newDiscZOffset;
        
        discRotation = (discRotation + 65091) % 65536;
    };
    
    var renderers = [
            discTunnelRenderer
        ],
    
        chapters = [
            {
                from : 0,
                to : 200000,
                rendererIndex : 0,
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
                    var name = renderers[chapter.rendererIndex]("getName") + "(" + chapter.subId + ")";
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
                livininsanity.play();
            }
        };
    
    window.onload = onload;
})();
