import { getContext, lerp, on, onPointer } from 'kontra'
import { Path } from '../entities/Path'
import { Background } from '../entities/bg'
import { startTimer } from '../utils/startTimer'
import { floatToHex } from './floatToHex'
import { BASE_DURATION } from '../utils'

export let camera = { zoom: 1, x: 0, y: 0 }

export const GameScene = ({ canvas }) => {
  const background = Background({ canvas })
  background.resize()

  const shadow = new Path(['#00000000'])
  shadow.onResize(0, 0, canvas.width, canvas.height)

  const context = getContext()

  let floor = 1

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

  const togglePan = async (active = true) => {
    if (active) {
      await moveCamera({ zoom: 4, x: 200 })
      background.toggleButtons(true)
    } else {
      background.toggleButtons(false)
      await moveCamera({ zoom: 2, x: 0 })
    }
  }

  const setFloor = async (value: number) => {
    floor = value
    background.toggleButtons(false)
    await togglePan(false)
    background.toggleDoor(1)
    await moveCamera({ zoom: 1 })
    await startTimer(1000)
    background.toggleDoor(0)
    await moveCamera({ zoom: 2 })
  }

  const onStart = async () => {
    await fade(1, 0.5)
    await startTimer(1000)
    background.toggleDoor(0)
    await moveCamera({ zoom: 2 })
  }
  onStart()

  on('press', async (a) => {
    // if correct button was press
    if (a === '10') {
      // TODO: gain time
      await setFloor(2)
      // TODO: change floor
      // if incorrect button was press
    } else {
      await setFloor(2)
      // TODO: lose time
    }
  })

  onPointer('up', (e) => {
    window.__pointerDown = false
    if (camera.zoom >= 2) {
      // @ts-ignore
      const o = e.offsetX / canvas.width
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
