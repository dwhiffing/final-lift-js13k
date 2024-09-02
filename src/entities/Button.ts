import { Button as BaseButton, emit, getCanvas, getPointer } from 'kontra'
import { camera } from '../scenes/game'
import { createGlow } from '../utils/glow'

export const Button = (x, y, t = '0', size = 15) =>
  BaseButton({
    x,
    y,
    width: size,
    height: size,
    anchor: { x: 0.5, y: 0.5 },
    padX: 5,
    padY: 5,
    disabled: true,
    text: {
      text: t,
      color: 'white',
      font: '7px Arial, sans-serif',
      width: 5,
      textAlign: 'center',
      anchor: { x: 0, y: 0.55 },
    },
    onUp() {
      emit('press', this.text)
    },
    onOver() {
      if (this.disabled) return
      this.pressed = window.__pointerDown
      this.hovered = true
    },
    onOut() {
      this.pressed = false
      this.hovered = false
    },
    collidesWithPointer: function (pointer) {
      const x = getCanvas().width / 2 + camera.x
      const y = getCanvas().height / 2 + camera.y
      const posX = (pointer.x - x) / camera.zoom + x
      // HACK: have to add 1.5 here for some reason
      const posY = (pointer.y - y) / camera.zoom + y + 1.5
      const dx = posX - this.x
      const dy = posY - this.y

      return Math.sqrt(dx * dx + dy * dy) < size / 2
    },
    render() {
      const s = size
      const ctx = this.context
      const focus = this.focused || this.hovered
      const glowSize = this.pressed ? s * 5 : focus ? s * 3 : s
      const color: [number, number, number] = this.pressed
        ? [0.6, 1, 0.6]
        : [0.9, 0.9, 0.8]
      const glow = createGlow(...color, glowSize)
      ctx.beginPath()
      ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
      ctx.fillStyle = this.disabled ? '#8885' : this.pressed ? '#666' : '#888'
      ctx.lineWidth = 2
      ctx.strokeStyle = this.disabled ? '#aaa5' : focus ? 'white' : '#aaa'
      ctx.closePath()

      ctx.save()
      ctx.clip()
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      if (!this.disabled) {
        const o = (glowSize - s) / 2
        ctx.drawImage(glow, -o, -o)
      }
    },
  })
