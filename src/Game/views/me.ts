import { Angle, View } from '../mathCalc'
import { Circle } from '../gameElementTypes'

type Props = {
  me: Circle & { background: string }
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
