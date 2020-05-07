// what about to use some library?
// https://github.com/bmoren/p5.collide2D
import { Angle, distance, getAngleBetweenPoints, isAngleInArcSector } from '../engine/mathCalc'
import {
  Arc,
  Circle,
  GameElement,
  GameElementType,
  Point,
  Polygon,
  Rectangle,
} from '../gameElementTypes'

// https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js#L228
export const isPointPolygonCollision = ({ points: vertices }: Polygon, point: Point): boolean => {
  const px = point.x
  const py = point.y
  let collision = false

  // go through each of the vertices, plus the next vertex in the list
  let next = 0
  for (let current = 0; current < vertices.length; current++) {
    // get next vertex in list if we've hit the end, wrap around to 0
    next = current + 1
    if (next === vertices.length) next = 0

    // get the PVectors at our current position this makes our if statement a little cleaner
    const vc = vertices[current] // c for "current"
    const vn = vertices[next] // n for "next"

    // compare position, flip 'collision' variable back and forth
    if (
      ((vc.y > py && vn.y < py) || (vc.y < py && vn.y > py)) &&
      px < ((vn.x - vc.x) * (py - vc.y)) / (vn.y - vc.y) + vc.x
    ) {
      collision = !collision
    }
  }
  return collision
}

export const isPointArcCollision = (arc: Arc, point: Point) => {
  const arcRecAngle = getAngleBetweenPoints(arc, point)
  return (
    isAngleInArcSector(arcRecAngle, arc.startAngle, arc.endAngle) &&
    distance(arc, point) < arc.radius
  )
}

export const isCircleGameElementCollision = (circleShape1: Circle, shape2: GameElement) => {
  switch (shape2.type) {
    case GameElementType.Circle:
      return isCircleCircleCollision(circleShape1, shape2)
    case GameElementType.Rectangle:
      return isRectangleCircleCollision(circleShape1, shape2)
    case GameElementType.Polygon:
      throw new Error('not supported yet')
  }
}

const isRectangleCircleCollision = (circle: Circle, rect: Rectangle) => {
  const xDistance = Math.abs(circle.x - rect.x - rect.width / 2)
  const yDistance = Math.abs(circle.y - rect.y - rect.height / 2)

  if (xDistance > rect.width / 2 + circle.radius) {
    return false
  }

  if (yDistance > rect.height / 2 + circle.radius) {
    return false
  }

  if (xDistance <= rect.width / 2) {
    return true
  }

  if (yDistance <= rect.height / 2) {
    return true
  }

  const dx = xDistance - rect.width / 2
  const dy = yDistance - rect.height / 2
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

/**
 * inspiration:
 * > https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
 */
const isCircleCircleCollision = (circle1: Circle, circle2: Circle): boolean => {
  const dx = circle1.x - circle2.x
  const dy = circle1.y - circle2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}
