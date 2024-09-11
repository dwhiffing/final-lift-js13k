import { getContext, Sprite, Text } from 'kontra'
import { START_TIME } from '../utils'
export const Timer = () => {
  const screen = Sprite({ color: '#000' })
  const screenText = Text({
    color: '#ff0000',
    text: START_TIME.toString(),
    font: '12px Arial',
  })
  let difficulty = 1
  const context = getContext()
  return {
    difficulty,
    onResize(x, y, width, height) {
      screen.x = x
      screen.y = y
      screen.width = width
      screen.height = height
      screenText.x = x + width / 2
      screenText.y = y + height / 2
    },
    setText(text) {
      screenText.text = text
    },
    render() {
      screen.render()
      screenText.render()
      for (let i = 0; i < 10; i++) {
        context.fillStyle = i >= difficulty ? '#440000' : '#ff0000'
        context.beginPath()
        context.arc(
          5.5 + screen.x + i * 4.2,
          screen.y + screen.height - 3,
          1,
          0,
          360,
        )
        context.fill()
      }
    },
  }
}
