import { Angle } from '../engine/angle'
import { CameraRotation, View } from '../engine/gameElementTypes'
import { rotatePolygon } from '../engine/rotation'

type Props = {
  view: View
  cameraRotation: CameraRotation
  rotation: number
}

const redArrowView = (ctx: CanvasRenderingContext2D, { cameraRotation, view, rotation }: Props) => {
  ctx.beginPath()
  const centerPoint = {
    x: view.width / 2,
    y: view.height / 2,
  }

  // my vision angle
  // direction arrow
  const points = [
    { x: view.width / 2, y: view.height / 2 },
    { x: view.width / 2, y: view.height / 2 - 100 },
    { x: view.width / 2 - 20, y: view.height / 2 - 90 },
    { x: view.width / 2, y: view.height / 2 - 100 },
    { x: view.width / 2 + 20, y: view.height / 2 - 90 },
  ]
  // angle + 90 coz points are pointing to the top and not to the right
  rotatePolygon(
    { points },
    centerPoint,
    Angle.add(Angle.add(rotation, 90), cameraRotation.angle)
  ).points.forEach(point => {
    ctx.lineTo(point.x, point.y)
  })
  ctx.strokeStyle = '#F0F'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.closePath()
}

export default redArrowView
