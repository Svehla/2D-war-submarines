import { CameraRotation } from '../engine/gameElementTypes'
import { View, getRelativePosByAbsPos } from '../engine/mathCalc'
import { playground } from '../gameSetup'
import { rotateRectangle } from '../engine/rotation'
// import gridImage from './img/grid.png'
// import gridReverseImage from './img/grid-reverse.png'

type Props = {
  view: View
  cameraRotation: CameraRotation
}

// // shitty load
// // TODO: fix it with local state for loading per instance
// let lightImageLoaded = false
// const lightImg = new Image()
// lightImg.src = gridImage
// lightImg.onload = function () {
//   lightImageLoaded = true
// }
// singleton... shitty behavior coz of img
// fill bg with pattern instead of img???
const borderGrid = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { cameraRotation, view } = props

  const poly = rotateRectangle(
    {
      x: 0,
      y: 0,
      width: playground.width,
      height: playground.height,
    },
    cameraRotation.point,
    cameraRotation.angle
  )

  ctx.beginPath()
  poly.points.forEach(point => {
    const { x, y } = getRelativePosByAbsPos(view, point)
    ctx.lineTo(x, y)
  })

  ctx.closePath()

  ctx.fillStyle = '#DDD'
  ctx.fill()
  ctx.strokeStyle = '#999'
  ctx.stroke()
  ctx.closePath()

  // ## bg image
  // // make backend looks like static image and move elements and camera on in
  // ctx.translate(x, y)
  // // todo: draw pattern instead of load img
  // if (!lightImageLoaded || !darkImageLoaded) return
  // const pattern = ctx.createPattern(lightImg, 'repeat')
  // ctx.fillStyle = pattern!
  // ctx.fillRect(0, 0, playground.width, playground.height)
  // // return canvas translate back to previous value
  // ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export default borderGrid
