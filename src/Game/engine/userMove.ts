// todo: extract math to engine and logic to game
import { Angle, View, distToSegment, distance, getElShift } from './mathCalc'
import { Circle, GameCollisionsElement, GameElementType, Point } from './gameElementTypes'
import { Playground } from '../gameSetup'
import { Vec, angleToUnitVec, getLineVec, getNormalVec, shiftPoint, toUnitVec } from './vec'
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
        const disToInnerEdge = distToSegment(newPos, colEl.baseLine)
        relativeShift = { directionVec, disToInnerEdge }
        break
      }
    }
    return shiftPoint(newPos, {
      x: relativeShift.directionVec.x * (newPos.radius - relativeShift.disToInnerEdge),
      y: relativeShift.directionVec.y * (newPos.radius - relativeShift.disToInnerEdge),
    })
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

export const calculateNewObjPos = (
  directionVec: Vec,
  view: View,
  meElement: Circle & { maxSpeedPerSecond: number },
  timeSinceLastTick: number,
  playground: Playground
): Point => {
  // return neg or pos distance by positions of cursor
  const { x: distanceX, y: distanceY } = getElShift(
    directionVec,
    view,
    meElement.maxSpeedPerSecond,
    timeSinceLastTick
  )
  // possible shifts without borders
  const newMeEl = {
    x: meElement.x + distanceX,
    y: meElement.y + distanceY,
    radius: meElement.radius,
  }

  const collidedColElements = playground.walls
    .flatMap(wall => getWallCollisionElements(wall, newMeEl.radius))
    .filter(colEl => isGameColElCollide(newMeEl, colEl))

  // if (collidedColElements.length > 0) {
  //   console.log(collidedColElements)
  // }
  const meShiftedPoint = shiftPosByWallCollisions(meElement, newMeEl, collidedColElements)

  return {
    x: meShiftedPoint.x,
    y: meShiftedPoint.y,
  }
}
