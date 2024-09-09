import { getCanvas, Text } from 'kontra'
import { shuffle } from '../utils'
import { baseTextConfig } from '../scenes/game'

export const Puzzle = () => {
  const { width, height } = getCanvas()

  let options: string[] = []
  let correctAnswer = '-1'
  const setText = (s = '') => {
    text.text = s
  }
  let emojiTexts = []
  const generateNewPuzzle = (difficulty = 1, floor = 1) => {
    const generator = shuffle([
      generateEmojiPuzzle,
      generateWordPuzzle,
      generateRatioPuzzle,
      generateEquationPuzzle,
      generateFloorPuzzle,
      generateSequencePuzzle,
    ])[0]
    let puzzle = generator(difficulty, floor)
    Math.random() > 0.5
      ? generateEquationPuzzle(difficulty)
      : generateSequencePuzzle(difficulty)
    options = puzzle.options
    correctAnswer = puzzle.correctAnswer
    setText(puzzle.text)

    const isEmoji = !!Object.keys(puzzle.emojiCounts ?? {}).length
    if (isEmoji)
      emojiTexts = placeTextInCircle(
        puzzle.emojiCounts,
        getCanvas().width / 2,
        getCanvas().height * 0.36,
        70,
      )

    text.y = isEmoji ? height * 0.55 : height * 0.5
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
      emojiTexts.forEach((t) => t.render())
    },
  }
}
const fruit = ['🍎', '🍌', '🍇', '🍓', '🍑']
const generateEmojiPuzzle = (difficulty = 1) => {
  const emojis = fruit.slice(0, difficulty + 1)
  const numEmojis = Math.min(10 + difficulty * 2, 20)
  const counts = emojis.reduce((acc, emoji) => {
    acc[emoji] = 0
    return acc
  }, {})

  for (let i = 0; i < numEmojis; i++) {
    const emoji = shuffle(emojis)[0]
    counts[emoji]++
  }
  const correctAnswer = Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b,
  )

  const options = Object.keys(counts).filter((emoji) => counts[emoji] > 0)

  return {
    emojiCounts: counts,
    text: `Which are there most of?`,
    options: shuffle(options),
    correctAnswer,
  }
}

const placeTextInCircle = (emojiCounts, centerX, centerY, radius) => {
  const quadrants = Object.keys(emojiCounts).length
  const angleStep = (2 * Math.PI) / quadrants
  const gapAngle = angleStep * 0.1
  const effectiveAngleStep = angleStep - gapAngle

  const texts = []
  let currentAngle = 0

  const getRandomPosition = (angleStart, angleEnd, effectiveRadius) => ({
    x:
      centerX +
      Math.random() *
        effectiveRadius *
        Math.cos(Math.random() * (angleEnd - angleStart) + angleStart),
    y:
      centerY +
      Math.random() *
        effectiveRadius *
        Math.sin(Math.random() * (angleEnd - angleStart) + angleStart),
  })

  Object.entries(emojiCounts).forEach(([emoji, count]) => {
    const angleRange: [number, number] = [
      currentAngle,
      currentAngle + effectiveAngleStep,
    ]

    for (let i = 0; i < count; i++) {
      const { x, y } = getRandomPosition(...angleRange, radius)
      texts.push(
        Text({
          color: '#fff',
          text: emoji,
          font: '24px Arial',
          textAlign: 'center',
          x,
          y,
        }),
      )
    }

    currentAngle += angleStep
  })

  return texts
}

const generateWordPuzzle = (difficulty = 1) => {
  const wordList =
    'apple banana grape watermelon orange kiwi strawberry mango pineapple blueberry'.split(
      ' ',
    )

  const selectedWords = shuffle(wordList).slice(0, difficulty + 2)
  const countVowels = (word) => (word.match(/[aeiou]/gi) || []).length

  const getShortestWord = () =>
    selectedWords.reduce((a, b) => (a.length < b.length ? a : b))
  const getLongestWord = () =>
    selectedWords.reduce((a, b) => (a.length > b.length ? a : b))

  const questionType = Math.floor(Math.random() * 2)

  let question = ''
  let correctAnswer = 0

  if (questionType === 0) {
    question = `How many vowels does the shortest word have?`
    correctAnswer = countVowels(getShortestWord())
  } else {
    question = `How many letters does the longest word have?`
    correctAnswer = getLongestWord().length
  }

  const options = [correctAnswer]
  const errorRange = difficulty + 2

  while (options.length < 3 + difficulty) {
    let wrongAnswer =
      correctAnswer + Math.floor(Math.random() * errorRange * 2) - errorRange
    if (
      wrongAnswer !== correctAnswer &&
      !options.includes(wrongAnswer) &&
      wrongAnswer > 0
    ) {
      options.push(wrongAnswer)
    }
  }

  const shuffledOptions = shuffle(options)

  return {
    text: `Words: ${selectedWords.join(', ')}\n${question}`,
    options: shuffledOptions.map(String),
    correctAnswer: `${correctAnswer}`,
  }
}

const generateRatioPuzzle = (difficulty = 1) => {
  const apples1 = Math.floor(Math.random() * 4 + 1) * difficulty
  const ratio = Math.floor(Math.random() * 5 + 2) * difficulty
  const coins1 = apples1 * ratio
  const apples2 = Math.floor(Math.random() * 6 + 3) * difficulty

  const correctAnswer = Math.round((coins1 / apples1) * apples2)

  const options = [correctAnswer]
  const errorRange = difficulty * 5

  while (options.length < 3 + difficulty) {
    let wrongAnswer =
      correctAnswer + Math.floor(Math.random() * errorRange * 2) - errorRange
    if (
      wrongAnswer !== correctAnswer &&
      !options.includes(wrongAnswer) &&
      wrongAnswer > 0
    ) {
      options.push(wrongAnswer)
    }
  }

  const shuffledOptions = shuffle(options)

  return {
    text: `If ${apples1} apples cost ${coins1} coins, how many coins for ${apples2} apples?`,
    options: shuffledOptions.map(String),
    correctAnswer: `${correctAnswer}`,
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
    options: shuffle(options).map(String),
    correctAnswer: `${correctAnswer}`,
  }
}
const generateFloorPuzzle = (difficulty = 1, floor = 1) => {
  const range = Math.max(2, difficulty * 3)
  const possibleFloors = Array.from(
    { length: range * 2 + 1 },
    (_, i) => floor - range + i,
  ).filter((f) => f !== floor)

  const options = shuffle([floor, ...shuffle(possibleFloors).slice(0, 4)])

  return {
    text: 'What floor are you on?',
    options: options.map(String),
    correctAnswer: `${floor}`,
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
    options: shuffle(options).map(String),
    correctAnswer: `${correctAnswer}`,
  }
}
