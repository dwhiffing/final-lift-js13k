import { SpriteClass } from 'kontra'

export class Path extends SpriteClass {
  constructor(colors: string[], horizontal = false) {
    super({ x: 0, y: 0, width: 0, height: 0, anchor: { x: 0, y: 0 } })
    this.colors = colors
    this.horizontal = horizontal
    this.chamferL = 0
    this.chamferR = 0
    this.chamferT = 0
    this.chamferB = 0
  }

  onResize(
    x,
    y,
    width,
    height,
    chamferT = 0,
    chamferR = 0,
    chamferB = 0,
    chamferL = 0,
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.chamferT = chamferT
    this.chamferR = chamferR
    this.chamferB = chamferB
    this.chamferL = chamferL
  }

  draw() {
    const x1 = this.horizontal ? this.width * (this.x < 100 ? 0 : 1) : 0
    const y1 = 0
    const x2 = this.horizontal ? this.width * (this.x > 100 ? 0 : 1) : 0
    const y2 = this.horizontal ? 0 : this.height
    const gradient = this.context.createLinearGradient(x1, y1, x2, y2)
    this.colors.forEach((c, i) =>
      gradient.addColorStop(i / this.colors.length, c),
    )
    this.context.fillStyle = gradient
    this.context.beginPath()
    this.context.moveTo(this.chamferT, -this.chamferL)
    this.context.lineTo(this.width - this.chamferT, -this.chamferR)
    this.context.lineTo(this.width - this.chamferB, this.height + this.chamferR)
    this.context.lineTo(this.chamferB, this.height + this.chamferL)
    this.context.closePath()
    this.context.stroke()
    this.context.fill()
  }
}
