import { Line, Point } from '../gameElementTypes'
import { Vec } from './vec'

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

export const shiftPoint = (point: Point, vec: Vec) => ({
  x: point.x + vec.x,
  y: point.y + vec.y,
})

// todo: reimplement via shiftPoint + change line structur
export const shiftLine = (line: Line, vec: Vec) => {
  return {
    s: {
      x: line.s.x + vec.x,
      y: line.s.y + vec.y,
    },
    e: {
      x: line.e.x + vec.x,
      y: line.e.y + vec.y,
    },
  }
}
