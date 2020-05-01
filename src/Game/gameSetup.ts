import { GameElementFood, GameElementType } from './gameElementTypes'
import { createGameBorderElement, createGameFoodElements } from './createGameElements'
import { getLinesFromShape } from './helpers/mapGenerator'
import { isMobile } from '../utils'
import shape1 from './helpers/shape1'

export const getView = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  leftX: 100,
  topY: 100,
})

const view = getView()

export const RAY_COUNT = 50
// export const RADAR_LOOP_SPEED = 15000
// export const RADAR_LOOP_SPEED = 2000
export const RADAR_LOOP_SPEED = 1000
export const RADAR_VISIBLE_DELAY = RADAR_LOOP_SPEED / 2 // ms

const helperX = view.leftX + view.width / 2
const helperY = view.topY + view.height / 2

const myPolygon = getLinesFromShape(shape1, {
  // x: 0,
  // y: 1,
  x: 28,
  y: 0,
})
console.log(myPolygon)

export const playground = {
  width: isMobile ? 5500 : 5500,
  height: isMobile ? 2500 : 5000,
  // todo: rename it to: walls
  walls: [
    createGameBorderElement({
      background: 'red',
      // TODO: draw playground in some external program
      points: myPolygon.points.map(({ x, y }) => ({ x: 200 + x * 20, y: 900 + y * 20 })),
    }),
  ],
}

export type Playground = typeof playground

export const gameElements: GameElementFood[] = [
  ...createGameFoodElements(100, GameElementType.Rectangle, {
    audio: 'scream',
  }),
  ...createGameFoodElements(100, GameElementType.Rectangle, {
    audio: 'growl',
  }),
]

// console.log(
//   JSON.stringify(
//     myPolygon.points.map(({ x, y }) => ({ x: 400 + x * 10, y: 400 + y * 10 })),
//     null,
//     2
//   )
// )

console.log(playground.walls)
