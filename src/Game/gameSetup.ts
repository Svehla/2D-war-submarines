import { GameElementFood, GameElementType } from './gameElementTypes'
import { createGameBorderElement, createGameFoodElements } from './createGameElements'
import { getLinesFromShape } from './mapGenerator/mapGenerator'
import shape1 from './mapGenerator/shape1'

export const getView = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  x: 100,
  y: 0,
})

export const RAY_COUNT = 50
export const RADAR_LOOP_SPEED = 15000
// export const RADAR_LOOP_SPEED = 2000
// export const RADAR_LOOP_SPEED = 1000
export const RADAR_VISIBLE_DELAY = RADAR_LOOP_SPEED / 2 // ms

const myPolygon = getLinesFromShape(shape1, {
  x: 0,
  y: 0,
})
export const playground = {
  width: 2000,
  height: 2000,
  // todo: rename it to: walls
  walls: [
    createGameBorderElement({
      background: 'navy',
      points: myPolygon.points.map(point => ({
        x: 600 + point.x * 30,
        y: 200 + point.y * 30,
      })),
    }),
    createGameBorderElement({
      background: 'green',
      points: [
        { x: 250, y: 600 },
        { x: 220, y: 500 },
        { x: 420, y: 544 },
        { x: 150, y: 700 },
      ],
    }),
    createGameBorderElement({
      background: 'blue',
      points: [
        { x: 150, y: 400 },
        { x: 520, y: 200 },
        { x: 520, y: 444 },
        { x: 150, y: 600 },
      ],
    }),
    createGameBorderElement({
      background: 'red',
      // TODO: draw playground in some external program
      points: [
        // triangle
        { x: 200, y: 500 },
        { x: 400, y: 700 },
        { x: 300, y: 900 },
      ],
    }),
  ],
}
console.log(playground)

export type Playground = typeof playground

export const gameElements: GameElementFood[] = [
  ...createGameFoodElements(50, GameElementType.Rectangle, {
    audio: 'scream',
  }),
  ...createGameFoodElements(50, GameElementType.Circle, {
    audio: 'growl',
  }),
]
