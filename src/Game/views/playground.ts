import { Circle, GameElementFood, Line, Point, Radar } from '../gameElementTypes'
import { View } from '../engine/mathCalc'
import { playground } from '../gameSetup'
import borderGrid from './borderGrid'
import meView from './me'
import mousePosCircle from './mousePosCircle'
import radarView from './radarView'
import rayCast from './rayCast'
import renderGameElement from './gameElement'
import wallView from './wall'

type Props = {
  view: View
  gameElements: GameElementFood[]
  me: Circle & { playground: string }
  handlePlaygroundMove: (e: any) => void
  radar: Radar
  mousePos: Point
  rayCastRays: Line[]
  playground: typeof playground
}

const playgroundGrid = (ctx: CanvasRenderingContext2D, props: Props) => {
  const { view, gameElements, me, radar, mousePos, rayCastRays, playground } = props

  // clear screen
  // playground or canvas ref
  ctx.clearRect(0, 0, playground.width, playground.height)

  // have to be first to render coz of translations
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
    wall => wall.visibleInView && wallView(ctx, { view, ...wall })
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
