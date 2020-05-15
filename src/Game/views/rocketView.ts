import { CameraRotation, GameElementRocket, View } from '../engine/gameElementTypes'
import { RADAR_VISIBLE_DELAY } from '../gameSetup'
import { getRelativePosByAbsPos, normalizeInto01 } from '../engine/mathCalc'
import { rotatePoint } from '../engine/rotation'

type Props = {
  view: View
  rocket: GameElementRocket
  cameraRotation: CameraRotation
}

const rocketView = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, rocket, cameraRotation } = props

  const opacity = normalizeInto01(rocket.seenByRadar, 0, RADAR_VISIBLE_DELAY)

  const point = rotatePoint(rocket, cameraRotation.point, cameraRotation.angle)
  const { x, y } = getRelativePosByAbsPos(view, { x: point.x, y: point.y })

  ctx.beginPath()
  ctx.globalAlpha = opacity
  ctx.arc(x, y, rocket.radius, 0, 2 * Math.PI)
  ctx.fillStyle = rocket.background
  ctx.fill()
  ctx.fillStyle = rocket.background
  ctx.fill()
  ctx.closePath()
  ctx.globalAlpha = 1
}

export default rocketView
