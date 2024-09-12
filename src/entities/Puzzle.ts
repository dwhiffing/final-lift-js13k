import { clamp, getCanvas, Text } from 'kontra'
import { shuffle, randInt, sample } from '../utils'

let puzzleQueue = []
export const Puzzle = () => {
  const { width, height } = getCanvas()
  let options: string[] = [],
    correctAnswer = '-1',
    emojiTexts = []

  const setText = (s = '', color = '#fff') => {
    text.text = s
    text.color = color
  }

  const nextPuzzle = (difficulty = 1, floor = 1) => {
    if (puzzleQueue.length === 0) {
      puzzleQueue = shuffle([
        generateEmojiPuzzle, // 140
        generateWordPuzzle, // 170
        generateRatioPuzzle, // 73
        generateEquationPuzzle, // 240
        generateFloorPuzzle, // 75
        generateSequencePuzzle, // 70
      ])
    }

    const generator = puzzleQueue.shift()

    const puzzle = generator(difficulty, floor)
    options = puzzle.options.map(String)
    correctAnswer = `${puzzle.correctAnswer}`
    setText(puzzle.text)

    emojiTexts =
      puzzle.emojiCounts && floor != 13
        ? placeTextInCircle(puzzle.emojiCounts, width / 2, height * 0.36, 70)
        : []

    text.y = puzzle.emojiCounts ? height * 0.55 : height * 0.5
  }

  const text = Text({
    text: '',
    font: '28px Arial',
    x: width / 2,
    y: height / 2,
    width: 190,
    height: 200,
  })

  return {
    nextPuzzle,
    setText,
    getCorrectAnswer: () => correctAnswer,
    getOptions: () => options,
    render() {
      text.render()
      emojiTexts.forEach((t) => t.render())
    },
  }
}

export const FRUIT_EMOJI = ['🍎', '🍌', '🍇', '🍓', '🍑']

const generateEmojiPuzzle = (difficulty = 1) => {
  const emojis = FRUIT_EMOJI.slice(0, difficulty + 1)
  const counts = emojis.reduce((acc, emoji) => ({ ...acc, [emoji]: 0 }), {})

  for (let i = 0; i < 20 + difficulty * 5; i++) counts[sample(emojis)]++
  const correctAnswer = Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b,
  )
  return {
    emojiCounts: counts,
    text: 'Which are there most of?',
    options: shuffle(Object.keys(counts)),
    correctAnswer,
  }
}

const placeTextInCircle = (emojiCounts, centerX, centerY, radius) => {
  const angleStep = (2 * Math.PI) / Object.keys(emojiCounts).length
  const effectiveAngleStep = angleStep - angleStep * 0.1

  const texts = []
  let currentAngle = 0

  Object.entries(emojiCounts).forEach(([emoji, count]) => {
    for (let i = 0; i < count; i++) {
      const angleEnd = currentAngle + effectiveAngleStep
      const a = angleEnd - currentAngle
      texts.push(
        Text({
          color: '#fff',
          text: emoji,
          font: '24px Arial',
          x:
            centerX +
            Math.random() * radius * Math.cos(Math.random() * a + currentAngle),
          y:
            centerY +
            Math.random() * radius * Math.sin(Math.random() * a + currentAngle),
        }),
      )
    }

    currentAngle += angleStep
  })

  return texts
}
const generateWordPuzzle = (difficulty = 1) => {
  const isLongest = randInt(0, 1)
  const shuffledWords = FRUITS.slice(0, clamp(2, 5, difficulty + 1))

  const questionType = randInt(0, 2)
  const countCharacters = (str, regex) => (str.match(regex) || []).length
  const getMetric = (type) => {
    if (type === 0) return (word) => countCharacters(word, /[aeiouy]/gi)
    if (type === 1) return (word) => countCharacters(word, /[^aeiouy]/gi)
    return (word) => word.length
  }

  const selectedWord = shuffledWords
    .sort((a, b) => a.length - b.length)
    .at(isLongest ? -1 : 0)
  const correctAnswer = getMetric(questionType)(selectedWord)
  const questionLabels = ['vowels', 'consonants', 'letters']

  return {
    text: `${shuffle(shuffledWords).join(', ')}\n\nHow many ${questionLabels[questionType]} in the ${isLongest ? 'long' : 'short'}est word?`,
    options: generateOptions(correctAnswer, difficulty),
    correctAnswer: correctAnswer,
  }
}

