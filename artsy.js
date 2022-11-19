import { ModPlayer } from 'https://atornblad.se/files/js-mod-player/player.js';
import { JsDemo, delay } from './js-demo.js';
import { IntroTextScene } from './intro-text-scene.js';
import { BitmapTunnelScene } from './bitmap-tunnel-scene.js';
import { PictureScene } from './picture-scene.js';
import { DeadChickenScene } from './dead-chicken-scene.js';
import { GlobeScene } from './globe-scene.js';
import { StarsScene } from './stars-scene.js';
import { DiscTunnelScene } from './disc-tunnel-scene.js';
import { DemonWarpScene } from './demon-warp-scene.js';
import { EndScene } from './end-scene.js';

const artsyPart1 = new JsDemo({
    width: 640,
    height: 512,
    target: '#wrapper',
    devMode: document.location.search.indexOf('dev') >= 0
});

const audio = new AudioContext();
const player = new ModPlayer(audio);
await player.load('./livin-insanity.mod');

const intro = new IntroTextScene();
const whaaaaat = new PictureScene('./whaaaaat.png', 1, "#000", 200, "#000", 1, 2, 480);
const bitmapTunnel = new BitmapTunnelScene();
const sanity1Logo = new PictureScene('./sanity1.png', 2, "#fff", 500, "#000", 6, 28, 480);
const madmanLogo = new PictureScene('./madman.png', 2, "#000", 500, "#441010", 6, 60, 480);
const deadChicken = new DeadChickenScene();
const globe = new GlobeScene();
const einstein = new PictureScene('./einstein.png', 2, "#fff", 500, "#000", 12, 60, 480);
const sanity2Logo = new PictureScene('./sanity2.png', 2, "#000", 500, "#000", 13, 28, 480);
const stars = new StarsScene();
const discTunnel = new DiscTunnelScene();
const demonWarp = new DemonWarpScene();
const end = new EndScene();

await artsyPart1.registerScenes(player,
    {
        from: {songPos: 0, row: 0},
        scene: intro
    }, {
        from: {songPos: 1, row: 0},
        scene: whaaaaat
    }, {
        from: {songPos: 2, row: 0},
        scene: bitmapTunnel
    }, {
        from: {songPos: 6, row: 0},
        scene: sanity1Logo
    }, {
        from: {songPos: 6, row: 32},
        scene: madmanLogo
    }, {
        from: {songPos: 7, row: 0},
        scene: deadChicken
    }, {
        from: {songPos: 9, row: 0},
        scene: globe
    }, {
        from: {songPos: 12, row: 0},
        scene: einstein
    }, {
        from: {songPos: 13, row: 0},
        scene: sanity2Logo
    }, {
        from: {songPos: 13, row: 32},
        scene: stars
    }, {
        from: { songPos: 18, row: 0},
        scene: discTunnel
    }, {
        from: { songPos: 23, row: 0},
        scene: demonWarp
    }, {
        from: { songPos: 25, row: 0},
        scene: end
    }
);

player.watchStop(() => {
    delay(2000).then(() => {
        window.location.href = 'part-2/index.html';
    })
});

artsyPart1.start();
