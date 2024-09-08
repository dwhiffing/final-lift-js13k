export const BASE_DURATION = 600
export const TIME_SCALE = 1
export const MUSIC_DISABLED = true
export const START_TIME = 60

const maxFloor = 20
const minFloor = 1

// prettier-ignore
const SOUNDS = {
  playerHit: [2,,1050,.01,.01,.02,3,1.06,-66,,,.15,,,,,.05,.82,.01,.03],
  // clickDisabled: [1.05,,51,,,.21,,2.72,,,,,,.2,,.2,,.67,.03],
  click: [,,1768,,.01,.01,,.2,14,39,,,,,.5,.3,,.31,.01],
  catch: [2,,1182,,.01,0,1,.43,-84,50,,,,,,,.14,.94,.08,.01],
  swap: [1,,10,,.01,.01,,1.76,92,-1,,,,.6,-6.7,,,.42,.01],
  nextLevel: [1.66,,441,.06,.26,.34,,1.11,,,83,.05,.02,,,.1,.11,.42,.23],
  // enemyExplode: [.4,.5,902,.01,.01,.15,3,1.35,.8,.9,,,,1,,.5,,.42,.1],
  // 
  // mineExplode: [.4,.5,902,.01,.01,.15,3,1.35,.8,.9,,,,1,,.5,,.42,.1],
  // minePlaced: [,,210,.01,.01,0,,.15,,.3,54,.11,,,100,,.02,.47,,.2],
  // mineNotPlaced: [1.13,,1996,.02,.01,.01,1,1.81,-0.8,,14,.04,,,38,.1,,.11,.01],
  // mineNotPlaced2: [2,,200,,.03,.04,1,.83,-7.1,,16,.1,,,-46,3,.05,.2,.03],
  // playerCharge: [.1,0,10,1.5,,.2,1,0,.1],
  // playerChargeFull: [,,145,,,.14,1,.74,,,595,.03,,,,,.01,,.02,.03],
  // playerBlast: [1.13,,125,.01,,.01,3,1.93,-5.8,.8,,,,,,,.04,,.1,.08],
  // shieldHit: [1.99,,44,.01,.01,.02,1,2.07,,,-183,.09,,.2,-1.6,,.03,,.02,.05],
  // nextLevel: [2.01,,307,,.29,.3,1,.96,3.6,.1,332,.16,.2,,29,,.15,.46,.15],
  // playerDie: [,,176,,,.31,,.85,-1.8,,,,,.2,,.3,,.76,.08],
  // enemyShoot:[1.19,,453,,.09,.02,1,.21,-3.2,,,,,,,.1,.07,.97,.09,.05],
  // playerHit3: [,,413,,,.22,4,2.99,.5,-0.7,,,,1,.3,.3,,.83,.04],
  // planetHit2: [,,292,,.05,.11,,2.68,-3.4,,,,,.8,,.1,,.75,.06],
  // repair: [1.04,,186,.1,.03,.48,1,1.85,,,17,.08,.01,,,,,.91,,.01],
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
