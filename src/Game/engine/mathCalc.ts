import './line'
import { Circle, GameElement, GameElementType, Line, Point, Rectangle } from '../gameElementTypes'
import { Playground, RADAR_LOOP_SPEED } from '../gameSetup'
import { angleToUnitVec, getLineVec, getNormalVec, shiftPoint, toUnitVec } from './vec'
// import { distToSegment } from './rayCasting'
import { getElementCollisionsElements } from './collisionsHelper'
import { isPointArcCollision, isPointPolygonCollision } from './collisions'
import { notNullable } from '../../utils'
import me from '../views/meView'

// todo: extract types out of `mathCalc.js` to another file
// todo: extends Rectangle which extends Point
export type View = Rectangle

// Coordination
export type Coord = {
  x: number
  y: number
}

export type AbsoluteCoord = {
  x: number
  y: number
}

export type CurrentPosition = {
  xRel: number
  yRel: number
}

export type CenterElement = { maxSpeedPerSecond: number } & CurrentPosition & AbsoluteCoord & Circle

/*******************************/
/*********** angles ************/
/*******************************/
// TODO: bad API: is ok that functions take angle out of 360 range but return only ranged angles?
/**
 * all game have to use degrees and not native radians
 * someone told me that its more clear)
 * toRadians
 */
const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI
const subAngles = (ang1: number, ang2: number) => angleTo360Range(ang1 - ang2)
const addAngles = (ang1: number, ang2: number) => angleTo360Range(ang1 + ang2)

// module operator works also for negative number <3 sweet
const angleTo360Range = (ang: number) => (360 + (ang % 360)) % 360

/**
 *
 *
 * transpose axis system into start
 * TODO: add documentation
 * edge case over 360deg???
 * const startShifted = 0
 * TODO: add angle module
 * TODO: add radius of `Arc` Component
 */
export const isAngleInArcSector = (angle: number, startAngle: number, endAngle: number) => {
  const endAngleShifted = subAngles(endAngle, startAngle)
  const compareAngle = subAngles(angle, startAngle)

  return compareAngle <= endAngleShifted
}

// static methods :smirk:
export const Angle = {
  toRadians,
  toDegrees,
  sub: subAngles,
  add: addAngles,
  to360Range: angleTo360Range,
}
//
export const decreaseBy1ToZero = (num: number) => Math.max(num - 1, 0)

export const pythagorC = (a: number, b: number) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))

/**
 *
 * radar has to have position by timestamp (aka it has to be synchronized by server)
 *
 * how to sync it with server? (have to use server timestamp + calc ping time somehow)
 * https://stackoverflow.com/a/5357794/8995887
 *
 */
// todo: make variable for slow down the radar
export const calcNewRadarRotation = () => {
  // return 0
  const ms = new Date().getTime()

  const currentCircle = ms % RADAR_LOOP_SPEED

  return normalizeInto01(currentCircle, 0, RADAR_LOOP_SPEED) * 360
}

// inspiration: https://stackoverflow.com/questions/39776819/function-to-normalize-any-number-from-0-1
export const normalizeInto01 = (val: number, min = 0, max = 0) => (val - min) / (max - min)

export const distance = (a: Point, b: Point) => {
  const xDiff = a.x - b.x
  const yDiff = a.y - b.y
  return pythagorC(xDiff, yDiff)
}

/**
 *
 * ## How does it work
 * for each sector i calculate ratio of triangle sides
 *
 * `atan` calculate opposite to adjacent side.In our case its `y/x` like:
 *
 * ```
 * | q. 1 |  q.2 | q. 3 | q. 4 |
 * |------|------|------|------|
 * |      |      |      |      |
 * | C___ | C___ | C    |    C |
 * |    | | |    | |    |    | |
 * |  \ | | | /  | | \  |  / | |
 * |    y | y    | ___x | x___ |
 * |      |      |      |      |
 * |------|------|------|------|
 * ```
 * * x -> x axis
 * * y -> y axis
 * * C -> relative center (0, 0)
 *
 * on diagram below you can see math quadrants
 *
 * ```
 * |-------|-------|
 * | 3→ pa | 4↓ na |
 * |-------|-------| 0deg - 360deg
 * | ↑2 na | ←1 pa |
 * |-------|-------|
 * * pa -> returns positive angle
 * * na -> returns negative angle
 * ```
 *
 * returns positive or negative relative x and y coord
 * return number between o to 360
 *
 * first point is the centered one (not now...lol)
 */
