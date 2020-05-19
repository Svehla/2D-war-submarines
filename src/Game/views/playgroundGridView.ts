import {
  GameElementFood,
  GameElementRocket,
  Line,
  MeElementType,
  Radar,
  View,
} from '../engine/gameElementTypes'
import { playground } from '../gameSetup'
import borderGrid from './borderGridView'
import compassView from './compassView'
import gameElementView from './gameElementView'
import meView from './meView'
import rayCastView from './rayCastView'
import rocketView from './rocketView'
import wall from './wallView'

type Props = {
  view: View
  gameElements: GameElementFood[]
  me: MeElementType
  radar: Radar
  rayCastRays: Line[]
  playground: typeof playground
  rockets: GameElementRocket[]
  camera: { angle: number }
}

const playgroundGrid = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, camera, gameElements, me, rockets, rayCastRays, playground } = props
  const { rotationAngle } = me
  const rotationPoint = { x: me.x, y: me.y }

  // clear screen
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  // rotation view
  const cameraRotation = {
    point: rotationPoint,
    angle: camera.angle,
    // angle: rotationAngle,
  }

  borderGrid(ctx, {
    view: view,
    cameraRotation,
  })

  meView(ctx, { cameraRotation, view, me })
  // rayCastView(ctx, { cameraRotation, view, rays: rayCastRays })

  playground.walls.forEach(
    wallEl =>
      wallEl.visibleInView &&
      wall(ctx, { cameraRotation, collisionSize: me.radius, view, wall: wallEl })
  )

  rockets.forEach(
    rocketElement =>
      // rocketElement.visibleInView &&
      rocketElement.seenByRadar > 0 &&
      // !rocketElement.deleted &&
      rocketView(ctx, { cameraRotation, rocket: rocketElement, view })
  )

  // gameElements.forEach(
  //   gameElement =>
  //     gameElement.visibleInView &&
  //     gameElement.seenByRadar > 0 &&
  //     !gameElement.deleted &&
  //     gameElementView(ctx, { cameraRotation, view, element: gameElement })
  // )

  compassView(ctx, { cameraRotation, view })
}

export default playgroundGrid
