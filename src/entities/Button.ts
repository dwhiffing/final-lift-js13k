import { emit, getCanvas, SpriteClass, Text, track } from 'kontra'
import { startTimer } from '../utils/startTimer'
import { camera } from '../scenes/game'
import { createGlow } from '../utils/glow'
import { BASE_DURATION } from '../utils'

export class Button extends SpriteClass {
  init({ disabled = true, ...props } = {}) {
    super.init({
      width: 15,
      height: 15,
      anchor: { x: 0.5, y: 0.5 },
      isCorrect: false,
      hasColorState: false,
      disabled: true,
      state: 0,
      render: function () {
        const s = this.width
        const ctx = this.context
        const focus = this.focused || this.hovered
        const pressed = this.pressed || this.state === 1
        const glowFactor =
          this.state > 1 ? 5 : this.state === 1 ? 3 : focus ? 2 : 1
        const glowSize = glowFactor * s

        const color: [number, number, number] =
          this.state < 2 || !this.hasColorState
            ? [0.9, 0.9, 0.8]
            : this.state === 2
              ? [0.6, 1, 0.6]
              : [1, 0.2, 0.2]

        const glow = createGlow(...color, glowSize)
        ctx.beginPath()
        ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
        ctx.fillStyle = this.disabled ? '#8885' : pressed ? '#666' : '#888'
        ctx.lineWidth = 2
        ctx.strokeStyle = this.disabled ? '#aaa5' : focus ? '#eee' : '#aaa'
        // ctx.closePath()

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
      ...props,
    })

    this.textNode = Text({
      text: '',
      font: '7px Arial, sans-serif',
      width: 5,
      anchor: { x: 0, y: 0.55 },
      context: this.context,
    })

    track(this)
    this.addChild(this.textNode)

    this._uw()
    this._p()
  }

  _p() {
    this.textNode._p()

    let width = this.textNode.width + 5 * 2
    let height = this.textNode.height + 5 * 2

    this.width = Math.max(width, this.width)
    this.height = Math.max(height, this.height)
    this._uw()
  }

  render() {
    if (this._d) this._p()

    super.render()
  }

  onOver() {
    if (!this.disabled) {
      this.hovered = true
      this.pressed = window.__pointerDown
    }
  }

  onOut() {
    this.hovered = false
    this.pressed = false
  }

  onDown() {
    if (!this.disabled) {
      this.pressed = true
    }
  }

  onUp() {
    if (!this.disabled) {
      this.pressed = false
      if (this.state !== 0) return
      this.state = this.isCorrect ? 2 : 3
      startTimer(BASE_DURATION).then(() => {
        emit('press', this.textNode.text)
        this.state = 0
      })
    }
  }

  collidesWithPointer(pointer) {
    const x = getCanvas().width / 2 + camera.x
    const y = getCanvas().height / 2 + camera.y
    const posX = (pointer.x - x) / camera.zoom + x
    // HACK: have to add 1.5 here for some reason
    const posY = (pointer.y - y) / camera.zoom + y + 1.5
    const dx = posX - this.x
    const dy = posY - this.y

    return Math.sqrt(dx * dx + dy * dy) < this.width / 2
  }
}
