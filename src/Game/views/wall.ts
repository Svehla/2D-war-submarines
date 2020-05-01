import { Point } from '../gameElementTypes'
import { View, getRelativePosByAbsPos } from '../engine/mathCalc'

type Props = {
  view: View
  background: string
  points: Point[]
}

const wall = (ctx: CanvasRenderingContext2D, { view, points, background }: Props) => {
  const linePoints = points.map(point => getRelativePosByAbsPos(view, point))

  ctx.beginPath()

  linePoints.forEach(point => {
    ctx.lineTo(point.x, point.y)
  })
  ctx.closePath()
  ctx.fillStyle = background
  ctx.fill()
}

export default wall
