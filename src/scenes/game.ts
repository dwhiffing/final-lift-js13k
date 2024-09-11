import { getContext, on, onPointer, Text } from 'kontra'
import { Path } from '../entities/Path'
import { Background } from '../entities/bg'
import { delayedCall } from '../utils/delayedCall'
import { floatToHex } from '../utils/floatToHex'
import {
  BASE_DURATION,
  FLOORS_PER_DIFFICULTY,
  getFloorButtons,
  lerpQuad,
  playSound,
  START_TIME,
} from '../utils'
import MUSIC from '../music'

export let camera = {
  zoom: 1.05,
  x: 0,
  y: 0,
  sx: 0,
  sy: 0,
  i: 0,
  m: 0,
  f: 0,
  shake: async (m: number, f: number, duration: number) => {
    camera.m = m
    camera.f = f
    await delayedCall(duration)
    camera.m = camera.f = camera.sy = camera.sx = 0
  },
}

let music,
  a = document.getElementsByTagName('a')[0],
  baseAlpha = 0.75
a.onclick = () => {
  music.playbackRate.value = a.innerHTML === 'mute' ? 0 : 1
  a.innerHTML = a.innerHTML === 'mute' ? 'unmute' : 'mute'
  // @ts-ignore
  zzfxV = zzfxV ? 0 : 0.3
}

