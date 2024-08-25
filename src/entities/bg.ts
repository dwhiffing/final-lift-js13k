import { getContext, SpriteClass } from 'kontra'
// import { createGlow, createLedSprite } from './led'

export const Background = ({ canvas }) => {
  const objs = {
    floor: new Path(['#444', '#555']),
    floor2: new Path(['#555', '#555', '#555', '#505050']),
    ceiling: new Path(['#505050', '#505050', '#505050', '#444']),

    leftDoor: new Path(['#A7A7A7', '#A7A7A7', '#888']),
    rightDoor: new Path(['#A7A7A7', '#A7A7A7', '#888']),

    topPanel2: new Path(['#555']),
    leftPanel2: new Path(['#555', '#444']),
    rightPanel2: new Path(['#555', '#444']),

    leftPanel: new Path(['#737373', '#666']),
    rightPanel: new Path(['#737373', '#666']),
    topPanel: new Path(['#737373']),

    leftWall: new Path(['#555', '#666'], true),
    rightWall: new Path(['#555', '#666'], true),
  }

  return {
    render() {
      Object.values(objs).forEach((o) => o.render())

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
      // floor height
      const f = ch * 0.285

      objs.ceiling.onResize(0, 0, cw, ch / 2 - h3)
      objs.floor.onResize(0, ch / 2 + h3, cw, f - h3)
      objs.floor2.onResize(0, ch / 2 + f, cw, ch - ch / 2 + f)
      objs.leftPanel.onResize(o, h2, w, h)
      objs.leftPanel2.onResize(o + w, h2, o2, h, 0, o4, 0, 0)
      objs.rightPanel.onResize(cw - o - w, h2, w, h)
      objs.rightPanel2.onResize(cw - o - o2 - w, h2, o2, h, 0, 0, 0, o4)
      objs.topPanel.onResize(o, h2 - w, w2, w)
      objs.topPanel2.onResize(o + w, h2 - w + w, d, Math.abs(o4))
      objs.leftWall.onResize(0, h2 - w, o, h + w, 0, 0, 0, o3)
      objs.rightWall.onResize(cw - o, h2 - w, o, h + w, 0, o3, 0, 0)
      objs.leftDoor.onResize(o + w + o2, h2 + o2, d2, d3)
      objs.rightDoor.onResize(o + w + o2 + d2, h2 + o2, d2, d3)
    },
    update() {
      // leftDoor.x -= 1
      // rightDoor.x += 1
    },
    shutdown() {},
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