const generateRatioPuzzle = (difficulty = 1) => {
  const base = difficulty * 2
  const [amount1, ratio] = [base + randInt(0, 3), base + randInt(0, 5)]
  const cost = amount1 * ratio
  const fruit = sample(FRUITS)
  const amount2 = ratio + randInt(2, 4) * (randInt(0, 1) === 0 ? 1 : -1)
  const correctAnswer = Math.round((cost / amount1) * amount2)

  return {
    text: `${amount1} ${fruit}s cost $${cost}. How much for ${amount2}?`,
    options: generateOptions(correctAnswer, difficulty),
    correctAnswer: correctAnswer,
  }
}

const generateSequencePuzzle = (difficulty = 1) => {
  const op = ['+', '*'][clamp(0, 1, Math.floor(difficulty / 7))]
  const maxStep = op === '*' ? 4 : 15
  let [start, step] = [
    randInt(difficulty, 4 + difficulty),
    randInt(2, clamp(4, maxStep, 2 + difficulty)),
  ]
  let initial = start
  const sequence = Array(3)
    .fill(0)
    .map(() => (op === '+' ? (start += step) : (start *= step)))
  sequence.unshift(initial)
  const correctAnswer = sequence.pop()
  return {
    text: sequence.concat('_').join(', '),
    options: generateOptions(correctAnswer, difficulty),
    correctAnswer: correctAnswer,
  }
}

const generateFloorPuzzle = (difficulty = 1, floor = 1) => {
  const range = difficulty * 2
  const possibleFloors = genArray(range * 2 + 1)
    .map((_, i) => floor - range + i)
    .filter((f) => f > 0 && f !== floor)

  const options = shuffle([
    floor,
    ...shuffle(possibleFloors).slice(0, difficulty),
  ])

  return {
    text: 'What floor are you on?',
    options: options,
    correctAnswer: floor,
  }
}

const generateEquationPuzzle = (difficulty = 1) => {
  const div = Math.ceil(difficulty / 3)
  const mod = 1 + ((difficulty - 1) % 3)
  const availableOps = ['+', '-', '*'].slice(0, mod)
  const ops = genArray(div)
    .map((_, i) => (i === 0 ? availableOps[mod - 1] : sample(availableOps)))
    .sort((a, b) => (a === '*' ? -1 : b === '*' ? 1 : 0))
  const numbers = genArray(div + 1).map(() => randInt(1, div * 3))
  const result = Math.floor(
    numbers.reduce(
      (a, b, i) => ({ '+': a + b, '-': a - b, '*': a * b })[ops[i - 1]],
    ),
  )

  let eq = []
  while (numbers.length) {
    eq.push(numbers.pop())
    if (ops.length) eq.push(ops.pop())
  }

  eq = eq.concat(['=', `${result}`])
  const missingIndex = sample(eq.map((_, i) => i).filter((i) => !isNaN(+eq[i])))
  return {
    text: eq.map((s, i) => (i === missingIndex ? '_' : s)).join(' '),
    options: generateOptions(eq[missingIndex], difficulty),
    correctAnswer: eq[missingIndex],
  }
}

// Helper function to generate options
const generateOptions = (correctAnswer, difficulty) => {
  const errorRange = difficulty * 2
  const optionCount = difficulty + 2

  const options = [+correctAnswer]
  while (options.length < optionCount) {
    const wrongAnswer = +correctAnswer + randInt(-errorRange, errorRange)
    if (!options.includes(wrongAnswer) && wrongAnswer > 0)
      options.push(wrongAnswer)
  }
  return shuffle(options.slice(0, 9))
}

const genArray = (s: number) => new Array(s).fill('')
const FRUITS = 'kiwi apple banana apricot mandarin pineapple watermelon'.split(
  ' ',
)
