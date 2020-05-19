import { Angle } from '../engine/angle'
import { CameraRotation, MeElementType, View } from '../engine/gameElementTypes'
import redArrowView from './redArrowView'

type Props = {
  me: MeElementType
  view: View
  cameraRotation: CameraRotation
}

const me = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { cameraRotation, me, view } = props

  ctx.beginPath()
  ctx.arc(view.width / 2, view.height / 2, me.radius, 0, Angle.toRadians(360))
  ctx.closePath()
  ctx.fillStyle = me.background
  ctx.fill()

  // TODO: add camera rotation + me rotation
  redArrowView(ctx, { cameraRotation, view, rotation: me.rotationAngle })
}

export default me
