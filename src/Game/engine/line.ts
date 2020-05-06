import { Line, Point } from '../gameElementTypes'
import { Vec } from './vec'

export const getPointsFromLines = (lines: Line[]): Point[] => {
  return lines.flatMap(line => [
    { x: line.x1, y: line.y1 },
    { x: line.x2, y: line.y2 },
  ])
}

export const getLinesFromPoints = (points: Point[]): Line[] => {
  const polygonLines = points.map((point, index) => ({
    x1: point.x,
    y1: point.y,
    // -> connect last point with the first one
    x2: points[(index + 1) % points.length].x,
    y2: points[(index + 1) % points.length].y,
  }))
  return polygonLines
}

export const shiftPoint = (point: Point, vec: Vec) => ({
  x: point.x + vec.x,
  y: point.y + vec.y,
})

// todo: reimplement via shiftPoint + change line structur
export const shiftLine = (line: Line, vec: Vec) => {
  return {
    x1: line.x1 + vec.x,
    y1: line.y1 + vec.y,
    x2: line.x2 + vec.x,
    y2: line.y2 + vec.y,
  }
}
