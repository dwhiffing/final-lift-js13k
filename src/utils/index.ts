import { genArray } from '../entities/Puzzle'

export const BASE_DURATION = 500
export let TIME_SCALE = 1
export const setTimeScale = (v: number) => (TIME_SCALE = v)
export const FLOORS_PER_DIFFICULTY = 4
export const MUSIC_DISABLED = true
export const START_TIME = 60

const maxFloor = 20
const minFloor = 1

// prettier-ignore
const SOUNDS = {
  elevator: [.8,,123,.04,.3,.8,1,2.3,,-95,,,.06,,5.7,.2,.1,.97,.2,.38],
  incorrect: [.5,,412,,.09,.07,3,3.7,,10,,,,1.6,,.5,.01,.45,.08,,101],
  correct: [.5,,649,.01,,.13,1,1.1,,,139,.06,,,,,,.95,.03,,128],
  swap: [3,.1,44,.03,.04,.03,,1.4,,40,,,,,,,,.83,.02,,540],
  doors: [.3,.9,50,.05,.3,.3,4,1.2,1,,,,,2,,.24,.35,.4,.2,,-2150],
  tick: [.8,,275,.03,,.02,,2.6,,-35,24,.53,,.4,35,,.25,.52,.01,.04,-670],
  tick2: [.3,,572,.02,.01,.02,,1.6,,84,,,,,321,,,.78,.01],
  startGame: [2,,950,.02,.03,.004,4,3.3,-83,28,-44,.9,.09,,17,,.35,.67,.03,.36],
  click: [1.2,,342,,.09,.26,,.9,,3,,,.07,.5,,.1,,.42,.05,.15],
  tickUrgent: [2,,182,.02,.03,.03,1,.2,,,,,,.1,18,,.42,.72,.03],
  gameover: [,,387,.06,.23,.26,1,1.7,-8,,-63,.09,.04,,,.2,,.55,.16],
  // tickUrgent2: [1.8,,114,.01,.02,.04,2,3.9,45,10,-232,.05,,,,,.02,.73,.01,.01],
  // elevator2: [.8,,,.05,.85,.48,,3.2,,-158,,,.06,,,,.13,.98,.17],
  // success: [,,338,.03,.22,.36,1,,-6,,-94,.06,.07,,42,,,.58,.3],
  // gameover2: [1.1,,469,.08,.22,.18,,2.7,,,-54,.08,.05,,,,,.52,.26,.39,308],
  // press: [1,,50,,.02,,,200,,,,,,.1,,,,.19,.06,.2],
  // click2: [1.05,,51,,,.21,,2.72,,,,,,.2,,.2,,.67,.03],
}

let muted = false
export const playSound = (key) => {
  // @ts-ignore
  if (!muted) zzfx(SOUNDS[key][0] || 1, ...SOUNDS[key].slice(1))
}

export const toggleMute = () => (muted = !muted)

export const sample = (array) => shuffle(array)[0]

export function shuffle(array) {
  const cloned = [...array]
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = cloned[i]
    cloned[i] = cloned[j]
    cloned[j] = temp
  }
  return cloned
}

function quadraticEaseInOut(t) {
  if (t < 0.5) {
    return 2 * t * t // Ease-in for the first half
  } else {
    return -2 * t * t + 4 * t - 1 // Ease-out for the second half
  }
}

export function lerpQuad(start, end, t) {
  const easedT = quadraticEaseInOut(t)

  return (1 - easedT) * start + easedT * end
}

export const getFloorButtons = (floor: number, difficulty: number) => {
  const count = 3

  let numbers: number[] = []
  const isValid = (n, i, a) =>
    floor + n >= minFloor && floor + n <= maxFloor && a.indexOf(n) === i
  while (numbers.length < count) {
    numbers.push(getFloorButton(floor, difficulty))
    numbers = numbers.filter(isValid)
  }
  return shuffle(numbers.map((n) => `${n > 0 ? '+' : ''}${n}`))
}

const getFloorButton = (floor: number, difficulty: number) => {
  const hd = Math.floor(difficulty / 2)
  const deadly = 13 - floor
  const options = [
    ...genArray(6 - hd).fill(0),
    ...genArray(hd).fill(1),
    ...genArray(deadly <= 6 ? hd : 0).fill(2),
  ]

  const type = sample(options)
  const factor = floor > maxFloor - 9 ? 0 : floor < 9 ? 1 : 0.5
  const negative = type !== 2 ? Math.random() >= factor : false
  let number = 0
  if (type === 0) {
    // low
    number = sample([1, 2, 3])
  } else if (type === 1) {
    // high
    number = sample([4, 5, 6, 7])
  } else if (type === 2) {
    // deadly
    number = deadly
  }

  return negative ? number * -1 : number
}

export function randInt(min, max) {
  return ((Math.random() * (max - min + 1)) | 0) + min
}
