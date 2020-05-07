// the simplest geometry shapes
// todo: extract functions into engine folder
// primarily used for engine calculations
// just math stuffs
// refactor file system
// ---------------------------------------------------------------
export type ArcCol = {
  x: number
  y: number
  startAngle: number
  endAngle: number
  radius: number
}
export type Arc = {
  x: number
  y: number
  // TODO: refactor to endAngle
  sectorAngle: number
  startAngle: number
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
export type Rectangle = {
  x: number
  y: number
  width: number
  height: number
}

// todo: should inherit from point?
export type Circle = {
  radius: number
  x: number
  y: number
}
export type BorderElement = {}

// game elements used in canvas and game and for custom game logic
// ---------------------------------------------------------------
// similar to arc but customized for the current game
export type Radar = {
  // TODO: refactor to endAngle
  sectorAngle: number
  rotation: number
  radius: number
  anglePerSecond: number
}

export enum GameElementType {
  Arc = 'Arc',
  Rectangle = 'Rectangle',
  Circle = 'Circle',
  Polygon = 'Polygon',
}

// what about class instances?
// used for game Collisions
export type GameCollisionsElement =
  | (ArcCol & { type: GameElementType.Arc })
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

export type GameElementBorder = Polygon &
  GameElementProps & {
    type: GameElementType.Polygon
  }

export type GameElement = GameElementFood | GameElementBorder
