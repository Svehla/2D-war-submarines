import { Angle, View, getRelativePosByAbsPos } from '../engine/mathCalc'
import { CameraRotation, GameElementType, Polygon } from '../engine/gameElementTypes'
import { getWallCollisionElements } from '../engine/collisionsHelper'
import { rotatePolygon } from '../engine/rotation'

type Props = {
  view: View
  polygon: Polygon
  collisionRadius: number
  cameraRotation: CameraRotation
}

const wallCollision = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, collisionRadius, polygon, cameraRotation } = props

  const colElements = getWallCollisionElements(
    rotatePolygon(polygon, cameraRotation.point, cameraRotation.angle),
    collisionRadius
  )

  colElements.forEach(el => {
    switch (el.type) {
      case GameElementType.Polygon: {
        ctx.beginPath()

        el.points.forEach(point => {
          const { x, y } = getRelativePosByAbsPos(view, point)
          ctx.lineTo(x, y)
        })
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.fill()
        ctx.closePath()

        break
      }
      case GameElementType.Arc: {
        ctx.beginPath()
        const { x, y } = getRelativePosByAbsPos(view, el)
        ctx.arc(x, y, el.radius, Angle.toRadians(el.startAngle), Angle.toRadians(el.endAngle))
        ctx.lineTo(x, y)
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.fill()
        ctx.closePath()
        break
      }
      default:
        break
    }
  })
}

export default wallCollision
