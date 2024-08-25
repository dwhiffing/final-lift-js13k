import { getContext, SpriteClass } from 'kontra'
// import { createGlow, createLedSprite } from './led'

export const Background = ({ canvas }) => {
  const leftPanel = new Rect(['#737373', '#666'])
  const leftPanel2 = new Path(['#555', '#444'])

  const rightPanel = new Rect(['#737373', '#666'])
  const rightPanel2 = new Path(['#555', '#444'])

  const topPanel = new Rect(['#737373'])
  const topPanel2 = new Rect(['#555'])

  const leftWall = new Path(['#555', '#666'], true)
  const rightWall = new Path(['#555', '#666'], true)

  const leftDoor = new Rect(['#A7A7A7', '#A7A7A7', '#888'])
  const rightDoor = new Rect(['#A7A7A7', '#A7A7A7', '#888'])
  const ceiling = new Rect(['#505050', '#505050', '#505050', '#444'])
  const floor = new Rect(['#444', '#555'])
  const floor2 = new Rect(['#555', '#555', '#555', '#505050'])

  // const led = createLedSprite()
  // const glowSize = 90
  // const greenGlow = createGlow(0.6, 0.6, 0.55, glowSize)
  return {
    render() {
      floor.render()
      floor2.render()
      ceiling.render()
      leftDoor.render()
      rightDoor.render()
      topPanel2.render()
      leftPanel2.render()
      rightPanel2.render()
      leftPanel.render()
      rightPanel.render()
      topPanel.render()
      leftWall.render()
      rightWall.render()

      // const x = canvas.width / 2 + 10 - 166
      // const y = 92
      // getContext().drawImage(led, x, y)
      // getContext().drawImage(
      //   greenGlow,
      //   x - glowSize / 2 + 7,
      //   y - glowSize / 2 + 7,
      // )

      // const x2 = canvas.width / 2 + 10 + 128
      // getContext().drawImage(led, x2, y)
      // getContext().drawImage(
      //   greenGlow,
      //   x2 - glowSize / 2 + 7,
      //   y - glowSize / 2 + 7,
      // )
    },
    resize() {
      const ch = canvas.height
      const cw = canvas.width

      // doorway width
      // const d = clamp(220, 300, canvas.width / 2)
      const d = 220
      // panel height
      const h = 420 * (d / 220)
      // panel width
      const w = d / 3
      // panel x offset
      const o = (canvas.width - d - w * 2) / 2
      // panel y offset
      const h2 = (ch - h) / 2
      // inner panel depth x
      const o2 = d / 45
      // inner panel depth y
      const o4 = -o2 * 2
      // top panel width
      const w2 = cw - o * 2
      // door width
      const d2 = d / 2 - o2
      // door height
      const d3 = h - o2 * 3
      // wall chamfer
      const o3 = o / 1.5
      // hall height
      const h3 = 40

      ceiling.onResize(0, 0, cw, ch / 2 - h3)
      floor.onResize(0, ch / 2 + h3, cw, ch * 0.285 - h3)
      floor2.onResize(0, ch / 2 + ch * 0.285, cw, ch - (ch / 2 + ch * 0.285))
      leftPanel.onResize(o, h2, w, h)
      leftPanel2.onResize(o + w, h2, o2, h, 0, o4, 0, 0)

      rightPanel.onResize(cw - o - w, h2, w, h)
      rightPanel2.onResize(cw - o - o2 - w, h2, o2, h, 0, 0, 0, o4)

      topPanel.onResize(o, h2 - w, w2, w)
      topPanel2.onResize(o + w, h2 - w + w, d, Math.abs(o4))

      leftWall.onResize(0, h2 - w, o, h + w, 0, 0, 0, o3)
      rightWall.onResize(cw - o, h2 - w, o, h + w, 0, o3, 0, 0)

      leftDoor.onResize(o + w + o2, h2 + o2, d2, d3)
      rightDoor.onResize(o + w + o2 + d2, h2 + o2, d2, d3)
    },
    update() {
      // leftDoor.x -= 1
      // rightDoor.x += 1
    },
    shutdown() {},
  }
}

export class Rect extends SpriteClass {
  constructor(colors: string[]) {
    super({ x: 0, y: 0, width: 0, height: 0, anchor: { x: 0, y: 0 } })
    this.colors = colors
  }

  onResize(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw() {
    const angle = (90 / 180) * Math.PI
    const x1 = this.x
    const y1 = this.y
    // calculate gradient line based on angle
    const x2 = x1 + Math.cos(angle) * this.height
    const y2 = y1 + Math.sin(angle) * this.height
    const gradient = this.context.createLinearGradient(x1, y1, x2, y2)
    // const gradient = this.context.createLinearGradient(0, 0, 0, this.height)
    this.colors.forEach((c, i) =>
      gradient.addColorStop(i / this.colors.length, c),
    )
    this.context.fillStyle = gradient
    this.context.beginPath()
    this.context.rect(0, 0, this.width, this.height)
    this.context.closePath()
    this.context.stroke()
    this.context.fill()
  }
}

export class Circle extends SpriteClass {
  draw() {
    if (this.opacity === 0) return

    this.context.beginPath()
    this.context.arc(0, 0, this.size / 2, 0, Math.PI * 2)
    this.context.fillStyle = this.color
    this.context.closePath()
    this.context.fill()
  }
}
export class Path extends SpriteClass {
  constructor(colors: string[], horizontal = false) {
    super({ x: 0, y: 0, width: 0, height: 0, anchor: { x: 0, y: 0 } })
    this.colors = colors
    this.chamferL = 0
    this.chamferR = 0
    this.chamferT = 0
    this.chamferB = 0
    this.horizontal = horizontal
  }

  onResize(x, y, width, height, chamferT, chamferR, chamferB, chamferL) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.chamferL = chamferL
    this.chamferR = chamferR
    this.chamferT = chamferT
    this.chamferB = chamferB
  }

  draw() {
    const x1 = this.horizontal ? 200 * (this.x < 100 ? 0 : 1) : 0
    const y1 = 0
    const x2 = this.horizontal ? 200 * (this.x > 100 ? 0 : 1) : 0
    const y2 = this.horizontal ? 0 : 200
    const gradient = this.context.createLinearGradient(x1, y1, x2, y2)
    // const gradient = this.context.createLinearGradient(0, 0, 0, this.height)
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
