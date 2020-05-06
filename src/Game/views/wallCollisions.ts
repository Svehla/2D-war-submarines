import { Angle, View, getRelativePosByAbsPos } from '../engine/mathCalc'
import { GameElementType, Polygon } from '../gameElementTypes'
import { getElementCollisionsElements } from '../engine/collisionsHelper'

type Props = {
  view: View
  polygon: Polygon
  collisionRadius: number
}

const wallCollisions = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, collisionRadius, polygon } = props
  const points = polygon.points
  const relativePoints = points.map(point => getRelativePosByAbsPos(view, point))

  const colElements = getElementCollisionsElements({ points: relativePoints }, collisionRadius)

  colElements.forEach(el => {
    switch (el.type) {
      case GameElementType.Polygon: {
        ctx.beginPath()

        el.points.forEach(point => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.fill()
        ctx.closePath()

        break
      }
      case GameElementType.Arc: {
        ctx.beginPath()
        ctx.arc(el.x, el.y, el.radius, Angle.toRadians(el.startAngle), Angle.toRadians(el.endAngle))
        ctx.lineTo(el.x, el.y)
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.fill()
        ctx.closePath()
        break
      }
      default:
        break
    }
  })
}

export default wallCollisions
