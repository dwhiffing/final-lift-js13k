import { clamp, getContext, lerp } from 'kontra'
import { Background } from '../entities/bg'

export let camera = { zoom: 1, x: 0, y: 0 }

export const GameScene = ({ canvas }) => {
  const background = Background({ canvas })
  background.resize()

  const context = getContext()

  const thing = async () => {
    await startTimer(1500)
    await startTimer(1500, (progress) => {
      // zoom = lerp(1, 2, progress)
    })
    // const _x = x
    // await startTimer(500)
    // await startTimer(500, (progress) => {
    //   zoom = lerp(1.5, 3, progress)
    // })
    // await startTimer(500, (progress) => {
    //   x = lerp(x, _x + 300, progress)
    // })
  }
  thing()

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

function startTimer(duration, onProgress?) {
  const startTime = performance.now() // Get the start time
  let promise = new Promise((resolve) => {
    function update() {
      const currentTime = performance.now() // Get the current time
      const elapsed = currentTime - startTime // Calculate elapsed time
      const progress = Math.min(elapsed / duration, 1) // Calculate progress (0 to 1)

      // Call the onProgress callback with the current progress
      onProgress?.(progress)

      // Check if the timer is complete
      if (progress < 1) {
        requestAnimationFrame(update) // Continue the loop
      } else {
        resolve(0)
      }
    }

    requestAnimationFrame(update) // Start the animation loop
  })
  return promise
}
