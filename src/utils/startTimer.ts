import { TIME_SCALE } from '../utils'

// let focused = true
// window.addEventListener('focus', () => (focused = true))
// window.addEventListener('blur', () => (focused = false))
// export const requestTimeout = (fn, delay) => {
//   let _delay = delay / 10

//   const loop = () => {
//     if (focused) _delay -= 1
//     if (_delay <= 0) return fn()
//     requestAnimationFrame(loop)
//   }

//   requestAnimationFrame(loop)
// }

export function startTimer(_duration, onProgress?) {
  const duration = _duration / TIME_SCALE
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
