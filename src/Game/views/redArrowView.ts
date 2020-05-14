import { View } from '../engine/gameElementTypes'

type Props = {
  view: View
}

const redArrowView = (ctx: CanvasRenderingContext2D, { view }: Props) => {
  ctx.beginPath()
  // my vision angle
  // direction arrow
  const points = [
    { x: view.width / 2, y: view.height / 2 },
    { x: view.width / 2, y: view.height / 2 - 100 },
    { x: view.width / 2 - 20, y: view.height / 2 - 90 },
    { x: view.width / 2, y: view.height / 2 - 100 },
    { x: view.width / 2 + 20, y: view.height / 2 - 90 },
  ]
  //
  points.forEach(point => {
    ctx.lineTo(point.x, point.y)
  })
  ctx.strokeStyle = '#F0F'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.closePath()
}

export default redArrowView
