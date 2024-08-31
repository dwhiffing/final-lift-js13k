import { getContext, lerp } from 'kontra'
import { Background } from '../entities/bg'

export let camera = { zoom: 1, x: 0, y: 0 }

export const GameScene = ({ canvas }) => {
  const background = Background({ canvas })
  background.resize()

  const context = getContext()

  const run = async () => {
    await background.toggleDoor(0)
    await background.toggleDoor(1)
    // await startTimer(1000)
    // await startTimer(800, (progress) => {
    //   camera.zoom = lerp(1, 2, progress)
    // })
    // await startTimer(800, (progress) => {
    //   camera.zoom = lerp(2, 4, progress)
    //   camera.x = lerp(0, 200, progress)
    // })
  }
  run()

  return {
    shutdown() {},
    resize() {
      background.resize()
    },
    update(delta: number) {
      background.update()
    },
    render() {
      context.save()
      const w = canvas.width / 2
      const h = canvas.height / 2
      context.translate(w + camera.x, h + camera.y)
      context.scale(camera.zoom, camera.zoom)
      context.translate(-(w + camera.x), -(h + camera.y))

      background.render()

      context.restore()
    },
  }
}
