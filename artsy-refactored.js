import { ModPlayer } from 'https://atornblad.se/files/js-mod-player/player.js';
import { JsDemo, EmptyScene } from './js-demo.js';
import { IntroTextScene } from './intro-text-scene.js';
import { BitmapTunnelScene } from './bitmap-tunnel-scene.js';

const audio = new AudioContext();
const player = new ModPlayer(audio);
await player.load('./livin-insanity.mod');

const artsyPart1 = new JsDemo({
    width: 640,
    height: 512,
    target: '#wrapper'
});

const intro = new IntroTextScene();
const bitmapTunnel = new BitmapTunnelScene();
const blank = new EmptyScene('#240000');

await artsyPart1.registerScenes(player, {
    from: {songPos: 0, row: 0},
    scene: intro
}, {
    from: {songPos: 2, row: 0},
    scene: bitmapTunnel
}, {
    from: {songPos: 6, row: 0},
    scene: blank
});

artsyPart1.start();
