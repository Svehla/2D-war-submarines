import { GameElementFood, GameElementType } from './gameElementTypes'
import { createGameBorderElement, createGameFoodElements } from './createGameElements'
import { getLinesFromShape } from './helpers/mapGenerator'
import { isMobile } from '../utils'
import shape1 from './helpers/shape1'

export const getView = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  x: 100,
  y: 100,
})

const view = getView()

export const RAY_COUNT = 50
export const RADAR_LOOP_SPEED = 15000
// export const RADAR_LOOP_SPEED = 2000
// export const RADAR_LOOP_SPEED = 1000
export const RADAR_VISIBLE_DELAY = RADAR_LOOP_SPEED / 2 // ms

const helperX = view.x + view.width / 2
const helperY = view.y + view.height / 2

const myPolygon = getLinesFromShape(shape1, {
  // x: 0,
  // y: 1,

  // x: 28,
  // y: 0,

  x: 0,
  y: 0,
})
// console.log(myPolygon)

// TODO: extends Rectangle
export const playground = {
  width: isMobile ? 5500 : 5500,
  height: isMobile ? 2500 : 5000,
  // todo: rename it to: walls
  walls: [
    // createGameBorderElement({
    //   background: 'red',
    //   // TODO: draw playground in some external program
    //   points: myPolygon.points.map(({ x, y }) => ({ x: 200 + x * 400, y: 900 + y * 400 })),
    // }),

    createGameBorderElement({
      background: 'red',
      // TODO: draw playground in some external program
      points: [
        // triangle
        { x: 0, y: 500 },
        { x: 0, y: 400 },
        { x: 520, y: 200 },
        { x: 520, y: 444 },
      ],
    }),
    // createGameBorderElement({
    //   background: 'red',
    //   // TODO: draw playground in some external program
    //   points: [
    //     // triangle
    //     { x: 0, y: 0 },
    //     { x: 100, y: 400 },
    //     { x: 200, y: 200 },
    //   ],
    // }),
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

// console.log(playground.walls)
