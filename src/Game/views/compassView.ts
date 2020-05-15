import { CameraRotation, View } from '../engine/gameElementTypes'
import { rotatePolygon } from '../engine/rotation'

type Props = {
  view: View
  cameraRotation: CameraRotation
}

const COMPASS_RADIUS = 50
const compassView = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, cameraRotation } = props

  const compassCenterPoint = {
    x: 130,
    y: view.height - 130,
  }
  const southPoints = [
    { x: compassCenterPoint.x - 10, y: compassCenterPoint.y },
    { x: compassCenterPoint.x, y: compassCenterPoint.y + COMPASS_RADIUS },
    { x: compassCenterPoint.x + 10, y: compassCenterPoint.y },
  ]

  const northPoints = [
    { x: compassCenterPoint.x - 10, y: compassCenterPoint.y },
    { x: compassCenterPoint.x, y: compassCenterPoint.y - COMPASS_RADIUS },
    { x: compassCenterPoint.x + 10, y: compassCenterPoint.y },
  ]

  ctx.beginPath()
  southPoints.forEach(point => ctx.lineTo(point.x, point.y))
  ctx.fillStyle = '#99F'
  ctx.fill()
  ctx.closePath()

  ctx.beginPath()
  northPoints.forEach(point => ctx.lineTo(point.x, point.y))
  ctx.fillStyle = '#F99'
  ctx.fill()
  ctx.closePath()

  ctx.beginPath()
  rotatePolygon({ points: southPoints }, compassCenterPoint, cameraRotation.angle).points.forEach(
    point => {
      ctx.lineTo(point.x, point.y)
    }
  )
  ctx.fillStyle = 'blue'
  ctx.fill()
  ctx.closePath()

  ctx.beginPath()
  rotatePolygon({ points: northPoints }, compassCenterPoint, cameraRotation.angle).points.forEach(
    point => {
      ctx.lineTo(point.x, point.y)
    }
  )
  ctx.fillStyle = 'red'
  ctx.fill()
  ctx.closePath()

  // letters

  ctx.beginPath()
  ctx.font = '20px Verdana'
  ctx.fillStyle = '#F99'
  ctx.fillText('N', compassCenterPoint.x - 7, compassCenterPoint.y - COMPASS_RADIUS - 4)
  ctx.closePath()

  ctx.beginPath()
  ctx.font = '20px Verdana'
  ctx.fillStyle = '#99F'
  ctx.fillText('S', compassCenterPoint.x - 7, compassCenterPoint.y + COMPASS_RADIUS + 20)
  ctx.closePath()
}

export default compassView

//
