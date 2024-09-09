import { getCanvas, Text } from 'kontra'
import { baseTextConfig } from '../scenes/game'

export const Puzzle = () => {
  const { width, height } = getCanvas()

  let options: string[] = []
  let correctAnswer = '-1'
  const setText = (s = '') => {
    text.text = s
  }
  const generateNewPuzzle = (difficulty = 1) => {
    let puzzle =
      Math.random() > 0.5
        ? generateEquationPuzzle(difficulty)
        : generateSequencePuzzle(difficulty)
    options = puzzle.options
    correctAnswer = puzzle.correctAnswer
    setText(puzzle.text)
  }

  const text = Text({
    ...baseTextConfig,
    text: '',
    font: '28px Arial',
    x: width / 2,
    y: height / 2,
    width: 190,
    height: 200,
  })

  return {
    generateNewPuzzle,
    setText,
    getCorrectAnswer: () => correctAnswer,
    getOptions: () => options,
    render() {
      text.render()
    },
  }
}
const generateSequencePuzzle = (difficulty = 1) => {
  const ops = { 1: ['+'], 2: ['+', '*'] }[Math.min(difficulty, 2)]
  const op = ops[Math.floor(Math.random() * ops.length)]
  let sequence = [],
    start = Math.floor(Math.random() * 10) + 1,
    step = Math.floor(Math.random() * 5) + 1

  for (let i = 0; i < 4; i++) {
    sequence.push(start)
    start = op === '+' ? start + step : start * step
  }

  const correctAnswer = sequence.pop()
  const options = [correctAnswer]

  while (options.length < 3 + difficulty) {
    let wrong =
      correctAnswer +
      Math.floor(Math.random() * difficulty * 4) -
      difficulty * 2
    if (!options.includes(wrong)) options.push(wrong)
  }

  return {
    text: sequence.concat('_').join(', '),
    options: options.sort(() => Math.random() - 0.5).map(String),
    correctAnswer: `${correctAnswer}`,
  }
}
const generateEquationPuzzle = (difficulty = 1) => {
  const operations = ['+', '-', '*', '/'].slice(0, Math.min(difficulty, 4))
  const equation = `${Math.floor(Math.random() * 10) + 1} ${operations[Math.floor(Math.random() * operations.length)]} ${Math.floor(Math.random() * 10) + 1}`
  const result = Math.floor(eval(equation))

  let equationArray = equation.split(' ').concat('=', `${result}`)
  const hideOptions = equationArray
    .map((_, i) => i)
    .filter((i) => !isNaN(+equationArray[i]))
  let missingIndex = hideOptions[Math.floor(Math.random() * hideOptions.length)]
  let correctAnswer = equationArray[missingIndex]

  const numOptions = Math.min(3 + difficulty, 7)
  const options = [correctAnswer]

  while (options.length < numOptions) {
    const wrongAnswer =
      +correctAnswer +
      Math.floor(Math.random() * difficulty * 4) -
      difficulty * 2
    if (wrongAnswer !== +correctAnswer && !options.includes(`${wrongAnswer}`))
      options.push(`${wrongAnswer}`)
  }

  return {
    text: equationArray.map((s, i) => (i === missingIndex ? '_' : s)).join(' '),
    options: options.sort(() => Math.random() - 0.5).map(String),
    correctAnswer: `${correctAnswer}`,
  }
}
