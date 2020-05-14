import { Point, Polygon, Rectangle } from './gameElementTypes'
import { addVec, rotateAbsPoint, subVec } from './vec'

export const rotatePoint = (point: Point, rotateAround: Point, rotationAngle: number): Point => {
  // const relCoordP = subVec(point, rotateAround)
  // const rotatedP = rotateAbsPoint(relCoordP, rotationAngle)
  // const shiftedP = addVec(rotatedP, rotateAround)
  // return shiftedP

  // HAHA: better than pipe operator bro
  return [point]
    .map(point => subVec(point, rotateAround))
    .map(relCoordP => rotateAbsPoint(relCoordP, rotationAngle))
    .map(rotatedP => addVec(rotatedP, rotateAround))[0]
}

export const rotatePolygon = (polygon: Polygon, rotateAround: Point, rotationAngle: number) => ({
  ...polygon,
  points: polygon.points.map(point => rotatePoint(point, rotateAround, rotationAngle)),
})

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
