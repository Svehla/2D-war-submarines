import { Point } from '../engine/gameElementTypes'

type Props = {
  mousePos: Point
}

const mousePosCircle = (ctx: CanvasRenderingContext2D, { mousePos }: Props) => {
  ctx.beginPath()
  ctx.arc(mousePos.x, mousePos.y, 5, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.fillStyle = 'red'
  ctx.fill()
}

export default mousePosCircle
