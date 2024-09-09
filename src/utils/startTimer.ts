import { TIME_SCALE } from '../utils'

export function startTimer(_duration, onProgress?) {
  const duration = _duration / TIME_SCALE
  let startTime = 0
  let pausedTime = 0
  let lastTime = 0
  let promise = new Promise((resolve) => {
    function update(d) {
      if (!startTime) startTime = d
      let progress = 0
      if (window.__focused) {
        const elapsed = d - startTime - pausedTime
        progress = Math.min(elapsed / (duration || 1), 1)

        onProgress?.(progress)
      } else {
        pausedTime += d - lastTime
      }

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        resolve(0)
      }

      lastTime = d
    }

    requestAnimationFrame(update)
  })
  return promise
}
