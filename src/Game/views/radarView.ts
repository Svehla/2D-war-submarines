import { Angle } from '../engine/mathCalc'
import { Radar } from '../gameElementTypes'
import { View } from '../engine/mathCalc'

type Props = {
  view: View
  radar: Radar
}

const radarView = (ctx: CanvasRenderingContext2D, { view, radar }: Props) => {
  const x = view.width / 2
  const y = view.height / 2
  ctx.beginPath()

  ctx.arc(
    x,
    y,
    radar.radius,
    Angle.toRadians(radar.rotation - 40),
    Angle.toRadians(radar.rotation - 40 + radar.sectorAngle + 40)
  )
  ctx.lineTo(x, y)
  const grd = ctx.createLinearGradient(view.width / 2, view.height / 2, 100, 100)
  grd.addColorStop(0, 'rgba(0,255,0,0.05)')
  grd.addColorStop(0.94, 'rgba(0,0,255,0.2)')
  ctx.fillStyle = grd
  ctx.fill()
}

export default radarView
