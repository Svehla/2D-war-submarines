import { Line, Point } from './gameElementTypes'
import { Vec, addVec } from './vec'

export const getPointsFromLines = (lines: Line[]): Point[] => {
  return lines.flatMap(line => [
    { x: line.s.x, y: line.s.y },
    { x: line.e.x, y: line.e.y },
  ])
}

export const getLinesFromPoints = (points: Point[]): Line[] => {
  const polygonLines = points.map((point, index) => ({
    s: {
      x: point.x,
      y: point.y,
    },
    // -> connect last point with the first one
    e: {
      x: points[(index + 1) % points.length].x,
      y: points[(index + 1) % points.length].y,
    },
  }))
  return polygonLines
}

export const shiftLine = (line: Line, vec: Vec) => ({
  s: addVec(line.s, vec),
  e: addVec(line.e, vec),
})
