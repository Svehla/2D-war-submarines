import { CameraRotation, GameElementFood, GameElementType, View } from '../engine/gameElementTypes'
import { RADAR_VISIBLE_DELAY } from '../gameSetup'
import { getRelativePosByAbsPos, normalizeInto01 } from '../engine/mathCalc'
import { rotatePoint, rotateRectangle } from '../engine/rotation'

type Props = {
  element: GameElementFood
  view: View
  cameraRotation: CameraRotation
}

const gameElementView = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { element, view, cameraRotation } = props

  const opacity = normalizeInto01(element.seenByRadar, 0, RADAR_VISIBLE_DELAY)

  switch (element.type) {
    case GameElementType.Rectangle:
      const poly = rotateRectangle(element, cameraRotation.point, cameraRotation.angle)

      ctx.beginPath()
      ctx.globalAlpha = opacity
      poly.points.forEach(point => {
        const { x, y } = getRelativePosByAbsPos(view, { x: point.x, y: point.y })
        ctx.lineTo(x, y)
      })
      ctx.fillStyle = element.background
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
      break
    case GameElementType.Circle: {
      const rotatedCircle = rotatePoint(element, cameraRotation.point, cameraRotation.angle)

      ctx.beginPath()
      ctx.globalAlpha = opacity
      const { x, y } = getRelativePosByAbsPos(view, rotatedCircle)
      ctx.arc(x, y, element.radius, 0, 2 * Math.PI)
      ctx.fillStyle = element.background
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
      break
    }
  }
}

export default gameElementView
