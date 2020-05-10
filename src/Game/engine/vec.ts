import { Angle, pythagorC } from './mathCalc'
import { Line, Point } from './gameElementTypes'

export type Vec = {
  x: number
  y: number
}

export const multiplyVec = (vec: Vec, size: number) => ({
  x: vec.x * size,
  y: vec.y * size,
})

export const getNormalVec = (vec: Vec) => {
  return {
    x: vec.y,
    y: -vec.x,
  }
}

export const toUnitVec = (Vec: { x: number; y: number }) => {
  const c = pythagorC(Vec.x, Vec.y)
  return {
    x: Vec.x / c,
    y: Vec.y / c,
  }
}

export const getLineVec = (line: Line): Vec => {
  return {
    y: line.e.y - line.s.y,
    x: line.e.x - line.s.x,
  }
}

export const shiftPoint = (point: Point, vec: Vec) => {
  return {
    x: point.x + vec.x,
    y: point.y + vec.y,
  }
}

export const angleToUnitVec = (angle: number): Vec => {
  return {
    x: Math.cos(Angle.toRadians(angle)),
    y: Math.sin(Angle.toRadians(angle)),
  }
}
