import { Point } from './gameElementTypes'
import { distance } from './mathCalc'

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
const getAngleBetweenPoints = (point1: Point, point2: Point) => {
  // relative coords
  const xDiff = point2.x - point1.x
  const yDiff = point2.y - point1.y
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

/**
 *
 * transpose axis system into start
 * TODO: add documentation
 * edge case over 360deg???
 * const startShifted = 0
 * TODO: add angle module
 * TODO: add radius of `Arc` Component
 */
const isAngleInArcSector = (angle: number, startAngle: number, endAngle: number) => {
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
  getAngleBetweenPoints,
  isAngleInArcSector,
}
