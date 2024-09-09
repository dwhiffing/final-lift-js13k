import { getContext, on, onPointer, Text } from 'kontra'
import { Path } from '../entities/Path'
import { Background } from '../entities/bg'
import { startTimer } from '../utils/startTimer'
import { floatToHex } from './floatToHex'
import {
  BASE_DURATION,
  getFloorButtons,
  lerpQuad,
  MUSIC_DISABLED,
  START_TIME,
} from '../utils'
import MUSIC from '../music'

export let camera = { zoom: 1.05, x: 0, y: 0, sx: 0, sy: 0, si: 0 }
export const baseTextConfig = {
  color: '#ffffff',
  textAlign: 'center',
  anchor: { x: 0, y: 0.5 },
}
let music
const baseAlpha = 0.75

let a = document.getElementsByTagName('a')[0]
a.addEventListener('click', (e) => {
  music.playbackRate.value = a.innerHTML === 'mute' ? 0 : 1
  a.innerHTML = a.innerHTML === 'mute' ? 'unmute' : 'mute'
  window.zzfxV = window.zzfxV === 0 ? 0.3 : 0
})

export const GameScene = ({ canvas }) => {
  const background = Background({ canvas })
  background.resize()

  const shadow = new Path(['#000000'])
  shadow.onResize(0, 0, canvas.width, canvas.height)

  const context = getContext()
  const titleText = Text({
    ...baseTextConfig,
    text: 'Final\nLift',
    font: '84px sans-serif',
    x: canvas.width / 2,
    y: canvas.height * 0.4,
  })
  const startText = Text({
    ...baseTextConfig,
    text: 'Press to start',
    font: '32px sans-serif',
    x: canvas.width / 2,
    y: canvas.height * 0.85,
  })

  let floor = 0
  // time-paused,solve-puzzle,choose-floor,gameover
  let phase = 3
  let score = 0
  let timer = 0

  const moveCamera = async (p: {
    zoom?: number
    x?: number
    duration?: number
  }) => {
    const z = camera.zoom
    const x = camera.x
    await startTimer(p.duration ?? BASE_DURATION, (progress) => {
      if (typeof p.zoom === 'number')
        camera.zoom = lerpQuad(z, p.zoom, progress)
      if (typeof p.x === 'number') camera.x = lerpQuad(x, p.x, progress)
    })
    if (typeof p.x !== 'number') camera.x = 0
  }

  const fade = async (start = 0, end = 1, duration = BASE_DURATION * 2) => {
    await startTimer(duration, (progress) => {
      shadow.colors = [`#000000${floatToHex(lerpQuad(start, end, progress))}`]
    })
  }

  const setTimer = (value: number) => {
    timer = value
    background.timer.setText(`${timer}`)
  }
  const updateTimer = async () => {
    if (phase === 1 && timer > 0) {
      setTimer(timer - 1)
      if (timer === 0) {
        await fade(0.5, 1)
        onGameover()
      }
    }
    await startTimer(1000)
    updateTimer()
  }
  updateTimer()

  const togglePan = async (active = true) => {
    if (active) {
      await moveCamera({ zoom: 3.5, x: 200, duration: BASE_DURATION * 0.75 })
      background.toggleButtons(true)
    } else {
      background.toggleButtons(false)
      await moveCamera({ zoom: 2, x: 0, duration: BASE_DURATION * 0.75 })
    }
  }

  const startFloor = async (intro = false) => {
    if (intro) {
      background.shadow.colors = [`#00000000`]
      await fade(baseAlpha, 0.5)
      background.puzzle.generateNewPuzzle(1, floor)
    } else {
      background.updateButtons([])
      await moveCamera({ zoom: 1.05, x: 0 })
      background.timer.setText(`SCORE`)
      await background.toggleDoor(1)
      await startTimer(500)
      background.timer.setText(`${score}`)
      background.puzzle.generateNewPuzzle(1, floor)
    }
    await startTimer(intro ? 500 : 250)
    if (!intro) {
      phase = -1
      await startTimer(2500)
      phase = 0
      await startTimer(500)
    }
    if (floor === 13) {
      background.puzzle.setText('')
      background.shadow.colors = [`#000000ff`]
    }
    background.toggleDoor(0)
    await moveCamera({ zoom: 2 })
    if (floor === 13) {
      return onGameover()
    }
    const p = background.puzzle
    const options = p.getOptions()
    background.updateButtons(options, background.puzzle.getCorrectAnswer())
    phase = 1
  }

  const finishFloor = async (success: boolean) => {
    score += success ? 1 : 0
    setTimer(Math.min(99, timer + (success ? 5 : 0)))

    background.updateButtons(getFloorButtons(floor))
    await togglePan(true)
  }

  const onGameover = async () => {
    await fade(0, 1, 0)
    background.updateButtons([])
    await startTimer(1000)
    await moveCamera({ zoom: 1.05, x: 0, duration: 0 })

    await background.toggleDoor(1, 0)
    await fade(1, baseAlpha)
    startText.text = `Score: ${score}`
    onFadeMenu(0, 1)
    phase = 3
  }

  const onFadeMenu = async (start = 1, end = 0) =>
    startTimer(1000, (progress: number) => {
      startText.color =
        titleText.color = `#ffffff${floatToHex(lerpQuad(start, end, progress))}`
    })

  fade(1, baseAlpha, 0)

  on('press', async (buttonText) => {
    if (phase === 1) {
      phase = 2
      if (buttonText === background.puzzle.getCorrectAnswer()) {
        await finishFloor(true)
      } else {
        await finishFloor(false)
      }
    } else {
      floor += Number(buttonText)
      await startFloor()
    }
  })

  onPointer('up', (e) => {
    window.__pointerDown = false

    if (!music) {
      // @ts-ignore
      music = zzfxP(...zzfxM(...MUSIC))
      music.loop = true
      if (MUSIC_DISABLED) a.click()
    }

    if (phase === 3) {
      phase = 0
      floor = 1
      setTimer(START_TIME)
      onFadeMenu()
      startFloor(true)
    }
    if (phase === 1 && camera.zoom >= 2) {
      // @ts-ignore
      const x = e.offsetX ?? e.changedTouches[0].clientX
      const o = x / canvas.width
      if (camera.x === 0) {
        togglePan(true)
      } else if (camera.x === 200 && o < 0.3) {
        togglePan(false)
      }
    }
  })

  onPointer('down', (e) => {
    window.__pointerDown = true
  })

  return {
    shutdown() {},
    resize() {
      background.resize()
    },
    update(delta: number) {
      background.update()
      canvas.style.cursor = background.buttons.some((b) => b.hovered)
        ? 'pointer'
        : 'initial'
    },
    render() {
      context.save()
      const w = canvas.width / 2
      const h = canvas.height / 2
      if (phase === -1 && ++camera.si % 6 === 0) {
        camera.si = 0
        camera.sx = (1 - Math.random() * 2) * 1
        camera.sy = (1 - Math.random() * 2) * 1
      }
      context.translate(w + camera.x + camera.sx, h + camera.y + camera.sy)
      context.scale(camera.zoom, camera.zoom)
      context.translate(-(w + camera.x), -(h + camera.y))

      background.render()
      shadow.render()
      titleText.render()
      startText.render()

      context.restore()
    },
  }
}
