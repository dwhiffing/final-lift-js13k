import { clamp } from 'kontra'

type IColor = { r: number; g: number; b: number; a: number }
type IVec = { x: number; y: number }

const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp(0, 1, (value - min) / (max - min))
  return x * x * (3 - 2 * x)
}

const generateImage = (
  width: number,
  height: number,
  cb: (v: IVec) => IColor,
) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const imageData = context.getImageData(0, 0, width, height)
  const buf = new ArrayBuffer(imageData.data.length)
  const buf8 = new Uint8ClampedArray(buf)
  const data32 = new Uint32Array(buf)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cb({ x: x / (width - 1) - 0.5, y: y / (height - 1) - 0.5 })
      data32[y * width + x] =
        (clamp(0, 255, c.a * 255) << 24) | // alpha
        (clamp(0, 255, c.b * 255) << 16) | // blue
        (clamp(0, 255, c.g * 255) << 8) | // green
        clamp(0, 255, c.r * 255)
    }
  }
  imageData.data.set(buf8)
  context.putImageData(imageData, 0, 0)

  return canvas
}

export const createGlow = (r: number, g: number, b: number, size: number) =>
  generateImage(size, size, (v) => {
    const d = 1 - Math.sqrt(v.x ** 2 + v.y ** 2) * 2
    const a = smoothstep(0, 1.3, d)
    return { r, g, b, a: a * a * a }
  })
