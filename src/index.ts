import { init, initPointer, GameLoop, clamp } from 'kontra'
import { GameScene } from './scenes'
import './zzfx'

let scene
const { canvas } = init()

initPointer()
function onResize() {
  canvas.width = clamp(0, 800, window.innerWidth)
  canvas.height = clamp(0, 700, window.innerHeight)
  scene?.resize()
}

onResize()
window.addEventListener('resize', onResize)

// let music
// let a = document.getElementsByTagName('a')[0]
// a.addEventListener('click', (e) => {
//   music.playbackRate.value = e.target.innerHTML === 'mute' ? 0 : 1
//   e.target.innerHTML = e.target.innerHTML === 'mute' ? 'unmute' : 'mute'
//   window.zzfxV = window.zzfxV === 0 ? 0.3 : 0
// })
// onPointer('up', () => {
//   if (!music) {
//     @ts-ignore
//     music = zzfxP(...zzfxM(...MUSIC))
//     music.loop = true
//     TODO: remove me
//     a.click()
//   }
// })

const startGame = () => {
  scene?.shutdown()
  scene = GameScene({ canvas })
}

startGame()

GameLoop({
  update: (...rest) => scene?.update(...rest),
  render: (...rest) => scene?.render(...rest),
}).start()
