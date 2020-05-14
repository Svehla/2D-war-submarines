import { Angle } from '../engine/angle'
import { Point, Radar, View } from '../engine/gameElementTypes'

type Props = {
  view: View
  radar: Radar
  rotationAngle: number
  rotationPoint: Point
}

const radarView = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, radar } = props
  const centerPoint = {
    x: view.width / 2,
    y: view.height / 2,
  }

  ctx.beginPath()

  ctx.arc(
    centerPoint.x,
    centerPoint.y,
    radar.radius,
    Angle.toRadians(radar.startAngle - 40),
    Angle.toRadians(radar.endAngle)
  )
  ctx.lineTo(centerPoint.x, centerPoint.y)
  const grd = ctx.createLinearGradient(view.width / 2, view.height / 2, 100, 100)
  grd.addColorStop(0, 'rgba(0,255,0,0.05)')
  grd.addColorStop(0.94, 'rgba(0,0,255,0.2)')
  ctx.fillStyle = grd
  ctx.fill()
}

export default radarView
