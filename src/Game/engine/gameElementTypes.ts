// the simplest geometry shapes
// todo: extract functions into engine folder
// primarily used for engine calculations
// just math stuffs
// refactor file system

import { Vec } from './vec'

// ---------------------------------------------------------------
export type Arc = {
  x: number
  y: number
  startAngle: number
  endAngle: number
  radius: number
}

export type Polygon = {
  // points size have to be larger than 2 & last item is redirected to the first one (closed shape)
  points: Point[]
}

// todo: refactor to from: Point, to: Point -> for easier integrations
export type Line = {
  // start point
  s: Point
  // end point
  e: Point
}

export type Point = {
  x: number
  y: number
}

// todo: should inherit from point?
export type Rectangle = Point & {
  width: number
  height: number
}

// todo: should inherit from point?
export type Circle = Point & {
  radius: number
}
export type BorderElement = {}

// game elements used in canvas and game and for custom game logic
// ---------------------------------------------------------------
// similar to arc but customized for the current game
export type Radar = {
  startAngle: number
  endAngle: number
  radius: number
  anglePerSecond: number
}

export enum GameElementType {
  Arc = 'Arc',
  Rectangle = 'Rectangle',
  Circle = 'Circle',
  Polygon = 'Polygon',
}

// this is helper type for calculating of the GameElementBorer collisions with the current user
export type GameCollisionsElement =
  | (Arc & { type: GameElementType.Arc })
  | (Polygon & { type: GameElementType.Polygon; baseLine: Line })

// shared between food and borders
export type GameElementProps = {
  id: string
  visibleInView: boolean
  background: string
}

// what about to use classes and inheritance?
export type GameElementFoodProps = GameElementProps & {
  audio: string
  seenByRadar: number
  deleted: boolean
}

export type GameElementFoodType = GameElementType.Rectangle | GameElementType.Circle

export type GameElementFood =
  | (Rectangle &
      GameElementFoodProps & {
        type: GameElementType.Rectangle
      })
  | (Circle &
      GameElementFoodProps & {
        type: GameElementType.Circle
      })

export type GameElementRocket = Circle &
  GameElementProps & {
    type: GameElementType.Circle
    // px per sec
    secSpeed: number
    // unitVec
    direction: Vec
    seenByRadar: number
  }

// border is physics element viewed in the screen which works like a wall for the user
export type GameElementBorder = Polygon &
  GameElementProps & {
    type: GameElementType.Polygon
  }

export type MeElementType = Circle & {
  type: GameElementType.Circle
  radius: number
  background: string
  maxSecSpeed: number
  rotationAngle: number
}

export type GameElement = GameElementFood | GameElementBorder | GameElementRocket

export type CameraRotation = {
  point: Point
  angle: number
}

export type View = Rectangle
