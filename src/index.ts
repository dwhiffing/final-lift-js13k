import { init, initPointer, GameLoop, clamp } from 'kontra'
import { GameScene } from './scenes/game'
import './zzfx'

declare global {
  interface Window {
    __pointerDown: boolean
    __focused: boolean
    __disableClick: boolean
    zzfxV: number
  }
}
const { canvas } = init()

initPointer()

canvas.width = 400
canvas.height = 700
const scene = GameScene({ canvas })

GameLoop({
  update: () => scene.update(),
  render: () => scene.render(),
}).start()
