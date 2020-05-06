import './engine/rayCasting'
import { GameElement, GameElementType, Line, Radar } from './gameElementTypes'
import { RADAR_VISIBLE_DELAY, gameElements, getView, playground } from './gameSetup'
import { View, calcNewRadarRotation, calculateNewObjPos, isInView } from './engine/mathCalc'
import { getRayCastCollisions } from './engine/rayCasting'
import { isMobile } from '../utils'
import { isTwoElementCollision } from './engine/collisions'
import playgroundGrid from './views/playground'

// kinda shitty code
const addViewProperty = <T extends GameElement>(item: T, view: View): T => ({
  ...item,
  visibleInView: (() => {
    switch (item.type) {
      case GameElementType.Polygon:
        return isInView(view, item)
      case GameElementType.Circle:
        // @ts-ignore: typescript inheritance minus :|
        return item.deleted ? false : isInView(view, item)
      case GameElementType.Rectangle:
        // @ts-ignore: typescript inheritance minus :|
        return item.deleted ? false : isInView(view, item)
    }
  })(),
})

/**
 * base class for handling whole game state & logic
 */
class GameRoot {
  static getGameState() {
    const view = getView()
    return {
      me: {
        x: view.x + view.width / 2,
        y: view.y + view.height / 2,
        // constants => sign it somehow like final const
        type: GameElementType.Circle as GameElementType,
        // radius: 5,
        radius: isMobile ? 60 : 60,
        background: '#559',
        maxSpeedPerSecond: isMobile ? 125 : 250,
      } as const,
      playground,
      view: getView(),
      gameElements,
      authCode: '',
      volume: 0,
      mousePosition: {
        x: view.width / 2,
        y: view.height / 2,
      },
      // speed of radar is const by timestamp
      // ray cast is calculated from radar view
      radar: {
        // center coordination
        rotation: 0,
        sectorAngle: 30,
        radius: 480,
      } as Radar,
      rayCastRays: [] as Line[],
    }
  }

  /**
   * it's like React.ref
   *
   * don't want to rerender react app (aka change state)
   * while i catch event for mouse is moved -> i will wait till game loop will check it by itself
   *
   * i don't care about immutability
   *
   * I use this.state for triggering of render method -> its triggered by `requestAnimationFrame`
   */
  _gameState: ReturnType<typeof GameRoot.getGameState>
  _highResTimestamp = 0

  /**
   * this is used for: `request animation frame`
   *
   * inspiration:
   * > https://gist.github.com/jacob-beltran/aa114af1b6fd5de866aa365e3763a90b
   */
  frameId = 0
  _canvasRef: HTMLCanvasElement
  _ctx: CanvasRenderingContext2D

  constructor(_canvasRef: HTMLCanvasElement) {
    this._canvasRef = _canvasRef
    this._gameState = GameRoot.getGameState()
    this.frameId = requestAnimationFrame(this._tick)

    this._canvasRef.width = this._gameState.view.width
    this._canvasRef.height = this._gameState.view.height

    this._ctx = this._canvasRef.getContext('2d')!
  }

  // --------------------------
  // ---- event listeners -----
  // event listeners are not called directly but
  // via React wrapper coz of ES destructor missing
  // and react event handling
  // --------------------------

  public handleResize = (e: any) => {
    this._gameState.view.width = window.innerWidth
    this._gameState.view.height = window.innerHeight
    this._canvasRef.width = this._gameState.view.width
    this._canvasRef.height = this._gameState.view.height
  }
  // use for desktop support
  public handleMouseMove = (e: MouseEvent) => {
    const x = e.pageX
    const y = e.pageY
    this._gameState.mousePosition = { x, y }
  }

  // TODO: add mobile support
  public handlePlaygroundMove = (e: any) => {
    e.preventDefault()
    // TODO: add mobile support
    // const touch = e.touches[0]
    // const mouseEvent = new MouseEvent('mousemove', {
    //   clientX: touch.clientX,
    //   clientY: touch.clientY,
    // })
    // this._canvasRef.current?.dispatchEvent(mouseEvent)
    // @ts-ignore
    // const { x, y } = e.target.getStage().getPointerPosition()
    // this._gameState.mousePosition = { x, y }
  }

