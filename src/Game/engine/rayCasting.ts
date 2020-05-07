import { Angle, distance, findMinByKey } from './mathCalc'
import { Arc, GameElement, GameElementType, Line, Point, Polygon } from '../gameElementTypes'
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
      s: {
        x: arc.x,
        y: arc.y,
      },
      e: {
        x: x * arc.radius + arc.x,
        y: y * arc.radius + arc.y,
      },
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
        s: {
          x: rayLine.s.x,
          y: rayLine.s.y,
        },
        e: {
          x: shortestDistance.point.x,
          y: shortestDistance.point.y,
        },
      }
    })

  return rayLines
}
