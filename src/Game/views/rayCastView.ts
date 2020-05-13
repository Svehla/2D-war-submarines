import { CameraRotation, Line } from '../engine/gameElementTypes'
import { View, getRelativePosByAbsPos } from '../engine/mathCalc'
import { rotatePoint } from '../engine/rotation'

type Props = {
  view: View
  rays: Line[]
  cameraRotation: CameraRotation
}

const rayCastView = (ctx: CanvasRenderingContext2D, props: Props) => {
  const view = props.view

  const rotatedLines = props.rays.map(line => ({
    s: rotatePoint(line.s, props.cameraRotation.point, props.cameraRotation.angle),
    e: rotatePoint(line.e, props.cameraRotation.point, props.cameraRotation.angle),
  }))

  const centerPoint = {
    x: view.width / 2,
    y: view.height / 2,
  }

  ctx.beginPath()

  ctx.lineTo(centerPoint.x, centerPoint.y)
  rotatedLines.forEach(line => {
    const { x, y } = getRelativePosByAbsPos(view, { x: line.e.x, y: line.e.y })
    ctx.lineTo(x, y)
  })
  ctx.lineTo(centerPoint.x, centerPoint.y)
  ctx.closePath()

  // fix gradient to the end of radar
  const grd = ctx.createLinearGradient(view.width / 2, view.height / 2, 100, 100)
  grd.addColorStop(0, 'rgba(0,255,0,0.5)')
  grd.addColorStop(0.94, 'rgba(0,0,255,0.3)')
  ctx.fillStyle = grd
  ctx.fill()
}

export default rayCastView