  // --------------------------
  // --------- others --------
  // --------------------------
  _tick = (highResTimestamp: number) => {
    const timeSinceLastTick = highResTimestamp - this._highResTimestamp
    this._highResTimestamp = highResTimestamp
    this._recalculateGameLoopState(timeSinceLastTick)
    this._draw()
    // setTimeout(() => {
    this.frameId = requestAnimationFrame(this._tick)
    // }, 200)
  }

  /**
   * this is heart of whole game
   * each actions is recalculated by each frame in this function
   */
  _recalculateGameLoopState = (timeSinceLastTick: number) => {
    // todo: does not work.....
    this._gameState.playground.walls = this._gameState.playground.walls.map(item =>
      addViewProperty(item, this._gameState.view)
    )
    // TODO: add border collisions (optimise it with addViewProperty)
    const { x, y } = calculateNewObjPos(
      this._gameState.mousePosition,
      this._gameState.view,
      this._gameState.me,
      timeSinceLastTick,
      this._gameState.playground
    )

    // update static tick stuffs (radar & view & my position)
    this._gameState = {
      ...this._gameState,
      me: { ...this._gameState.me, x, y },
      view: {
        ...this._gameState.view,
        x: x - this._gameState.view.width / 2,
        y: y - this._gameState.view.height / 2,
      },
    }

    const newRadarRotationAngle = calcNewRadarRotation()
    this._gameState.radar.rotation = newRadarRotationAngle

    // borders
    this._gameState.playground.walls = this._gameState.playground.walls.map(item =>
      addViewProperty(item, this._gameState.view)
    )

    // check collisions
    const updatedGameElements = this._gameState.gameElements
      // add max speed threshold around the view
      .map(item => addViewProperty(item, this._gameState.view))
      // todo: outdated value of radar (one frame out -> change order of setting values)
      // todo: does it make sense for implemented rayCasting?
      // .map(item => addArcViewProperty(this._gameState.radar, me, item as any))
      .map(item => {
        // @ts-ignore
        if (item.deleted) {
          return item
        }
        if (!item.visibleInView) {
          return item
        }
        // is not in collision -> just return and ignore next code..
        // @ts-ignore
        if (!isTwoElementCollision(this._gameState.me, item)) {
          return item
        }
        return { ...item, deleted: true }
      })

    this._gameState.gameElements = updatedGameElements.map(item => ({
      ...item,
      seenByRadar: item.seenByRadar > 0 ? item.seenByRadar - timeSinceLastTick : 0,
    }))

    const visibleGameElements = this._gameState.gameElements.filter(
      e => e.visibleInView && !e.deleted
    )

    const rayCastCollisions = getRayCastCollisions(
      {
        x: this._gameState.me.x,
        y: this._gameState.me.y,
        ...this._gameState.radar,
        startAngle: this._gameState.radar.rotation,
      },
      [...visibleGameElements, ...this._gameState.playground.walls]
    )

    // make radar elements collisions visible
    rayCastCollisions.forEach(r => {
      const id = r.collisionId
      const el = this._gameState.gameElements.find(({ id: elId }) => elId === id)
      if (el) {
        el.seenByRadar = RADAR_VISIBLE_DELAY
      }
    })
    this._gameState.rayCastRays = rayCastCollisions
  }

  _draw() {
    if (!this._ctx) {
      // console.log('cant initialize game')
      return
    }

    const s = this._gameState

    playgroundGrid(this._ctx, {
      view: s.view,
      gameElements: s.gameElements,
      // @ts-ignore
      me: s.me,
      radar: s.radar,
      mousePos: s.mousePosition,
      rayCastRays: s.rayCastRays,
      playground: s.playground,
    })
  }
}

export default GameRoot
