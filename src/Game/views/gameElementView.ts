import { GameElementFood, GameElementType } from '../gameElementTypes'
import { RADAR_VISIBLE_DELAY } from '../gameSetup'
import { View, getRelativePosByAbsPos, normalizeInto01 } from '../engine/mathCalc'

type Props = {
  element: GameElementFood
  view: View
}

// does not support images yet
const gameElement = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { element, view } = props

  const { x, y } = getRelativePosByAbsPos(view, { x: element.x, y: element.y })
  const opacity = normalizeInto01(element.seenByRadar, 0, RADAR_VISIBLE_DELAY)

  switch (element.type) {
    case GameElementType.Rectangle:
      ctx.beginPath()
      ctx.globalAlpha = opacity
      ctx.rect(x, y, element.width, element.height)
      ctx.fillStyle = element.background
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
      break
    case GameElementType.Circle: {
      ctx.beginPath()
      ctx.globalAlpha = opacity
      ctx.arc(x, y, element.radius, 0, 2 * Math.PI)
      ctx.fillStyle = element.background
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
      break
      // throw new Error('TODO: implement element rendering')
    }
  }
}

export default gameElement
