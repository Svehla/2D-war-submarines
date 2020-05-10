import { Polygon } from '../engine/gameElementTypes'
import { View, getRelativePosByAbsPos } from '../engine/mathCalc'
import wallCollision from './wallCollisionView'

type Props = {
  collisionSize: number
  view: View
  wall: { background: string } & Polygon
}

const SHOW_WALL_COLLISIONS = false
// const SHOW_WALL_COLLISIONS = true
const wall = (ctx: CanvasRenderingContext2D, { collisionSize, view, wall }: Props) => {
  const points = wall.points
  const relativePoints = points.map(point => getRelativePosByAbsPos(view, point))

  if (SHOW_WALL_COLLISIONS) {
    wallCollision(ctx, { polygon: wall, view, collisionRadius: collisionSize })
  }

  ctx.beginPath()
  relativePoints.forEach(point => {
    ctx.lineTo(point.x, point.y)
  })
  ctx.closePath()
  ctx.fillStyle = wall.background
  ctx.fill()
  ctx.closePath()
}

export default wall
