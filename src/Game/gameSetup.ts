import { GameElementFood, GameElementType } from './gameElementTypes'
import { createGameBorderElement, createGameFoodElements } from './createGameElements'
import { isMobile } from '../utils'

export const getView = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  leftX: 100,
  topY: 100,
})

const view = getView()

export const RAY_COUNT = 50
// export const RADAR_LOOP_SPEED = 15000
export const RADAR_LOOP_SPEED = 2000
export const RADAR_VISIBLE_DELAY = RADAR_LOOP_SPEED / 2 // ms

const helperX = view.leftX + view.width / 2
const helperY = view.topY + view.height / 2

export const playground = {
  width: isMobile ? 5500 : 5500,
  height: isMobile ? 2500 : 5000,
  // todo: rename it to: walls
  walls: [
    createGameBorderElement({
      background: 'red',
      // TODO: draw playground in some external program
      points: [
        {
          x: helperX + 200,
          y: helperY - 100,
        },
        {
          x: helperX + 300,
          y: helperY,
        },
        {
          x: helperX + 350,
          y: helperY + 240,
        },
        {
          x: helperX + 100,
          y: helperY + 200,
        },
        {
          x: helperX,
          y: helperY + 150,
        },
        {
          x: helperX + 250,
          y: helperY + 100,
        },
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
