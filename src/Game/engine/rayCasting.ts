import { Angle, distance, findMinByKey } from './mathCalc'
import {
  Arc,
  Circle,
  GameElement,
  GameElementType,
  Line,
  Point,
  Polygon,
} from '../gameElementTypes'
import { RAY_COUNT } from '../gameSetup'
import { notNullable } from '../../utils'

// @ts-ignore
const collidePointLine = (px, py, x1, y1, x2, y2, buffer) => {
  // get distance from the point to the two ends of the line
  const d1 = distance({ x: px, y: py }, { x: x1, y: y1 })
  const d2 = distance({ x: px, y: py }, { x: x2, y: y2 })

  // get the length of the line
  const lineLen = distance({ x: x1, y: y1 }, { x: x2, y: y2 })

  // since floats are so minutely accurate, add a little buffer zone that will give collision
  if (buffer === undefined) {
    buffer = 0.1
  } // higher # = less accurate

  // if the two distances are equal to the line's length, the point is on the line!
  // note we use the buffer here to give a range, rather than one #
  if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
    return true
  }
  return false
}
// d === diameter
const collidePointCircle = (x: number, y: number, cx: number, cy: number, d: number) => {
  if (distance({ x, y }, { x: cx, y: cy }) <= d / 2) {
    return true
  }
  return false
}

// // inspiration
// // > https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js#L112
// export const collideLineCircle = (line: Line, circle: Circle) => {
//   const { x1, y1, x2, y2 } = line
//   const { x: cx, y: cy, radius } = circle
//   const diameter = radius * 2

//   // is either end INSIDE the circle?
//   // if so, return true immediately
//   const inside1 = collidePointCircle(x1, y1, cx, cy, diameter)
//   const inside2 = collidePointCircle(x2, y2, cx, cy, diameter)
//   // what about this case??? :| no idea at the
//   if (inside1 || inside2) return [true]

//   // get length of the line
//   let distX = x1 - x2
//   let distY = y1 - y2
//   const len = Math.sqrt(distX * distX + distY * distY)

//   // get dot product of the line and circle
//   const dot = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(len, 2)

//   // find the closest point on the line
//   const closestX = x1 + dot * (x2 - x1)
//   const closestY = y1 + dot * (y2 - y1)

//   // console.log(closestX)
//   // console.log(closestY)
//   // is this point actually on the line segment?
//   // if so keep going, but if not, return false
//   // @ts-ignore
//   const onSegment = collidePointLine(closestX, closestY, x1, y1, x2, y2)
//   if (!onSegment) return [false, { x: closestX, y: closestY }]

//   // get distance to closest point
//   distX = closestX - cx
//   distY = closestY - cy
//   const distance = Math.sqrt(distX * distX + distY * distY)

//   if (distance <= diameter / 2) {
//     return [true, { x: closestX, y: closestY }]
//   }
//   return [false, { x: closestX, y: closestY }]
// }

// https://stackoverflow.com/a/37225895/8995887
const collideLineCircle = (line: Line, circle: Circle) => {
  let a: any
  let b: any
  let c: any
  let d: any
  let u1: any
  let u2: any
  let ret: any
  let retP1: any
  let retP2: any
  const v1: any = {
    x: line.x2 - line.x1,
    y: line.y2 - line.y1,
  }
  const v2: any = {
    x: line.x1 - circle.x,
    y: line.y1 - circle.y,
  }
  b = v1.x * v2.x + v1.y * v2.y
  c = 2 * (v1.x * v1.x + v1.y * v1.y)
  b *= -2
  d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius))
  if (isNaN(d)) {
    // no intercept
    return []
  }
  u1 = (b - d) / c // these represent the unit distance of point one and two on the line
  u2 = (b + d) / c
  retP1 = {} // return points
  retP2 = {}
  ret = [] // return array
  if (u1 <= 1 && u1 >= 0) {
    // add point if on the line segment
    retP1.x = line.x1 + v1.x * u1
    retP1.y = line.y1 + v1.y * u1
    ret[0] = retP1
  }
  if (u2 <= 1 && u2 >= 0) {
    // second add point if on the line segment
    retP2.x = line.x1 + v1.x * u2
    retP2.y = line.y1 + v1.y * u2
    ret[ret.length] = retP2
  }
  return ret
}
// const l = { x1: 10, y1: 10, x2: 20, y2: 20 }
// const c = { x: 15, y: 14, radius: 2 }
// console.log(collideLineCircle(l, c))

