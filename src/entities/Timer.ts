import { Sprite, Text } from 'kontra'
import { START_TIME } from '../utils'
export const Timer = () => {
  const screen = Sprite({ color: '#000' })
  const screenText = Text({
    color: '#ff0000',
    text: START_TIME.toString(),
    font: '12px Arial',
    textAlign: 'center',
  })
  return {
    onResize(x, y, width, height) {
      screen.x = x
      screen.y = y
      screen.width = width
      screen.height = height
      screenText.x = x + width / 2
      screenText.y = y - 5 + height / 2
    },
    setText(text) {
      screenText.text = text
    },
    render() {
      screen.render()
      screenText.render()
    },
  }
}
