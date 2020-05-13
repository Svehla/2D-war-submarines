import { CameraRotation, Polygon } from '../engine/gameElementTypes'
import { View, getRelativePosByAbsPos } from '../engine/mathCalc'
import { rotatePolygon } from '../engine/rotation'
import wallCollision from './wallCollisionView'

type Props = {
  collisionSize: number
  view: View
  wall: { background: string } & Polygon
  cameraRotation: CameraRotation
}

const SHOW_WALL_COLLISIONS = false
// const SHOW_WALL_COLLISIONS = true
const wall = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { cameraRotation, collisionSize, view, wall } = props
  const points = rotatePolygon(wall, cameraRotation.point, cameraRotation.angle).points

  if (SHOW_WALL_COLLISIONS) {
    wallCollision(ctx, {
      cameraRotation,
      polygon: wall,
      view,
      collisionRadius: collisionSize,
    })
  }

  ctx.beginPath()
  points.forEach(point => {
    const { x, y } = getRelativePosByAbsPos(view, point)
    ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.fillStyle = wall.background
  ctx.fill()
  ctx.closePath()
}

export default wall
