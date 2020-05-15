import { Angle } from './angle'
import { Line, Point } from './gameElementTypes'
import { distance, pythagorC } from './mathCalc'

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

export const getLineVec = (line: Line): Vec => ({
  y: line.e.y - line.s.y,
  x: line.e.x - line.s.x,
})

export const addVec = (point: Point, vec: Vec) => ({
  x: point.x + vec.x,
  y: point.y + vec.y,
})

export const subVec = (point: Point, vec: Vec) => ({
  x: point.x - vec.x,
  y: point.y - vec.y,
})
export const angleToUnitVec = (angle: number): Vec => {
  return {
    x: Math.cos(Angle.toRadians(angle)),
    y: Math.sin(Angle.toRadians(angle)),
  }
}

export const getVecAngle = (vec: Vec) => Angle.getAngleBetweenPoints({ x: 0, y: 0 }, vec)

export const getVecSize = (vec: Vec) => distance({ x: 0, y: 0 }, vec)

// I should rewrite to imagine numbers for better performance optimisation
// rotate point
// TODO: is the cos/sin used correct here???
export const rotateAbsPoint = (point: Point, angle: number): Point => {
  const dist = distance({ x: 0, y: 0 }, point)
  const angleBetween = Angle.getAngleBetweenPoints({ x: 0, y: 0 }, point)
  const newAngle = Angle.add(angleBetween, angle)
  return {
    x: Math.cos(Angle.toRadians(newAngle)) * dist,
    y: Math.sin(Angle.toRadians(newAngle)) * dist,
  }
}
