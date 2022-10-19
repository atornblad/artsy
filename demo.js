'use strict';

let playing = false;
let canvas = null;
let context = null;

let areLoading = [];
let totalLoadingAdded = 0;

const addToLoading = function(item) {
    areLoading.push(item);
    ++totalLoadingAdded;

    var event = document.createEvent("Event");
    event.initEvent("itemsLoader", true, true);
    event.total = totalLoadingAdded;
    event.done = totalLoadingAdded - areLoading.length;
    
    window.dispatchEvent(event);
};

const loadingDone = function(item) {
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
};

let audioProgressTimerId = null;

const onIpadAudioProgressHack = function(audio) {
    audioProgressTimerId = null;
    audio.removeEventListener("progress", onAudioProgress, false);
    loadingDone(audio);
};

const onAudioProgress = function(event) {
    if (audioProgressTimerId) {
        window.clearTimeout(audioProgressTimerId);
    }
    var audio = this;
    audioProgressTimerId = window.setTimeout(function() { onIpadAudioProgressHack(audio); }, 2000);
};

const onAudioCanPlay = function(event) {
    if (audioProgressTimerId) {
        window.clearTimeout(audioProgressTimerId);
        audioProgressTimerId = null;
    }
    this.removeEventListener("progress", onAudioProgress, false);
    loadingDone(this);
};

let onplay;
let ontimeupdate;

const loadAudio = function(oggSource, mp3Source) {
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
};

const onImageLoad = function() {
    loadingDone(this);
};

const loadImage = function(src) {
    var image = new Image();
    
    addToLoading(image);
    
    image.addEventListener("load", onImageLoad, false);
    image.src = src + "?ts=" + now();
    
    return image;
};

const preCalc = (precalcs) => {
    for (const precalc of precalcs) {
        precalc();
    }
};

let startingTimerId = null;

const demo = (renderers, chapters, precalcs, loadCallback, playCallback, doneCallback) => {
    let startTime;
    let currentTime;
    let lastTime;
    let currentChapterIndex = 0;
    let currentQuality = 1;

    const animFrame = function(time) {

        if (startTime) {
            const frameDiff = (time - lastTime) / 1000 * 60;
            
            const timeOffset = time - startTime;
            
            let currentChapter = dev ? chapters[select.value] : chapters[currentChapterIndex];
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
                const currentRenderer = renderers[currentChapter.rendererIndex];
                
                var starting = now();
                context.globalAlpha = 1;
                context.save();
                currentRenderer.call(this, canvas, context, currentChapter.subId, chapterTime, chapterComplete, frameDiff);
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
    };

    onplay = function() {
        playing = true;
        requestAnimationFrame(animFrame);
    };

    ontimeupdate = function(event) {
        currentTime = this.currentTime;
    };

    const onLoadingDone = function() {
        if (startingTimerId) {
            window.clearTimeout(startingTimerId);
            startingTimerId = null;
        }
        
        preCalc(precalcs);
        
        try {
            playCallback(); // livinginsanity.play();
        }
        catch (e) {
    
        }
    };

    const onItemsLoader = (event) => {
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
    };

    const onload = () => {
        canvas = document.getElementById("demo");
        context = canvas.getContext("2d");
        
        playing = false;
        
        window.addEventListener("itemsLoader", onItemsLoader, false);
        window.addEventListener("demoDone", doneCallback, false);

        loadCallback();
        
        if (dev) {
            select = create("SELECT");
            for (var i = 0; i < chapters.length - 1; ++i) {
                var chapter = chapters[i];
                var name = renderers[chapter.rendererIndex]("getName") + ", part " + chapter.subId;
                var option = create("OPTION");
                option.value = i;
                option.appendChild(document.createTextNode(name));
                if (chapter.rendererIndex == 2) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
            document.body.insertBefore(select, document.body.firstChild);
        }
    };

    window.addEventListener('load', onload);
};

    
const width = 640;
const height = 512;    
const halfWidth = width / 2;
const halfHeight = height / 2;
const largestHalf = Math.max(halfWidth, halfHeight);

const globals = {
    'create' : (tagname) => document.createElement(tagname),
    'solidColor' : (r, g, b) => "rgba(" + (r|0) + "," + (g|0) + "," + (b|0) + ",1)",
    'rnd' : () => Math.random(),
    'now' : () => (new Date).getTime(),
    'pi' : Math.PI,
    'smoothComplete' : (complete) => (1 - Math.cos(complete * pi)) / 2,
    'loadImage' : loadImage,
    'loadAudio' : loadAudio,
    'demo' : demo,
    'width': width,
    'height': height,
    'dev': false,
    'autoplay': true,
    'showFrame': false
};

for (let key in globals) {
    window[key] = globals[key];
}
