// todo: extract math to engine and logic to game

import { Circle, GameCollisionsElement, GameElementType, Point } from '../gameElementTypes'
import { Playground } from '../gameSetup'
import {
  View,
  distToSegment,
  distance,
  getAngleBetweenPoints,
  getElShift,
  stayInRange,
} from './mathCalc'
import { angleToUnitVec, getLineVec, getNormalVec, shiftPoint, toUnitVec } from './vec'
import { getElementCollisionsElements } from './collisionsHelper'
import { isPointArcCollision, isPointPolygonCollision } from './collisions'
import { notNullable } from '../../utils'

/**
 * return new possible shifted positions of main circle by wall collisions
 *
 * take Circle el possition and calculate all collisions
 * with walls
 *
 * it there is collision with wall => it calc shifted element position by vector of move
 *
 * returns array of shifted positions
 * kinda weird API right??? todo: refactor it to make it more logical :|
 */
export const shiftPosByWallCollisions = (
  meElement: Circle,
  walls: GameCollisionsElement[]
): Point[] => {
  const newPos = { x: meElement.x, y: meElement.y }
  const wallsCollisionsShift = walls
    // @ts-ignore
    .flatMap(wall => getElementCollisionsElements(wall, meElement.radius))
    // collision elements
    .map(colEl => {
      const el = colEl
      // what about OOP interfaces instead of switch case?
      switch (el.type) {
        case GameElementType.Arc: {
          // @ts-ignore
          const isCol = isPointArcCollision(el, newPos)
          return isCol ? el : undefined
        }
        case GameElementType.Polygon: {
          const isCol = isPointPolygonCollision(el, newPos)
          return isCol ? el : undefined
        }
      }
    })
    .filter(notNullable)
    // kinda tricky calculation for shifting of collision
    // and move current point out of the collision
    // @ts-ignore
    .map(collisionElement => {
      const el = collisionElement
      // what about OOP interfaces instead of switch case?
      switch (el.type) {
        case GameElementType.Arc: {
          // move user to the edge of collision
          const angleBetween = getAngleBetweenPoints(el, newPos)
          const distanceToEdge = distance(el, newPos)
          const directionVec = angleToUnitVec(angleBetween)
          return { directionVec, distanceToEdge }
        }
        case GameElementType.Polygon: {
          // const centerPoint = getCenterPointOfLine(el.baseLine)
          const directionVec = toUnitVec(getNormalVec(getLineVec(el.baseLine)))
          const distanceToEdge = distToSegment(newPos, el.baseLine)
          return { directionVec, distanceToEdge }
        }
      }
    })
    // @ts-ignore
    .map(({ directionVec, distanceToEdge }) =>
      shiftPoint(newPos, {
        x: directionVec.x * (meElement.radius - distanceToEdge),
        y: directionVec.y * (meElement.radius - distanceToEdge),
      })
    )

  return wallsCollisionsShift
}

export const calculateNewObjPos = (
  mousePos: Point,
  view: View,
  meElement: Circle & { maxSpeedPerSecond: number },
  timeSinceLastTick: number,
  playground: Playground
): Point => {
  // return neg or pos distance by positions of cursor
  const { x: distanceX, y: distanceY } = getElShift(
    mousePos,
    view,
    meElement.maxSpeedPerSecond,
    timeSinceLastTick
  )
  //
  // possible shifts
  const newPos = {
    x: meElement.x + distanceX,
    y: meElement.y + distanceY,
  }

  // position correction by element collision
  // TODO: refactor this monster code
  // check center me point collision for each border element

  // TODO: fix closest position to the all edges
  // cant handle multi advanced collisions with more elements
  const colFlat = shiftPosByWallCollisions(
    { x: newPos.x, y: newPos.y, radius: meElement.radius },
    // @ts-ignore
    playground.walls
  )
  if (colFlat.length > 1) {
    return meElement
  }

  // TODO: should aggregate collisions and get shortest distance?
  for (const isWallCollision of colFlat) {
    if (isWallCollision) {
      // console.log(isCollision)
      return isWallCollision as Point
    }
  }

  // what about borders???
  const xWithBorder = stayInRange(newPos.x, {
    min: meElement.radius,
    max: playground.width - meElement.radius,
  })
  const yWithBorder = stayInRange(newPos.y, {
    min: meElement.radius,
    max: playground.height - meElement.radius,
  })

  return {
    x: xWithBorder,
    y: yWithBorder,
  }
}
