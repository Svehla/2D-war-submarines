import { GameElementFood, Line, MeElementType, Point, Radar } from '../engine/gameElementTypes'
import { View } from '../engine/mathCalc'
import { playground } from '../gameSetup'
import borderGrid from './borderGridView'
import meView from './meView'
import mousePosCircle from './mousePosCircleView'
import radarView from './radarView'
import rayCast from './rayCastView'
import renderGameElement from './gameElementView'
import wall from './wallView'

type Props = {
  view: View
  gameElements: GameElementFood[]
  me: MeElementType
  radar: Radar
  mousePos: Point
  rayCastRays: Line[]
  playground: typeof playground
}

const playgroundGrid = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, gameElements, me, radar, mousePos, rayCastRays, playground } = props

  // clear screen
  ctx.clearRect(0, 0, playground.width, playground.height)

  borderGrid(ctx, {
    view: view,
    isDark: false,
  })

  // @ts-ignore
  meView(ctx, { view: view, me })
  radarView(ctx, { view: view, radar: radar })
  rayCast(ctx, { view: view, rays: rayCastRays })

  playground.walls.forEach(
    // @ts-ignore
    wallEl => wallEl.visibleInView && wall(ctx, { collisionSize: me.radius, view, wall: wallEl })
  )

  gameElements.forEach(
    gameElement =>
      gameElement.visibleInView &&
      gameElement.seenByRadar > 0 &&
      !gameElement.deleted &&
      // @ts-ignore
      renderGameElement(ctx, { view, element: gameElement })
  )

  mousePosCircle(ctx, { mousePos })
}

export default playgroundGrid