export const getAngleBetweenPoints = (angleFromP: Point, angleToP: Point) => {
  // relative coords
  const xDiff = angleToP.x - angleFromP.x
  const yDiff = angleToP.y - angleFromP.y

  if (xDiff === 0 && yDiff === 0) {
    return 0
  }
  // opposite to adjacent triangle side
  // find proper angle for cursor position by your element
  const arcRecCalcAngle = Angle.toDegrees(Math.atan(yDiff / xDiff))

  let arcRecAngle
  if (xDiff < 0) {
    // quadrant 2 & 3
    arcRecAngle = Angle.add(180, arcRecCalcAngle)
  } else {
    // quadrant 1 & 4
    arcRecAngle = Angle.to360Range(arcRecCalcAngle)
  }
  return arcRecAngle
}

const ACCELERATION_SPEED_COEFFICIENT = 40
export const getElShift = (
  mousePos: Point,
  view: View,
  maxSpeedPerSecond: number,
  timeSinceLastTick: number
): Point => {
  const centerMePos = {
    x: view.width / 2,
    y: view.height / 2,
  }
  const angle = getAngleBetweenPoints(centerMePos, mousePos)
  const d = distance(mousePos, centerMePos)
  const acceleration = Math.pow(d / ACCELERATION_SPEED_COEFFICIENT, 2)
  const maxSpeedPerInterval = maxSpeedPerSecond / (1000 / timeSinceLastTick)
  const elementAcceleration = Math.min(acceleration, maxSpeedPerInterval)
  const newX = Math.cos(Angle.toRadians(angle)) * elementAcceleration
  const newY = Math.sin(Angle.toRadians(angle)) * elementAcceleration
  return {
    x: newX,
    y: newY,
  }
}

// inspiration
// https://gist.github.com/mattdesl/47412d930dcd8cd765c871a65532ffac
export const distToSegment = (point: Point, line: Line) => {
  const dx = line.x2 - line.x1
  const dy = line.y2 - line.y1
  const l2 = dx * dx + dy * dy

  if (l2 === 0) return distance(point, { x: line.x1, y: line.y1 })

  let t = ((point.x - line.x1) * dx + (point.y - line.y1) * dy) / l2
  t = Math.max(0, Math.min(1, t))

  return distance(point, { x: line.x1 + t * dx, y: line.y1 + t * dy })
}

export const stayInRange = (num: number, { min, max }: { min: number; max: number }) =>
  Math.min(Math.max(min, num), max)

/**
 * if array has length 0 => reduce return init value (so it returns undefined as we expect)
 */

export const findMinByKey = <T extends { [key: string]: any }>(
  arr: T[],
  key: string
): T | undefined => arr.reduce((min, curr) => (min[key] < curr[key] ? min : curr), arr[0])

const isInAxis = (axisPosition: number, larger: number, lower: number, halfWidth: number) =>
  axisPosition + halfWidth >= larger && axisPosition <= lower + halfWidth

/**
 * range define borders like:
 *  -1 ... 1
 *  -5 ... 5
 *
 * this function check if `num` is inside of that range
 * if not -> move it to max/min value
 *
 * TODO: refactor name to: moveToRange?
 */
export const getInRange = (num: number, range = 1) => stayInRange(num, { min: -range, max: range })

/**
 * check if `gameElement` is in view (screen that user can see)
 *
 * collisions of screen and elements are compared by absolute coordinations
 *
 * todo: add support for Polygons
 * todo: implement this fn via collisions :| now its shitty
 *
 * todo: should not depends on the game => just engine stuff
 */
export const isInView = (view: View, gameElement: GameElement): boolean => {
  let height = null
  let width = null
  let x = null
  let y = null
  // make square position for easier calculating of `isInView` fn
  switch (gameElement.type) {
    case GameElementType.Circle: {
      x = gameElement.x
      y = gameElement.y
      width = gameElement.radius
      height = gameElement.radius
      break
    }
    case GameElementType.Rectangle: {
      x = gameElement.x
      y = gameElement.y
      width = gameElement.width
      height = gameElement.height
      break
    }
    case GameElementType.Polygon: {
      // work with rects for simplify code
      // todo: write test -> it does not work
      // shitty collisions i guess -> but it could be fast :D
      // todo: implement logic for polygons
      const xPoints = gameElement.points.map(({ x }) => x)
      const yPoints = gameElement.points.map(({ y }) => y)
      x = Math.min(...xPoints)
      y = Math.min(...yPoints)
      width = Math.max(...xPoints) - x
      height = Math.max(...yPoints) - y
      break
    }
  }

  const rightX = view.x + view.width
  const bottomY = view.y + view.height

  const isInX = isInAxis(x, view.x, rightX, width)
  const isInY = isInAxis(y, view.y, bottomY, height)

  return isInX && isInY
}

/**
 * calculate player position from absolute playground coordinations
 * to screen view relative coordinations
 */
export const getRelativePosByAbsPos = (view: View, { x, y }: Coord): Coord => {
  const relativeXCoord = x - view.x
  const relativeYCoord = y - view.y
  return {
    x: relativeXCoord,
    y: relativeYCoord,
  }
}
