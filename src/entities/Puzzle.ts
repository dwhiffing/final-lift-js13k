import { clamp, getCanvas, Text } from 'kontra'
import { shuffle, randInt, sample } from '../utils'

const BASE_REWARD = 5
let puzzleQueue = []
export const Puzzle = () => {
  const { width, height } = getCanvas()
  let options: string[] = [],
    correctAnswer = '-1',
    texts = [],
    reward = BASE_REWARD

  const setText = (s = '', color = '#fff') => {
    text.text = s
    text.color = color
    text.y = height * 0.5
  }

  const nextPuzzle = (difficulty = 1, floor = 1) => {
    if (puzzleQueue.length === 0) {
      puzzleQueue = shuffle([
        generateLetterPuzzle, // 140
        generateWordPuzzle, // 170
        generateRatioPuzzle, // 73
        generateEquationPuzzle, // 240
        generateSequencePuzzle, // 70
        generateSpeedPuzzle,
      ])
      puzzleQueue.push(generateFloorPuzzle)
    }

    const generator = puzzleQueue.shift()

    const puzzle = generator(difficulty, floor)
    options = puzzle.options.map(String)
    reward = puzzle.reward
    correctAnswer = Array.isArray(puzzle.correctAnswer)
      ? puzzle.correctAnswer.map(String)
      : [`${puzzle.correctAnswer}`]
    setText(puzzle.text)

    texts =
      puzzle.letterCounts && floor != 13
        ? placeText(puzzle.letterCounts, width / 2 - 50, height * 0.32)
        : []

    text.y = puzzle.letterCounts ? height * 0.65 : height * 0.5
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
    reset: () => {
      puzzleQueue = []
    },
    getCorrectAnswer: () => correctAnswer,
    getOptions: () => options,
    getReward: () => reward,
    render() {
      text.render()
      texts.forEach((t) => t.render())
    },
  }
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E']
const generateLetterPuzzle = (difficulty = 1) => {
  const letters = shuffle(LETTERS).slice(0, 1 + Math.ceil(difficulty / 2))
  const total = clamp(6, 35, difficulty * 4)
  const uniqueCounts = Array.from({ length: letters.length }, (_, i) => i)
  const sum = uniqueCounts.reduce((sum, n) => sum + n)
  const base = Math.floor((total - sum) / letters.length)
  const scaledCounts = uniqueCounts.map((_, i) => i + base)
  const shuffledCounts = shuffle(scaledCounts)
  const counts = letters.reduce(
    (acc, letter, index) => ({ ...acc, [letter]: shuffledCounts[index] }),
    {},
  )

  const askForMost = Math.random() < 0.5
  const correctAnswer = Object.keys(counts).reduce((a, b) =>
    askForMost
      ? counts[a] > counts[b]
        ? a
        : b
      : counts[a] < counts[b]
        ? a
        : b,
  )

  return {
    letterCounts: counts,
    text: `Which are there ${askForMost ? 'most' : 'fewest'} of?`,
    options: shuffle(Object.keys(counts)),
    correctAnswer,
    reward: BASE_REWARD + difficulty,
  }
}
const placeText = (letterCounts: Record<string, number>, x, y) => {
  const texts = []
  let j = 0
  const total = Math.floor(
    Object.values(letterCounts).reduce((sum, n) => sum + n) / 5,
  )
  const offset = ((7 - total) / 2) * 26
  Object.entries(letterCounts).forEach(([letter, count]) => {
    for (let i = 0; i < count; i++) {
      texts.push(
        Text({
          text: letter,
          font: '24px Arial',
          x: x + (j % 5) * 26,
          y: offset + y + Math.floor(j / 5) * 26,
        }),
      )
      j++
    }
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
    options: generateOptions(correctAnswer, difficulty * 2, difficulty + 2),
    correctAnswer: correctAnswer,
    reward: BASE_REWARD + 1 + difficulty,
  }
}

const generateRatioPuzzle = (difficulty = 1) => {
  const mod = 1 + Math.ceil(difficulty / 3)
  const base = clamp(2, 9, mod)
  const [amount1, ratio] = [base + randInt(0, 2), base + randInt(1, 3)]
  const cost = amount1 * ratio
  const fruit = sample(FRUITS)
  const amount2 = amount1 + randInt(1, mod)
  const correctAnswer = Math.round((cost / amount1) * amount2)

  return {
    text: `${amount1} ${fruit}s cost $${cost}. How much for ${amount2}?`,
    options: generateOptions(correctAnswer, difficulty * 2, difficulty + 1),
    correctAnswer: correctAnswer,
    reward: BASE_REWARD + 3,
  }
}

const generateSequencePuzzle = (difficulty = 1) => {
  const hd = Math.floor(difficulty / 2)
  let [start, step] = [
    difficulty + randInt(hd, 2 + hd),
    1 + difficulty + randInt(hd, 2 + hd),
  ]
  let initial = start
  const sequence = Array(3)
    .fill(0)
    .map(() => (start += step))
  sequence.unshift(initial)
  const correctAnswer = sequence.pop()
  return {
    text: sequence.concat('_').join(', '),
    options: generateOptions(correctAnswer, difficulty * 2, difficulty + 2),
    correctAnswer: correctAnswer,
    reward: BASE_REWARD + difficulty,
  }
}

const generateSpeedPuzzle = (difficulty = 1) => {
  const largestFirst = Math.random() > 0.5
  const hd = clamp(0, 2, Math.ceil(difficulty / 3) - 1)
  let acc = 1
  const options = genArray(difficulty + 3)
    .map((_, i) => {
      let result = i + acc
      acc += randInt(0, hd)
      return result
    })
    .slice(0, 12)
  const sortedOptions = options.sort((a, b) => (largestFirst ? b - a : a - b))

  return {
    text: `Press from ${largestFirst ? 'largest' : 'smallest'} to ${!largestFirst ? 'largest' : 'smallest'}`,
    options: shuffle(options),
    correctAnswer: sortedOptions,
    reward: BASE_REWARD + difficulty,
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
    reward: BASE_REWARD + difficulty,
  }
}

const generateEquationPuzzle = (difficulty = 1) => {
  const div = Math.ceil(difficulty / 3)
  const mod = 1 + ((difficulty - 1) % 3)
  const availableOps = ['+', '-'].slice(0, 2)
  const ops = genArray(div).map((_, i) => sample(availableOps))
  const numbers = genArray(div + 1).map(() => randInt(1, div * 3))
  const result = Math.floor(
    numbers.reduce((a, b, i) => ({ '+': a + b, '-': a - b })[ops[i - 1]]),
  )

  let eq = []
  while (numbers.length) {
    eq.push(numbers.shift())
    if (ops.length) eq.push(ops.shift())
  }

  eq = eq.concat(['=', `${result}`])
  const missingIndex = sample(eq.map((_, i) => i).filter((i) => !isNaN(+eq[i])))
  return {
    text: eq.map((s, i) => (i === missingIndex ? '_' : s)).join(' '),
    options: generateOptions(eq[missingIndex], difficulty * 2, difficulty + 2),
    correctAnswer: eq[missingIndex],
    reward: BASE_REWARD + 1 + difficulty,
  }
}

// Helper function to generate options
const generateOptions = (correctAnswer, errorRange, optionCount) => {
  const options = [+correctAnswer]
  while (options.length < optionCount) {
    const wrongAnswer = +correctAnswer + randInt(-errorRange, errorRange)
    if (!options.includes(wrongAnswer) && wrongAnswer > 0)
      options.push(wrongAnswer)
  }
  return shuffle(options.slice(0, 9))
}

export const genArray = (s: number) => new Array(s).fill('')
const FRUITS = 'kiwi apple banana apricot mandarin pineapple watermelon'.split(
  ' ',
)
