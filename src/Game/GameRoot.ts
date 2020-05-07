import './engine/rayCasting'
import { Angle, View, calcNewRadarRotation, isInView } from './engine/mathCalc'
import { GameElement, GameElementType, Line, MeElementType, Radar } from './gameElementTypes'
import { RADAR_VISIBLE_DELAY, gameElements, getView, playground } from './gameSetup'
import { calculateNewObjPos } from './engine/userMove'
import { getRayCastCollisions } from './engine/rayCasting'
import { isCircleGameElementCollision } from './engine/collisions'
import { isMobile } from '../utils'
import playgroundGrid from './views/playgroundView'

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
        return item?.deleted ? false : isInView(view, item)
    }
  })(),
})

/**
 * base class for handling whole game state & logic
 */
const RADAR_SECTOR_ANGLE = 30
class GameRoot {
  static getGameState() {
    const view = getView()
    return {
      me: {
        type: GameElementType.Circle,
        x: 100,
        y: 100,
        radius: isMobile ? 60 : 60,
        background: '#559',
        maxSpeedPerSecond: isMobile ? 125 : 250,
      } as MeElementType,
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
        startAngle: 0,
        endAngle: RADAR_SECTOR_ANGLE,
        radius: 480,
      } as Radar,
      rayCastRays: [] as Line[],
    }
  }

  /**
   * i don't care about immutability
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

  public handleResize = () => {
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
    this.frameId = requestAnimationFrame(this._tick)
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
    this._gameState.radar.startAngle = newRadarRotationAngle
    this._gameState.radar.endAngle = Angle.add(newRadarRotationAngle, RADAR_SECTOR_ANGLE)

    // borders
    this._gameState.playground.walls = this._gameState.playground.walls.map(item =>
      addViewProperty(item, this._gameState.view)
    )

    // check collisions
    const updatedGameElements = this._gameState.gameElements
      // add max speed threshold around the view
      .map(item => addViewProperty(item, this._gameState.view))
      .map(item => {
        if (item.deleted) {
          return item
        }
        if (!item.visibleInView) {
          return item
        }
        if (isCircleGameElementCollision(this._gameState.me, item)) {
          return { ...item, deleted: true }
        }
        return item
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
        radius: this._gameState.radar.radius,
        startAngle: this._gameState.radar.startAngle,
        endAngle: this._gameState.radar.endAngle,
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
      alert("Can't init the game")
      return
    }

    const s = this._gameState

    playgroundGrid(this._ctx, {
      view: s.view,
      gameElements: s.gameElements,
      me: s.me,
      radar: s.radar,
      mousePos: s.mousePosition,
      rayCastRays: s.rayCastRays,
      playground: s.playground,
    })
  }
}

export default GameRoot
