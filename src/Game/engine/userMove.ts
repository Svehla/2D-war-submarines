import { Angle } from './angle'
import {
  Circle,
  GameCollisionsElement,
  GameElementType,
  MeElementType,
  Point,
  View,
} from './gameElementTypes'
import { Playground } from '../gameSetup'
import {
  Vec,
  addVec,
  angleToUnitVec,
  getLineVec,
  getNormalVec,
  getVecAngle,
  getVecSize,
  multiplyVec,
  rotateAbsPoint,
  subVec,
  toUnitVec,
} from './vec'
import { distance, distancePointToLine, stayInRange } from './mathCalc'
import { getWallCollisionElements } from './collisionsHelper'
import { isPointArcCollision, isPointPolygonCollision } from './collisions'

const isGameColElCollide = (circle: Circle, wall: GameCollisionsElement) => {
  // what about OOP interfaces instead of switch case?
  switch (wall.type) {
    case GameElementType.Arc: {
      return isPointArcCollision(wall, circle)
    }
    case GameElementType.Polygon: {
      return isPointPolygonCollision(wall, circle)
    }
  }
}

/**
 * return new possible shifted positions of main circle by wall collisions
 *
 * take Circle el position and calculate all collisions
 * with walls
 *
 * it there is collision with wall => it calc shifted element position by vector of move
 */
const shiftPosByWallCollisions = (
  prevPos: Circle,
  newPos: Circle,
  gameColEl: GameCollisionsElement[]
) => {
  if (gameColEl.length === 0) {
    return newPos
  }

  if (gameColEl.length === 1) {
    const colEl = gameColEl[0]
    let relativeShift
    switch (colEl.type) {
      case GameElementType.Arc: {
        // move user to the edge of collision
        const angleBetween = Angle.getAngleBetweenPoints(colEl, newPos)
        const disToInnerEdge = distance(colEl, newPos)
        const directionVec = angleToUnitVec(angleBetween)
        relativeShift = { directionVec, disToInnerEdge }
        break
      }
      case GameElementType.Polygon: {
        const directionVec = toUnitVec(getNormalVec(getLineVec(colEl.baseLine)))
        const disToInnerEdge = distancePointToLine(newPos, colEl.baseLine)
        relativeShift = { directionVec, disToInnerEdge }
        break
      }
    }
    const shiftedVec = multiplyVec(
      relativeShift.directionVec,
      newPos.radius - relativeShift.disToInnerEdge
    )
    return addVec(newPos, shiftedVec)
  }

  if (gameColEl.length === 2) {
    // TODO: not implemented yet
    // calculate shifted position back out of collision
    return prevPos
  }

  // does not support collisions with more than 2 elements
  // i hope that there will not be collisions of more that 2 elements
  // in one pixel
  // .... .... or -> find closest intersection of these n elements
  // element will not shift
  return prevPos
}

const ACCELERATION_SPEED_COEFFICIENT = 40
const getElShift = (directionVec: Vec, maxSecSpeed: number, timeSinceLastTick: number): Point => {
  const angle = getVecAngle(directionVec)
  const d = getVecSize(directionVec)
  const acceleration = Math.pow(d / ACCELERATION_SPEED_COEFFICIENT, 2)
  const maxSpeedPerInterval = maxSecSpeed / (1000 / timeSinceLastTick)
  const elementAcceleration = Math.min(acceleration, maxSpeedPerInterval)
  const newX = Math.cos(Angle.toRadians(angle)) * elementAcceleration
  const newY = Math.sin(Angle.toRadians(angle)) * elementAcceleration
  return {
    x: newX,
    y: newY,
  }
}

/**
 *
 * calculate y mouse coord
 * TODO: add speed & clock
 * speed is based on the mousePos
 */
const getElDirection = (mousePos: Point, view: View, gameRotation: number) => {
  // TODO: add speed with clock game time
  const centerPoint = {
    x: view.width / 2,
    y: view.height / 2,
  }

  const relCoords = subVec(mousePos, centerPoint)
  const yDist = relCoords.y

  const absDirVec = { x: 0, y: yDist }
  const directionVec = rotateAbsPoint(
    absDirVec,
    // magic
    Angle.sub(360, gameRotation)
  )

  return directionVec
}

/**
 * calculate x mouse coord
 * calculate new rotation by cursor on the rotated game
 */
const getNewElAngle = (
  mousePos: Point,
  view: View,
  oldGameRotation: number,
  timeSinceLastTick: number,
  cameraAngle: number
) => {
  // TODO: implement timeSinceLastTick
  const centerPoint = {
    x: view.width / 2,
    y: view.height / 2,
  }
  // todo: add rotated camera

  // return Angle.getAngleBetweenPoints(centerPoint, mousePos)
  const mouseCenterAngle = Angle.getAngleBetweenPoints(centerPoint, mousePos)
  return Angle.sub(mouseCenterAngle, cameraAngle)

  const relCoords = subVec(centerPoint, mousePos)
  const xDist = stayInRange(relCoords.x, 400)
  const slow_random_const = (timeSinceLastTick / 33) * 0.001
  const limitedAngleSpeed = slow_random_const * xDist

  const rotationAngle = Angle.add(oldGameRotation, limitedAngleSpeed)
  return rotationAngle
}

export const calculateNewObjPos = (
  mousePos: Point,
  view: View,
  meElement: MeElementType,
  playground: Playground,
  timeSinceLastTick: number,
  cameraAngle: number
): Point & { rotationAngle: number } => {
  // recalculate rotation to absolute position
  // user use mouse for manipulating of rotation
  // next 3 lines are really complicated -> i should simplify it somehow
  // mouse X coord to angle
  const rotationAngle = getNewElAngle(
    mousePos,
    view,
    meElement.rotationAngle,
    timeSinceLastTick,
    cameraAngle
  )
  // mouse Y coord to speed (aka distance of move angel)
  const speedPerSec = 100
  const relDirectionVec = {
    x: Math.cos(Angle.toRadians(rotationAngle)) * 100,
    y: Math.sin(Angle.toRadians(rotationAngle)) * 100,
  }
  // const relDirectionVec = getElDirection(mousePos, view, rotationAngle)
  const directionShiftVec = getElShift(relDirectionVec, meElement.maxSecSpeed, timeSinceLastTick)

  // possible element shift without border collision
  const newMeEl = {
    x: meElement.x + directionShiftVec.x,
    y: meElement.y + directionShiftVec.y,
    radius: meElement.radius,
  }

  // apply walls collisions and recalculate user move
  const collidedColElements = playground.walls
    .flatMap(wall => getWallCollisionElements(wall, newMeEl.radius))
    .filter(colEl => isGameColElCollide(newMeEl, colEl))

  const meShiftedPoint = shiftPosByWallCollisions(meElement, newMeEl, collidedColElements)

  return {
    x: meShiftedPoint.x,
    y: meShiftedPoint.y,
    rotationAngle,
  }
}
