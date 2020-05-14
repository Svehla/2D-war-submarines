import { Line, Point } from './gameElementTypes'
import { Vec, addVec } from './vec'

export const getPointsFromLines = (lines: Line[]): Point[] => {
  return lines.flatMap(line => [
    { x: line.s.x, y: line.s.y },
    { x: line.e.x, y: line.e.y },
  ])
}

export const getLinesFromPoints = (points: Point[]): Line[] => {
  const polygonLines = points.map((point, index) => {
    // -> connect last point with the first one
    const endPoint = points[(index + 1) % points.length]
    return {
      s: point,
      e: endPoint,
    }
  })
  return polygonLines
}

export const shiftLine = (line: Line, vec: Vec) => ({
  s: addVec(line.s, vec),
  e: addVec(line.e, vec),
})
