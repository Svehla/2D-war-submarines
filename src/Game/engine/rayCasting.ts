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
import { getLinesFromPoints } from './line'
import { notNullable } from '../../utils'

/**
 *
 * inspiration from:
 *   > https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js#L152
 *   > https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
 *
 * return undefined value if 2 line are the same or there is no intersection point
 */
const collideLineLine = (line1: Line, line2: Line): Point | undefined => {
  const {
    s: { x: x1, y: y1 },
    e: { x: x2, y: y2 },
  } = line1
  const {
    s: { x: x3, y: y3 },
    e: { x: x4, y: y4 },
  } = line2

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

// https://stackoverflow.com/a/37225895/8995887
const collideLineCircle = (line: Line, circle: Circle): [] | [Point] | [Point, Point] => {
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
    x: line.e.x - line.s.x,
    y: line.e.y - line.s.y,
  }
  const v2: any = {
    x: line.s.x - circle.x,
    y: line.s.y - circle.y,
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
    retP1.x = line.s.x + v1.x * u1
    retP1.y = line.s.y + v1.y * u1
    ret[0] = retP1
  }
  if (u2 <= 1 && u2 >= 0) {
    // second add point if on the line segment
    retP2.x = line.s.x + v1.x * u2
    retP2.y = line.s.y + v1.y * u2
    ret[ret.length] = retP2
  }
  return ret
}

const getNearestLineCircleCollision = (line: Line, circle: Circle) => {
  const startPoint = {
    x: line.s.x,
    y: line.s.y,
  }
  // TODO: add circle collision
  // TODO: implement
  // @ts-ignore
  const collisions = collideLineCircle(line, circle)
    .flat()
    .map(point => ({
      point,
      distance: point ? distance(startPoint, point) : null,
    }))
  if (collisions.length > 0) {
    console.log(collisions)
  }
  // return undefined
  return findMinByKey(collisions, 'distance')
}

const getNearestLinePolygonCollision = (line: Line, polygon: Polygon) => {
  const polygonLines = getLinesFromPoints(polygon.points)

  const startPoint = {
    x: line.s.x,
    y: line.s.y,
  }
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
    .map((_, index) => {
      const sectorAngle = Angle.sub(arc.endAngle, arc.startAngle)
      return Angle.to360Range(arc.startAngle + (sectorAngle / (RAY_COUNT - 1)) * index)
    })
    .map(angle => ({
      x: Math.cos(Angle.toRadians(angle)),
      y: Math.sin(Angle.toRadians(angle)),
    }))

  const rayLines = rayVectors
    // recalculate angles to 2D lines
    .map(
      ({ x, y }): Line => ({
        s: arc,
        e: {
          x: x * arc.radius + arc.x,
          y: y * arc.radius + arc.y,
        },
      })
    )
    .map(rayLine => {
      // calculate collisions cor each ray
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
              nearPoint = getNearestLineCircleCollision(rayLine, el)
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
        s: rayLine.s,
        e: shortestDistance.point,
      }
    })

  return rayLines
}
