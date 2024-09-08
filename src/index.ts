import { init, initPointer, GameLoop, clamp, onPointer } from 'kontra'
import MUSIC from './music'
import { GameScene } from './scenes/game'
import './zzfx'

declare global {
  interface Window {
    __pointerDown: boolean
    zzfxV: number
  }
}
const { canvas } = init()

initPointer()
function onResize() {
  canvas.width = clamp(0, 400, window.innerWidth)
  canvas.height = clamp(0, 700, window.innerHeight)
  scene.resize()
}

canvas.width = clamp(0, 400, window.innerWidth)
canvas.height = clamp(0, 700, window.innerHeight)
const scene = GameScene({ canvas })
window.addEventListener('resize', onResize)

GameLoop({
  update: (delta: number) => scene.update(delta),
  render: () => scene.render(),
}).start()
