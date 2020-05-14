import './line'
import { GameElement, GameElementType, Line, Point, View } from './gameElementTypes'
import { RADAR_LOOP_SPEED } from '../gameSetup'
import { subVec } from './vec'

// todo: extract types out of `mathCalc.js` to another file
// todo: extends Rectangle which extends Point

export const decreaseBy1ToZero = (num: number) => Math.max(num - 1, 0)

export const pythagorC = (a: number, b: number) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))

// inspiration: https://stackoverflow.com/questions/39776819/function-to-normalize-any-number-from-0-1
export const normalizeInto01 = (val: number, min = 0, max = 0) => (val - min) / (max - min)

export const distance = (a: Point, b: Point) => {
  const xDiff = a.x - b.x
  const yDiff = a.y - b.y
  return pythagorC(xDiff, yDiff)
}

export const stayInRange = (num: number, range: number) => Math.min(range, Math.max(-range, num))

// inspiration
// https://gist.github.com/mattdesl/47412d930dcd8cd765c871a65532ffac
export const distancePointToLine = (point: Point, line: Line) => {
  const dx = line.e.x - line.s.x
  const dy = line.e.y - line.s.y
  const l2 = dx * dx + dy * dy

  if (l2 === 0) return distance(point, { x: line.s.x, y: line.s.y })

  let t = ((point.x - line.s.x) * dx + (point.y - line.s.y) * dy) / l2
  t = Math.max(0, Math.min(1, t))

  return distance(point, { x: line.s.x + t * dx, y: line.s.y + t * dy })
}

/**
 * if array has length 0 => reduce return init value (so it returns undefined as we expect)
 */
export const findMinByKey = <T, K extends keyof T>(arr: Array<T>, key: K): T | undefined =>
  arr.reduce((min, curr) => (min[key] < curr[key] ? min : curr), arr[0])

const isInAxis = (axisPosition: number, larger: number, lower: number, halfWidth: number) =>
  axisPosition + halfWidth >= larger && axisPosition <= lower + halfWidth

/**
 * calculate player position from absolute playground coordinations
 * to screen view relative coordinations
 * raped vec to point abs position
 */
export const getRelativePosByAbsPos = (view: View, point: Point) => subVec(point, view)

// ----------------------------------------------
// ------- game modules which has no files ------
// ----------------------------------------------
/**
 * check if `gameElement` is in view (screen that user can see)
 *
 * collisions of screen and elements are compared by absolute coordinations
 *
 * TODO: add support for Polygons
 * TODO: implement this fn via collisions :| now its shitty
 *
 * TODO: should not depends on the game => just engine stuff
 *
 * TODO: does not work on rotation world
 */
export const isInView = (view: View, gameElement: GameElement): boolean => {
  let height = null
  let width = null
  let x = null
  let y = null
  // make square position for easier calculating of `isInView` fn
  switch (gameElement.type) {
    case GameElementType.Circle: {
      x = gameElement.x
      y = gameElement.y
      width = gameElement.radius
      height = gameElement.radius
      break
    }
    case GameElementType.Rectangle: {
      x = gameElement.x
      y = gameElement.y
      width = gameElement.width
      height = gameElement.height
      break
    }
    case GameElementType.Polygon: {
      // work with rects for simplify code
      // todo: write test -> it does not work
      // shitty collisions i guess -> but it could be fast :D
      // todo: implement logic for polygons
      const xPoints = gameElement.points.map(({ x }) => x)
      const yPoints = gameElement.points.map(({ y }) => y)
      x = Math.min(...xPoints)
      y = Math.min(...yPoints)
      width = Math.max(...xPoints) - x
      height = Math.max(...yPoints) - y
      break
    }
  }

  const rightX = view.x + view.width
  const bottomY = view.y + view.height

  const isInX = isInAxis(x, view.x, rightX, width)
  const isInY = isInAxis(y, view.y, bottomY, height)

  return isInX && isInY
}

/**
 *
 * radar has to have position by timestamp (aka it has to be synchronized by server)
 *
 * how to sync it with server? (have to use server timestamp + calc ping time somehow)
 * https://stackoverflow.com/a/5357794/8995887
 *
 */
// todo: make variable for slow down the radar
export const calcNewRadarRotation = () => {
  // return 0
  const ms = new Date().getTime()

  const currentCircle = ms % RADAR_LOOP_SPEED

  return normalizeInto01(currentCircle, 0, RADAR_LOOP_SPEED) * 360
}
