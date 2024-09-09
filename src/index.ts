import { init, initPointer, GameLoop, clamp } from 'kontra'
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
  update: () => scene.update(),
  render: () => scene.render(),
}).start()
