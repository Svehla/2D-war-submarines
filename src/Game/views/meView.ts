import { Angle, View } from '../engine/mathCalc'
import { MeElementType } from '../gameElementTypes'

type Props = {
  me: MeElementType
  view: View
}

const me = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { me, view } = props
  ctx.beginPath()
  ctx.arc(view.width / 2, view.height / 2, me.radius, 0, Angle.toRadians(360))
  ctx.closePath()
  ctx.fillStyle = me.background
  ctx.fill()
}

export default me
