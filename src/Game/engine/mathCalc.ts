import { Circle, GameElement, GameElementType, Line, Point, Rectangle } from '../gameElementTypes'
import { Playground, RADAR_LOOP_SPEED, playground } from '../gameSetup'
import { createGameBorderElement } from '../createGameElements'
import { isPolygonCircleCollision } from './rayCasting'

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
const getAngleBetweenPoints = (angleFromP: Point, angleToP: Point) => {
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
console.log(getAngleBetweenPoints({ x: 10, y: 10 }, { x: 20, y: 15 }))

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

const getCenterPointOfLine = (line: Line): Point => {
  return {
    x: line.x1 + (line.x2 - line.x1) / 2,
    y: line.y1 + (line.y2 - line.y1) / 2,
  }
}
const getVector = (line: Line): Point /*as vec*/ => {
  return {
    x: line.y2 - line.y1,
    y: line.x2 - line.x1,
  }
}
// const getNormalVector = (line: Line): Point /*as vec*/ => {
//   return {
//     x: line.y2 - line.y1,
//     y: line.x2 - line.x1,
//   }
// }
//
//
const stayInRange = (num: number, { min, max }: { min: number; max: number }) =>
  Math.min(Math.max(min, num), max)

// todo: extract math to engine and logic to game
export const calculateNewObjPos = (
  mousePos: Point,
  view: View,
  meElement: Circle & { maxSpeedPerSecond: number },
  timeSinceLastTick: number,
  playground: Playground
) => {
  // return neg or pos distance by positions of cursor
  const { x: distanceX, y: distanceY } = getElShift(
    mousePos,
    view,
    meElement.maxSpeedPerSecond,
    timeSinceLastTick
  )

  // possible shifts
  const x = meElement.x + distanceX
  const y = meElement.y + distanceY

  // calc polygon collisions
  // calc polygon collisions
  // calc polygon collisions
  // calc polygon collisions
  const polygonsCollisions = playground.walls
    // negation!!!!
    .map(wall => isPolygonCircleCollision({ x, y, radius: meElement.radius }, wall))
    .map(wall => wall.filter(({ collisions }) => collisions.length > 0))
    .filter(polCol => polCol.length > 0)

  // const allCollisionsPoints = polygonsCollisions.flat(2)
  // console.log(allCollisionsPoints)
  // .map(({ collisions }) => collisions)
  // .flat()
  // console.log(allCollisionsPoints)
  // const nearestLineCol: any = []

  // nearestLineCol.push(allCollisionsPoints[0])
  // nearestLineCol.push(allCollisionsPoints[1])
  /*
  if (allCollisionsPoints.length > 0) {
    // console.log(polygonsCollisions)
    // console.log(allCollisionsPoints)
    const pointsByDistance = allCollisionsPoints.map(point => ({
      point,
      distance: distance(meElement, point),
    }))
    // .sort((a, b) => a.distance - b.distance)
    // console.log(pointsByDistance)
    if (pointsByDistance.length >= 2) {
      nearestLineCol.push(pointsByDistance[0].point)
      nearestLineCol.push(pointsByDistance[1].point)
    }
  }
  */

  const nearestLineCol = polygonsCollisions[0]?.[0]
  const possibleMeCenter: Point[] = []
  // const nearestPol = polygonsCollisions?.[0]
  // const nearestLineCol = nearestPol?.[0]

  if (nearestLineCol?.collisions?.length > 0) {
    let nearestLineLine
    if (nearestLineCol?.collisions.length === 1) {
      // console.log('....nearestLineCol')
      // console.log(nearestLineCol)
      // return meElement
      return { x, y }
    } else {
      nearestLineLine = {
        x1: nearestLineCol.collisions[0].x,
        y1: nearestLineCol.collisions[0].y,
        // wtf am i doing?
        x2: nearestLineCol?.collisions[1].x, //?? nearestLineCol[0].x,
        y2: nearestLineCol?.collisions[1].y, //?? nearestLineCol[0].y,
      }
    }
    const centerCollPoint = getCenterPointOfLine(nearestLineLine)

    const radius = meElement.radius
    const vec = getVector(nearestLineLine)

    // no idea what I'm doing
    const normalVec = {
      x: -vec.y,
      y: vec.x,
    }
    // am i just raped this function...?
    const justAngle = getAngleBetweenPoints(
      {
        x: centerCollPoint.x + normalVec.x,
        y: centerCollPoint.y + normalVec.y,
      },
      centerCollPoint
    )

    const meMoveX = Math.sin(Angle.toRadians(justAngle)) * radius
    const meMoveY = Math.cos(Angle.toRadians(justAngle)) * radius
    // console.log(justAngle)
    // console.log(meMoveX)
    // console.log(meMoveY)
    // possibleMeCenter.push({
    //   x: centerCollPoint.x - meMoveX,
    //   y: centerCollPoint.y - meMoveY,
    // }})
    return {
      x: centerCollPoint.x - meMoveX,
      y: centerCollPoint.y - meMoveY,
    }
  }
  // 2 points between circle and line

  // // console.log(possibleMeCenter)
  // if (possibleMeCenter.length > 0) {
  //   const xAfterCol = Math.max(...possibleMeCenter.map(({ x }) => x)) // nearest x
  //   const yAfterCol = Math.max(...possibleMeCenter.map(({ y }) => x)) // nearest x
  //   return {
  //     x: possibleMeCenter[0].x,
  //     y: possibleMeCenter[0].y,
  //   }
  //   return {
  //     x: xAfterCol,
  //     y: yAfterCol,
  //   }
  // }
  // const yAfterCol = // nearest y

  const xWithBorder = stayInRange(x, { min: 0, max: playground.width })
  const yWithBorder = stayInRange(y, { min: 0, max: playground.height })

  return {
    // only first quadrant i guess
    x: xWithBorder,
    y: yWithBorder,
  }
}
;(() =>
  setTimeout(() => {
    calculateNewObjPos(
      // mousePos:
      { x: 100, y: 0 },
      // view:
      {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
      },
      {
        x: 55, // center of screen
        y: 55, // center of screen
        radius: 5,
        maxSpeedPerSecond: 10,
      },
      1000,
      {
        ...playground,
        walls: [
          // ...playground.walls,

          createGameBorderElement({
            background: 'red',
            // TODO: draw playground in some external program
            points: [
              // triangle
              { x: 60, y: 54 },
              { x: 60, y: 66 },
              { x: 65, y: 65 },
            ],
          }),
        ],
      }
    )
  }, 100))()

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
