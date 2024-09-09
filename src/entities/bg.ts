import { clamp } from 'kontra'
import { BASE_DURATION, lerpQuad } from '../utils'
import { startTimer } from '../utils/startTimer'
import { Button } from './Button'
import { Timer } from './Timer'
import { Path } from './Path'
import { Puzzle } from './Puzzle'

const panelGradient = ['#766656', '#615546']
const doorGradient = ['#9B938B', '#6A5F54', '#584D3F']
const shadowGradient = ['#372C26', '#2A211B']
const floorGradient = ['#55493E', '#3B3126']
const wallGradient = ['#423528', '#524131']

export const Background = ({ canvas }) => {
  let doorPosition = 1
  const objs = {
    floor: new Path(['#444', '#555']),
    shadow: new Path(['#00000000']),
    floor2: new Path(floorGradient),
    floor3: new Path(['#463D33', '#393127']),
    ceiling: new Path([...floorGradient].reverse()),

    puzzle: Puzzle(),

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

    timer: Timer(),
  }

  const buttons = []
  for (let i = 0; i < 15; i++) {
    buttons.push(new Button())
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

    // door offset
    const _d4 = o + w + o2
    const d4 = lerpQuad(_d4 - d2, _d4, doorPosition)
    const d4a = lerpQuad(_d4 + d2 + d2, _d4 + d2, doorPosition)

    objs.shadow.onResize(0, 0, canvas.width, canvas.height)

    objs.ceiling.onResize(0, 0, cw, 106)
    objs.floor.onResize(0, ch / 2 + 100, cw, 120)
    objs.floor2.onResize(0, 560, cw, 240)
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
    const size = 15
    const off = 2
    const cols = 3
    const t = size + off
    const bw = size * cols + off * (cols - 1)

    const x = cw - o - w + size / 2 + (w - bw) / 2
    const y = h2 + h / 2 - (t * 2) / 2 + t / 2 + 1
    objs.timer.onResize(x - size / 2, y - 60, bw, 30)

    buttons.forEach((b, i) => {
      b.x = x + (i % cols) * t
      b.y = y + t * Math.floor(i / cols)
    })
  }

  return {
    buttons,
    doorPosition,
    timer: objs.timer,
    shadow: objs.shadow,
    puzzle: objs.puzzle,
    resize,
    render() {
      const allObjects = [...Object.values(objs), ...buttons]
      allObjects.forEach((o) => o.render())
    },
    toggleButtons(enabled = true) {
      buttons.forEach((b) => {
        b.hovered = b.pressed = false
        b.disabled = b.textNode.text ? !enabled : true
      })
    },
    updateButtons(labels: (string | number)[], correctAnswer?: string) {
      buttons.forEach((b, i) => {
        b.disabled = !labels[i]
        b.textNode.text = labels[i] ? `${labels[i]}` : ''
        b.hasColorState = typeof correctAnswer === 'string'
        b.isCorrect =
          typeof correctAnswer === 'string' ? labels[i] === correctAnswer : true
      })
    },
    toggleDoor(position = 1, duration = BASE_DURATION) {
      return startTimer(duration, (progress) => {
        doorPosition = clamp(0.1, 1, position === 0 ? 1 - progress : progress)
        resize()
      })
    },
    update() {},
  }
}
