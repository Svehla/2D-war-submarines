import { Point, Polygon, Rectangle } from './gameElementTypes'
import { rotateAbsPoint } from './vec'

// TODO: add rotate point around point

export const rotatePoint = (circle: Point, rotateAround: Point, rotationAngle: number) => {
  return {
    ...circle,
    // trick with pipe.. haha trololo
    ...[circle]
      // center should be user in the center of screen
      .map(point => ({
        x: point.x - rotateAround.x,
        y: point.y - rotateAround.y,
      }))
      .map(point => rotateAbsPoint(point, rotationAngle))
      .map(point => ({
        x: point.x + rotateAround.x,
        y: point.y + rotateAround.y,
      }))[0],
  }
}

export const rotatePolygon = (polygon: Polygon, rotateAround: Point, rotationAngle: number) => {
  return {
    ...polygon,
    points: polygon.points
      // center should be user in the center of screen
      .map(point => ({
        x: point.x - rotateAround.x,
        y: point.y - rotateAround.y,
      }))
      .map(point => rotateAbsPoint(point, rotationAngle))
      .map(point => ({
        x: point.x + rotateAround.x,
        y: point.y + rotateAround.y,
      })),
  }
}

export const rotateRectangle = (
  rect: Rectangle,
  rotateAround: Point,
  rotationAngle: number
): Polygon => {
  const { height, width, x, y } = rect
  const points = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]

  return rotatePolygon({ points: points }, rotateAround, rotationAngle)
}
