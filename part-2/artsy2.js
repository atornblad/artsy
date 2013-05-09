// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name artsy2.min.js
// ==/ClosureCompiler==

(function() {
    // http://bitworld.bitfellas.org/demo.php?id=248
    // http://youtu.be/_5HacABiXUE
    
    // Minify, step 1: http://closure-compiler.appspot.com/home
    // Minify, step 2: https://github.com/Siorki/RegPack
    
    var dev = true;
    var autoplay = false;
    var showFrame = true;
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
            nullRenderer
        ],

    chapters = [
        {
            from : 0,
            to : 400000,
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
        
        livininsanity = loadAudio("elekfunk.ogg", "elekfunk.mp3");
        /*whaaaaat = loadImage("whaaaaat.png");
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
        trueArtists = loadImage("trueArtists.png");*/
        
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
