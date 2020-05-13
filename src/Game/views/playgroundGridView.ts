import { GameElementFood, Line, MeElementType, Radar } from '../engine/gameElementTypes'
import { View } from '../engine/mathCalc'
import { playground } from '../gameSetup'
import borderGrid from './borderGridView'
import gameElementView from './gameElementView'
import meView from './meView'
import rayCastView from './rayCastView'
import wall from './wallView'

type Props = {
  view: View
  gameElements: GameElementFood[]
  me: MeElementType
  radar: Radar
  rayCastRays: Line[]
  playground: typeof playground
}

const playgroundGrid = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, gameElements, me, rayCastRays, playground } = props
  const { rotationAngle } = me
  const rotationPoint = { x: me.x, y: me.y }

  // clear screen
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  // rotation view
  const cameraRotation = {
    point: rotationPoint,
    angle: rotationAngle,
  }

  borderGrid(ctx, {
    view: view,
    cameraRotation,
  })

  meView(ctx, { view, me })
  rayCastView(ctx, { cameraRotation, view, rays: rayCastRays })

  playground.walls.forEach(
    wallEl =>
      wallEl.visibleInView &&
      wall(ctx, { cameraRotation, collisionSize: me.radius, view, wall: wallEl })
  )

  gameElements.forEach(
    gameElement =>
      gameElement.visibleInView &&
      gameElement.seenByRadar > 0 &&
      !gameElement.deleted &&
      gameElementView(ctx, { cameraRotation, view, element: gameElement })
  )
}

export default playgroundGrid
