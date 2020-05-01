import { View, getRelativePosByAbsPos } from '../mathCalc'
import { playground } from '../gameSetup'
import gridImage from '../img/grid.png'
import gridReverseImage from '../img/grid-reverse.png'

const playgroundCoords = {
  x: 0,
  y: 0,
}

type Props = {
  view: View
  isDark: boolean
}

// shitty load
// TODO: fix it with local state for loading per instance
let lightImageLoaded = false
const lightImg = new Image()
lightImg.src = gridImage
lightImg.onload = function () {
  lightImageLoaded = true
}
let darkImageLoaded = false
const darkImg = new Image()
darkImg.src = gridReverseImage
darkImg.onload = function () {
  darkImageLoaded = true
}

// singleton... shitty behavior coz of img
// fill bg with pattern instead of img???
const borderGrid = (ctx: CanvasRenderingContext2D, { view, isDark }: Props) => {
  const { x, y } = getRelativePosByAbsPos(view, playgroundCoords)

  // make backend looks like static image and move elements and camera on in
  ctx.translate(x, y)
  // todo: draw pattern instead of load img
  if (!lightImageLoaded || !darkImageLoaded) return
  const pattern = ctx.createPattern(isDark ? darkImg : lightImg, 'repeat')
  ctx.fillStyle = pattern!
  ctx.fillRect(0, 0, playground.width, playground.height)
  // return canvas translate back to previous value
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export default borderGrid
