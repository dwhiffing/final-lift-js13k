export const BASE_DURATION = 600
export const TIME_SCALE = 1
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
  click: [.3,,1768,,.01,.01,,.2,14,39,,,,,.5,.3,,.31,.01],
  gameover: [,,387,.06,.23,.26,1,1.7,-8,,-63,.09,.04,,,.2,,.55,.16],
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

export function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
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

export const getFloorButtons = (floor: number) => {
  const count = 3

  let numbers: number[] = []
  const isValid = (n, i, a) =>
    floor + n >= minFloor && floor + n <= maxFloor && a.indexOf(n) === i
  while (numbers.length < count) {
    numbers.push(getFloorButton(floor))
    numbers = numbers.filter(isValid)
  }
  return shuffle(numbers.map((n) => `${n > 0 ? '+' : ''}${n}`))
}

const getFloorButton = (floor: number) => {
  const deadly = 13 - floor
  const options = [0, 1]
  if (deadly <= 6) options.push(2)
  const type = shuffle(options)[0]
  const factor = floor > maxFloor - 9 ? 0 : floor < 9 ? 1 : 0.5
  const negative = type !== 2 ? Math.random() >= factor : false
  let number = 0
  if (type === 0) {
    // low
    number = shuffle([1, 2, 3])[0]
  } else if (type === 1) {
    // high
    number = shuffle([4, 5, 6, 7])[0]
  } else if (type === 2) {
    // deadly
    number = deadly
  }

  return negative ? number * -1 : number
}
export function randInt(min, max) {
  return ((Math.random() * (max - min + 1)) | 0) + min
}
