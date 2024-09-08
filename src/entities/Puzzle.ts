import { getCanvas, Text } from 'kontra'
export const Puzzle = () => {
  const { width, height } = getCanvas()

  let puzzle: string[] = []
  let options: string[] = []
  let missingIndex = -1
  let correctAnswer = '-1'
  const generateNewPuzzle = (difficulty = 1) => {
    const availableOperations = {
      1: ['+'],
      2: ['+', '-'],
      3: ['+', '-', '*'],
      4: ['+', '-', '*', '/'],
    }

    const operations = availableOperations[Math.min(difficulty, 4)]

    let equation = ''

    for (let i = 0; i < 2; i++) {
      const num = Math.floor(Math.random() * 10) + 1
      const operation =
        operations[Math.floor(Math.random() * operations.length)]

      equation += num

      if (i < 1) {
        equation += ` ${operation} `
      }
    }

    const result = Math.floor(eval(equation))

    puzzle = equation.split(' ').concat('=', `${result}`)

    const hideOptions = Array.from(
      { length: puzzle.length },
      (_, i) => i,
    ).filter((i) => !Number.isNaN(+puzzle[i]))
    missingIndex = hideOptions[Math.floor(Math.random() * hideOptions.length)]

    correctAnswer = puzzle[missingIndex]

    options = []

    const numOptions = Math.min(3 + difficulty, 7)
    const errorRange = difficulty * 2

    options.push(correctAnswer)

    while (options.length < numOptions) {
      const wrongAnswer =
        +correctAnswer + Math.floor(Math.random() * errorRange * 2) - errorRange

      if (
        wrongAnswer !== +correctAnswer &&
        !options.includes(`${wrongAnswer}`)
      ) {
        options.push(`${wrongAnswer}`)
      }
    }

    options = options.sort(() => Math.random() - 0.5)

    text.text = puzzle.map((s, i) => (i === missingIndex ? '_' : s)).join(' ')
  }

  const text = Text({
    color: '#ffffff',
    text: '',
    font: '28px Arial',
    x: width / 2,
    y: height / 2,
    width: 190,
    height: 200,
    textAlign: 'center',
    anchor: { x: 0, y: 0.5 },
  })

  generateNewPuzzle(1)

  return {
    generateNewPuzzle,
    getCorrectAnswer: () => correctAnswer,
    getOptions: () => options,
    setText(text) {
      text.text = text
    },
    render() {
      text.render()
    },
  }
}
