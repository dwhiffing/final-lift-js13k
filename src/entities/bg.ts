import { clamp, lerp } from 'kontra'
import { BASE_DURATION } from '../utils'
import { startTimer } from '../utils/startTimer'
import { Button } from './Button'
import { Path } from './Path'

const panelGradient = ['#766656', '#615546']
const doorGradient = ['#9B938B', '#6A5F54', '#584D3F']
const shadowGradient = ['#372C26', '#2A211B']
const floorGradient = ['#55493E', '#3B3126']
const wallGradient = ['#423528', '#524131']

export const Background = ({ canvas }) => {
  let doorPosition = 1
  const objs = {
    floor: new Path(['#444', '#555']),
    floor2: new Path(floorGradient),
    floor3: new Path(['#463D33', '#393127']),
    ceiling: new Path([...floorGradient].reverse()),

    leftDoor: new Path(doorGradient),
    rightDoor: new Path(doorGradient),

    topPanel2: new Path([shadowGradient.at(-1)]),
    leftPanel2: new Path([...shadowGradient].reverse()),
    rightPanel2: new Path([...shadowGradient].reverse()),

    leftPanel: new Path(panelGradient),
    rightPanel: new Path(panelGradient),
    topPanel: new Path(['#55493E', '#76685A']),
    leftWall: new Path([...wallGradient].reverse()),
    rightWall: new Path([...wallGradient].reverse()),
  }

  const buttons = []
  for (let i = 0; i < 10; i++) {
    buttons.push(Button(0, 0, `${i + 1}`))
  }

  const resize = () => {
    const ch = canvas.height
    const cw = canvas.width

    // doorway width
    // const d = clamp(220, 300, canvas.width / 2)
    const d = 220
    // panel height
    const h = 460 * (d / 220)
    // panel width
    const w = d / 3
    // panel x offset
    const o = (cw - d - w * 2) / 2
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

    // door offset
    const _d4 = o + w + o2
    const d4 = lerp(_d4 - d2, _d4, doorPosition)
    const d4a = lerp(_d4 + d2 + d2, _d4 + d2, doorPosition)

    objs.ceiling.onResize(0, 0, cw, 106)
    objs.floor.onResize(0, ch / 2 + h3, cw, 120)
    objs.floor2.onResize(0, 510, cw, 240)
    objs.floor3.onResize(cw / 2 - 300, 600, 600, 110, 140, 0, 0)
    objs.leftPanel.onResize(o, h2, w, h)
    objs.leftPanel2.onResize(o + w, h2, o2, h, 0, o4, 0, 0)
    objs.rightPanel.onResize(cw - o - w, h2, w, h)
    objs.rightPanel2.onResize(cw - o - o2 - w, h2, o2, h, 0, 0, 0, o4)
    objs.topPanel.onResize(o, h2 - w, w2, w)
    objs.topPanel2.onResize(o + w, h2 - w + w, d, Math.abs(o4))
    objs.leftWall.onResize(0, h2 - w, o, h + w, 0, 0, 0, o3)
    objs.rightWall.onResize(cw - o, h2 - w, o, h + w, 0, o3, 0, 0)
    objs.leftDoor.onResize(d4, h2 + o2 + 6, d2, d3 - 6)
    objs.rightDoor.onResize(d4a, h2 + o2 + 6, d2, d3 - 6)
    buttons.forEach((b, i) => {
      const size = 15
      const off = 2
      const t = size + off
      const c = Math.floor(buttons.length / 2)
      const x = cw - o - w + w / 2 - size / 2 - off / 2
      const y = h2 + h / 2 - (t * c) / 2 + t / 2 + 1
      b.x = x + (i % 2) * t
      b.y = y + t * Math.floor(i / 2)
    })
  }

  return {
    buttons,
    doorPosition,
    render() {
      const allObjects = [...Object.values(objs), ...buttons]
      allObjects.forEach((o) => o.render())
    },
    resize,
    toggleButtons(enabled = true) {
      buttons.forEach((b) => {
        b.hovered = false
        b.pressed = false
        b.disabled = !enabled
      })
    },
    toggleDoor(position = 1, duration = BASE_DURATION) {
      return startTimer(duration, (progress) => {
        doorPosition = clamp(0.1, 1, position === 0 ? 1 - progress : progress)
        resize()
      })
    },
    update() {},
    shutdown() {},
  }
}
