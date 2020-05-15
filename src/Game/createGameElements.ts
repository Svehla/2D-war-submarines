import {
  GameElementBorder,
  GameElementFood,
  GameElementFoodType,
  GameElementRocket,
  GameElementType,
  Point,
} from './engine/gameElementTypes'
import { RADAR_VISIBLE_DELAY, playground } from './gameSetup'
import { Vec } from './engine/vec'
import { randomColor } from '../utils'

const getRandomWidth = () => Math.random() * 20 + 10
const getRandomId = () => `element-${Math.floor(Math.random() * 1000000000000)}`
type PartialGameElementFood = {
  x?: number
  y?: number
  radius?: number
  width?: number
  height?: number
  background?: string
  audio?: string
  seenByRadar?: number
  deleted?: boolean
  visibleInView?: boolean
}

export const createGameFoodElement = (
  type: GameElementFoodType,
  conf: PartialGameElementFood
): GameElementFood => {
  // destructuring for default values FTW
  const {
    x = Math.random() * playground.width,
    y = Math.random() * playground.height,
    background = randomColor(),
    audio = 'slowZero',
    deleted = false,
    seenByRadar = 0,
    // performance tuning
    visibleInView = true,
    radius,
    width,
    height,
    ...properties
  } = conf

  const sharedProps = {
    id: `element-${getRandomId()}`,
    type,
    x,
    y,
    background,
    audio,
    deleted,
    seenByRadar,
    visibleInView,
    ...properties,
  }
  switch (sharedProps.type) {
    case GameElementType.Rectangle:
      return {
        ...sharedProps,
        height: height ?? getRandomWidth() * 4,
        width: width ?? getRandomWidth() * 4,
      } as GameElementFood
    case GameElementType.Circle:
      return {
        ...sharedProps,
        radius: radius ?? getRandomWidth(),
      } as GameElementFood
  }
}

export const createGameFoodElements = (
  counts: number,
  type: GameElementFoodType,
  config: PartialGameElementFood
) => Array.from({ length: counts }, () => createGameFoodElement(type, config))

type PartialGameElementBorder = {
  id?: string
  visibleInView?: boolean
  points: Point[]
  background?: string
}
export const createGameBorderElement = (
  properties: PartialGameElementBorder
): GameElementBorder => ({
  id: `border-${getRandomId()}`,
  type: GameElementType.Polygon,
  points: properties.points,
  visibleInView: properties.visibleInView ?? false,
  background: properties.background ?? randomColor(),
})

type PartialGameElementRocket = {
  x: number
  y: number
  direction: Vec
  id?: string
  visibleInView?: boolean
  background?: string
}
export const createGameRocketElement = (
  properties: PartialGameElementRocket
): GameElementRocket => ({
  id: `rocket-${getRandomId()}`,
  x: properties.x,
  y: properties.y,
  radius: 10,
  secSpeed: 60,
  type: GameElementType.Circle,
  seenByRadar: RADAR_VISIBLE_DELAY,
  visibleInView: properties.visibleInView ?? false,
  background: properties.background ?? randomColor(),
  direction: properties.direction,
})