export const GameScene = ({ canvas }) => {
  const background = Background({ canvas })

  const shadow = new Path(['#000'])
  shadow.onResize(0, 0, canvas.width, canvas.height)

  const context = getContext(),
    titleText = Text({
      text: 'Final\nLift',
      font: '84px sans-serif',
      x: canvas.width / 2,
      y: canvas.height * 0.4,
    }),
    startText = Text({
      text: 'Press to start',
      font: '32px sans-serif',
      x: canvas.width / 2,
      y: canvas.height * 0.85,
    })

  // phases: 0: time-paused, 1: solve-puzzle, 2: choose-floor, 3: gameover, 4: menu
  let floor = 0,
    phase = 4,
    score = 0,
    timer = 0,
    difficulty = 0

  const moveCamera = async (p: {
    zoom?: number
    x?: number
    duration?: number
  }) => {
    const z = camera.zoom
    const x = camera.x
    await delayedCall(p.duration ?? BASE_DURATION, (progress) => {
      if (typeof p.zoom === 'number')
        camera.zoom = lerpQuad(z, p.zoom, progress)
      if (typeof p.x === 'number') camera.x = lerpQuad(x, p.x, progress)
    })
    if (typeof p.x !== 'number') camera.x = 0
  }

  const fade = async (start = 0, end = 1, duration = BASE_DURATION * 2) => {
    await delayedCall(duration, (progress) => {
      shadow.colors = [`#000000${floatToHex(lerpQuad(start, end, progress))}`]
    })
  }

  const setTimer = async (value: number, absolute = false) => {
    if (absolute) {
      timer = value
      return background.timer.setText(`${timer}`)
    }
    const diff = value > 0 ? 1 : -1
    while (value !== 0 && timer > 0) {
      value += diff * -1
      timer = Math.min(99, timer + diff)
      background.timer.setText(`${timer}`)
      playSound('click')
      await delayedCall(100)
    }
  }
  const updateTimer = async () => {
    if (phase === 1) {
      setTimer(-1)
      if (timer <= 0) {
        setTimer(0, true)
        fade(0.5, 1)
        onGameover()
      }
    }
    await delayedCall(1000)
    updateTimer()
  }
  updateTimer()

  const togglePan = async (active = true) => {
    if (active) {
      await moveCamera({ zoom: 4.25, x: 190, duration: BASE_DURATION })
      background.toggleButtons(true)
    } else {
      background.toggleButtons(false)
      await moveCamera({ zoom: 2, x: 0, duration: BASE_DURATION })
    }
  }

  const startFloor = async (intro = false) => {
    if (intro) {
      background.shadow.colors = [`#00000000`]
      await fade(baseAlpha, 0.5)
      background.puzzle.nextPuzzle(difficulty, floor)
    } else {
      background.updateButtons([])
      await moveCamera({ zoom: 1.05, x: 0 })
      await background.toggleDoor(1)
      await delayedCall(500)
      background.puzzle.nextPuzzle(difficulty, floor)
    }
    await delayedCall(intro ? 500 : 250)
    if (!intro) {
      playSound('elevator')
      await camera.shake(2.75, 4, 1200)
      await delayedCall(500)
    }
    if (floor === 13) {
      background.puzzle.setText('')
      background.shadow.colors = [`#000000ff`]
    }
    background.toggleDoor(0)
    await moveCamera({ zoom: 2, duration: BASE_DURATION * 2 })
    if (floor === 13) {
      await delayedCall(1000)
      await fade(0, 1, 0)
      return onGameover()
    }

    background.updateButtons(
      background.puzzle.getOptions(),
      background.puzzle.getCorrectAnswer(),
    )
    phase = 1
  }

  const finishFloor = async () => {
    // TODO: change score/time based on difficulty
    score += 1
    setTimer(5)
    updateDifficulty()

    background.updateButtons(getFloorButtons(floor))
    await togglePan(true)
  }

  const onGameover = async () => {
    if (phase === 3) return
    phase = 3

    playSound('gameover')
    await delayedCall(1000)
    background.updateButtons([])
    await moveCamera({ zoom: 1.05, x: 0, duration: 0 })

    await background.toggleDoor(1, 0)
    await fade(1, baseAlpha)
    startText.text = `Score: ${score}`
    onFadeMenu(0, 1)
    phase = 4
  }

  const onFadeMenu = (start = 1, end = 0) =>
    delayedCall(1000, (progress: number) => {
      startText.color =
        titleText.color = `#ffffff${floatToHex(lerpQuad(start, end, progress))}`
    })

  fade(1, baseAlpha, 0)

  on('press', async (buttonText) => {
    if (phase !== 1 && phase !== 2) return

    window.__disableClick = true
    const isCorrect = buttonText === background.puzzle.getCorrectAnswer()
    if (!isCorrect && phase === 1) camera.shake(7, 1, BASE_DURATION / 2)
    if (phase === 1) {
      if (isCorrect) {
        phase = 2
        await delayedCall(BASE_DURATION * 2)
        await finishFloor()
      } else {
        setTimer(-3)
      }
    } else {
      floor += +buttonText
      await delayedCall(BASE_DURATION * 2)
      await startFloor()
    }
    window.__disableClick = false
  })

  const updateDifficulty = () => {
    difficulty = Math.min(9, 1 + Math.ceil(score / FLOORS_PER_DIFFICULTY))
    background.timer.setDifficulty(difficulty)
  }

  onPointer('up', (e) => {
    window.__pointerDown = false

    if (!music) {
      console.log(MUSIC.length)
      // @ts-ignore
      // music = zzfxP(...zzfxM(...MUSIC))
      // music.loop = true
    }

    if (phase === 4) {
      phase = 0
      floor = 1
      score = 0
      updateDifficulty()
      setTimer(START_TIME, true)
      onFadeMenu()
      startFloor(true)
      playSound('click')
    }
    if (phase === 1 && camera.zoom >= 2) {
      // @ts-ignore
      const x = e.offsetX ?? e.changedTouches[0].clientX
      const o = x / canvas.width
      if (camera.x === 0) {
        playSound('swap')
        togglePan(true)
      } else if (camera.x === 190 && o < 0.3) {
        playSound('swap')
        togglePan(false)
      }
    }
  })

  onPointer('down', () => {
    window.__pointerDown = true
  })

  return {
    shutdown() {},
    update() {
      background.update()
      canvas.style.cursor = background.buttons.some((b) => b.hovered)
        ? 'pointer'
        : 'initial'
    },
    render() {
      context.save()
      const w = canvas.width / 2
      const h = canvas.height / 2
      if (++camera.i % camera.f === 0) {
        camera.i = 0
        camera.sx = (1 - Math.random() * 2) * camera.m
        camera.sy = (1 - Math.random() * 2) * camera.m
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
