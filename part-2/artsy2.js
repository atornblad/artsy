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
    
    // *** Dotfield scroller scene (renderer 0)
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
                    chapterOffset < 10600 ? 5000 :
                    chapterOffset < 12056 ? 5000 + (chapterOffset - 10600) * 45 :
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
        dotfieldTextContext.fillText("lbrtw.com for more info!", (textX) + 170, 30);

        dotfieldTextContext.font = "bold 40px sans-serif";
        dotfieldTextContext.fillText("SANITY", (textX) + 500, 30);
        
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
                if (z == 0 && x == 0) {
                    console.log(screenX, screenY);
                }
                
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
    
    var renderers = [
            endPartLoadedRenderer,
            dotfieldScrollerRenderer,
            nullRenderer
        ],
    
    nullRendererIndex = 2,

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
            to : 201000,
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
        prepareDotfieldScroller();
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
    
//    onDemoDone = function() {
//        window.location.href = "/part-3/";
//    },
    
    onload = function() {
        canvas = document.getElementById("demo");
        context = canvas.getContext("2d");
        
        playing = false;
        
        window.addEventListener("itemsLoader", onItemsLoader, false);
//        window.addEventListener("demoDone", onDemoDone, false);
        
        elekfunk = loadAudio("elekfunk.ogg", "elekfunk.mp3");
        muscleMan = loadImage("muscleMan.png");
        
        if (dev) {
            select = document.createElement("SELECT");
            for (var i = 0; i < chapters.length - 1; ++i) {
                var chapter = chapters[i];
                var name = renderers[chapter.rendererIndex]("getName") + ", part " + chapter.subId;
                var option = document.createElement("OPTION");
                option.value = i;
                option.appendChild(document.createTextNode(name));
//                if (i == 0) {
//                    option.selected = true;
//                }
                if (chapter.rendererIndex == 2) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
            document.body.insertBefore(select, document.body.firstChild);
        }
    };

    window.onload = onload;
})();
