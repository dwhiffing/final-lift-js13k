import { init, initPointer, GameLoop } from 'kontra'
import { GameScene } from './scenes/game'
import './zzfx'

declare global {
  interface Window {
    __pointerDown: boolean
    __focused: boolean
    __disableClick: boolean
    safari: boolean
    zzfxV: number
  }
}
const { canvas } = init()

window.safari = window.safari || /iPhone|iPad|iPod/.test(navigator.userAgent)

initPointer()

canvas.width = 400
canvas.height = 700
const scene = GameScene({ canvas })

GameLoop({
  update: () => scene.update(),
  render: () => scene.render(),
}).start()
