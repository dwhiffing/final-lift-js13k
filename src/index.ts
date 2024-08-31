import { init, initPointer, GameLoop, clamp } from 'kontra'
import { GameScene } from './scenes/game'
import './zzfx'

declare global {
  interface Window {
    __pointerDown: boolean
  }
}
const { canvas } = init()

initPointer()
function onResize() {
  canvas.width = clamp(0, 600, window.innerWidth)
  canvas.height = clamp(0, 700, window.innerHeight)
  scene.resize()
}

canvas.width = clamp(0, 600, window.innerWidth)
canvas.height = clamp(0, 700, window.innerHeight)
const scene = GameScene({ canvas })
window.addEventListener('resize', onResize)

GameLoop({
  update: (delta: number) => scene.update(delta),
  render: () => scene.render(),
}).start()

// let music
// let a = document.getElementsByTagName('a')[0]
// a.addEventListener('click', (e) => {
//   music.playbackRate.value = e.target.innerHTML === 'mute' ? 0 : 1
//   e.target.innerHTML = e.target.innerHTML === 'mute' ? 'unmute' : 'mute'
//   window.zzfxV = window.zzfxV === 0 ? 0.3 : 0
// })
// onPointer('up', () => {
//   if (!music) {
//     // @ts-ignore
//     music = zzfxP(...zzfxM(...MUSIC))
//     music.loop = true
//     // TODO: remove me
//     a.click()
//   }
// })
