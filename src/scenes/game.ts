import { getContext, lerp, on, onPointer } from 'kontra'
import { Path } from '../entities/Path'
import { Background } from '../entities/bg'
import { startTimer } from '../utils/startTimer'
import { floatToHex } from './floatToHex'
import { BASE_DURATION, shuffle, START_TIME } from '../utils'

export let camera = { zoom: 1, x: 0, y: 0 }

export const GameScene = ({ canvas }) => {
  const background = Background({ canvas })
  background.resize()

  const shadow = new Path(['#00000000'])
  shadow.onResize(0, 0, canvas.width, canvas.height)

  const context = getContext()

  let floor = 1
  // time-paused,solve-puzzle,choose-floor,gameover
  let phase = 0
  let timer = START_TIME

  const moveCamera = async (p: { zoom?: number; x?: number }) => {
    const z = camera.zoom
    const x = camera.x
    await startTimer(BASE_DURATION, (progress) => {
      if (typeof p.zoom === 'number') camera.zoom = lerp(z, p.zoom, progress)
      if (typeof p.x === 'number') camera.x = lerp(x, p.x, progress)
    })
    if (typeof p.x !== 'number') camera.x = 0
  }

  const fade = async (start = 0, end = 1) => {
    await startTimer(BASE_DURATION * 2, (progress) => {
      shadow.colors = [`#000000${floatToHex(lerp(start, end, progress))}`]
    })
  }

  const updateTimer = async () => {
    if (phase === 1) {
      timer--
      background.timer.setText(`${timer}`)
      if (timer === 0) {
        return onGameover()
      }
    }
    await startTimer(1000)
    updateTimer()
  }
  updateTimer()

  const togglePan = async (active = true) => {
    if (active) {
      await moveCamera({ zoom: 3.5, x: 200 })
      background.toggleButtons(true)
    } else {
      background.toggleButtons(false)
      await moveCamera({ zoom: 2, x: 0 })
    }
  }

  const startFloor = async (intro = false) => {
    if (intro) {
      await fade(1, 0.5)
    } else {
      background.updateButtons([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      await moveCamera({ zoom: 1 })
    }
    await startTimer(intro ? 1000 : 5000)
    background.toggleDoor(0)
    await moveCamera({ zoom: 2 })
    phase = 1
  }

  const finishFloor = async (success: boolean) => {
    // TODO: if success, gain time, if not lose time
    background.toggleButtons(false)
    await togglePan(false)
    background.updateButtons(shuffle([1, 2, 3, -1, -2, -3]))
    await background.toggleDoor(1)
    await startTimer(BASE_DURATION / 2)
    await togglePan(true)
  }

  startFloor(true)

  const onGameover = async () => {
    await fade(0.5, 1)
    await moveCamera({ zoom: 1, x: 0 })
    await background.toggleDoor(1)
    phase = 3
  }

  on('press', async (buttonText) => {
    background.toggleButtons(false)
    if (phase === 1) {
      phase = 2
      if (buttonText === '10') {
        await finishFloor(true)
      } else {
        await finishFloor(false)
      }
    } else {
      phase = 0
      floor += Number(buttonText)
      if (floor === 13) {
        return onGameover()
      }
      await startFloor()
    }
  })

  onPointer('up', (e) => {
    window.__pointerDown = false
    if (phase === 3) {
      phase = 0
      floor = 1
      timer = START_TIME
      startFloor(true)
    }
    if (phase === 1 && camera.zoom >= 2) {
      // @ts-ignore
      const x = e.offsetX ?? e.changedTouches[0].clientX
      const o = x / canvas.width
      if (camera.x === 0 && o > 0.3) {
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
      context.translate(w + camera.x, h + camera.y)
      context.scale(camera.zoom, camera.zoom)
      context.translate(-(w + camera.x), -(h + camera.y))

      background.render()
      shadow.render()

      context.restore()
    },
  }
}