export const isPolygonCircleCollision = (circle: Circle, polygon: Polygon) => {
  // todo: extract it to polygon structure (like: get polygon Lines)
  const polygonLines = polygon.points.map((point, index) => ({
    x1: point.x,
    y1: point.y,
    // lol, im genius => connect last point with the first one
    x2: polygon.points[(index + 1) % polygon.points.length].x,
    y2: polygon.points[(index + 1) % polygon.points.length].y,
  }))

  return polygonLines.map(line => ({
    collisions: collideLineCircle(line, circle),
    // todo: have to work with line vectors
    line,
  }))
}

/**
 *
 * inspiration from:
 *   > https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js#L152
 *   > https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
 *
 * return undefined value if 2 line are the same or there is no intersection point
 */
const collideLineLine = (line1: Line, line2: Line): Point | undefined => {
  const { x1, y1, x2, y2 } = line1
  const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2

  let intersection

  // calculate the distance to intersection point
  const uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  const uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    // calc the point where the lines meet
    const intersectionX = x1 + uA * (x2 - x1)
    const intersectionY = y1 + uA * (y2 - y1)

    intersection = {
      x: intersectionX,
      y: intersectionY,
    }
    return intersection
  }
  return undefined
}

const getNearestLinePolygonCollision = (line: Line, polygon: Polygon) => {
  const startPoint = {
    x: line.x1,
    y: line.y1,
  }
  const polygonLines = polygon.points.map((point, index) => ({
    x1: point.x,
    y1: point.y,
    // lol, im genius => connect last point with the first one
    x2: polygon.points[(index + 1) % polygon.points.length].x,
    y2: polygon.points[(index + 1) % polygon.points.length].y,
  }))

  const collisionDistances = polygonLines
    .map(pLine => collideLineLine(line, pLine))
    .filter(notNullable)
    .map(p => ({
      point: p,
      distance: distance(startPoint, p),
    }))

  return findMinByKey(collisionDistances, 'distance')
}

export const getRayCastCollisions = (arc: Arc, gameElements: GameElement[]) => {
  // generate vectors from radar values
  const rayVectors = Array.from({ length: RAY_COUNT })
    .map((_, index) =>
      Angle.to360Range(arc.startAngle + (arc.sectorAngle / (RAY_COUNT - 1)) * index)
    )
    .map(angle => ({
      x: Math.cos(Angle.toRadians(angle)),
      y: Math.sin(Angle.toRadians(angle)),
    }))

  const rayLines = rayVectors
    // recalculate angles to 2D lines
    .map(({ x, y }) => ({
      x1: arc.x,
      y1: arc.y,
      x2: x * arc.radius + arc.x,
      y2: y * arc.radius + arc.y,
    }))
    .map(rayLine => {
      // calculate collisions cor each ray
      // make rectangle line collision
      const rayElCollisions = gameElements
        .map(el => {
          let nearPoint
          switch (el.type) {
            case GameElementType.Rectangle: {
              // rectangle is just special case of polygon
              nearPoint = getNearestLinePolygonCollision(rayLine, {
                points: [
                  { x: el.x, y: el.y },
                  { x: el.x + el.width, y: el.y },
                  { x: el.x + el.width, y: el.y + el.height },
                  { x: el.x, y: el.y + el.height },
                ],
              })
              break
            }
            case GameElementType.Polygon: {
              nearPoint = getNearestLinePolygonCollision(rayLine, el)
              break
            }
            case GameElementType.Circle:
              // TODO: implement circle collision behavior
              break
          }
          return nearPoint
            ? {
                id: el.id,
                ...nearPoint,
              }
            : undefined
        })
        .filter(notNullable)

      const shortestDistance = findMinByKey(rayElCollisions, 'distance')

      // this could happen when collision array is empty
      // if (rayElCollisions.length === 0) {
      if (!shortestDistance) {
        return {
          collisionId: undefined,
          ...rayLine,
        }
      }
      return {
        distance: shortestDistance.distance,
        collisionId: shortestDistance.id,
        x1: rayLine.x1,
        y1: rayLine.y1,
        x2: shortestDistance.point.x,
        y2: shortestDistance.point.y,
      }
    })

  return rayLines
}
