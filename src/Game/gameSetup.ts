import { GameElementFood, GameElementType } from './gameElementTypes'
import { createGameBorderElement, createGameFoodElements } from './createGameElements'
import { getLinesFromShape } from './helpers/mapGenerator'
import { isMobile } from '../utils'
import shape1 from './helpers/shape1'

export const getView = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  x: 100,
  y: 0,
})

const view = getView()

export const RAY_COUNT = 50
export const RADAR_LOOP_SPEED = 15000
// export const RADAR_LOOP_SPEED = 2000
// export const RADAR_LOOP_SPEED = 1000
export const RADAR_VISIBLE_DELAY = RADAR_LOOP_SPEED / 2 // ms

// const helperX = view.x + view.width / 2
// const helperY = view.y + view.height / 2

const myPolygon = getLinesFromShape(shape1, {
  x: 28,
  y: 0,
})

// TODO: should playground extends Rectangle
export const playground = {
  width: isMobile ? 5500 : 5500,
  height: isMobile ? 2500 : 5000,
  // todo: rename it to: walls
  walls: [
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

export type Playground = typeof playground

export const gameElements: GameElementFood[] = [
  ...createGameFoodElements(100, GameElementType.Rectangle, {
    audio: 'scream',
  }),
  ...createGameFoodElements(100, GameElementType.Rectangle, {
    audio: 'growl',
  }),
]
