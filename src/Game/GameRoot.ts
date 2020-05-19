import './engine/rayCasting'
import { Angle } from './engine/angle'
import {
  GameElement,
  GameElementRocket,
  GameElementType,
  Line,
  MeElementType,
  Radar,
  View,
} from './engine/gameElementTypes'
import { RADAR_VISIBLE_DELAY, gameElements, getView, playground } from './gameSetup'
import { calcNewRadarRotation, isInView } from './engine/mathCalc'
import { calcNewRocketsPos } from './engine/rocketMove'
import { calculateNewObjPos } from './engine/userMove'
import { createGameRocketElement } from './createGameElements'
import { getRayCastCollisions } from './engine/rayCasting'
import { isCircleGameElementCollision } from './engine/collisions'
import { isMobile } from '../utils'
import { multiplyVec, subVec } from './engine/vec'
import playgroundGridView from './views/playgroundGridView'

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
        y: 1500,
        radius: isMobile ? 60 : 60,
        background: '#559',
        // TODO: what about add angle speed rotation
        maxSecSpeed: 150,
        rotationAngle: 0,
      } as MeElementType,
      playground,
      view: getView(),
      gameElements,
      authCode: '',
      volume: 0,
      mousePos: {
        x: view.width / 2,
        y: view.height / 2,
      },
      rockets: [] as GameElementRocket[],
      // speed of radar is const by timestamp
      // ray cast is calculated from radar view
      radar: {
        // center coordination
        startAngle: 0,
        endAngle: RADAR_SECTOR_ANGLE,
        radius: 700,
      } as Radar,
      rayCastRays: [] as Line[],
      camera: {
        angle: 45,
      },
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
    // todo: move it to react part
    window.addEventListener('click', this.handleMouseClick)
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

  public handleMouseClick = (e: MouseEvent) => {
    this._addGameRocket()
  }

  // use for desktop support
  public handleMouseMove = (e: MouseEvent) => {
    this._gameState.mousePos = { x: e.pageX, y: e.pageY }
  }

  _addGameRocket = () => {
    const directionVec = {
      x: Math.cos(Angle.toRadians(this._gameState.me.rotationAngle)),
      y: Math.sin(Angle.toRadians(this._gameState.me.rotationAngle)),
    }
    const pos = subVec(this._gameState.me, multiplyVec(directionVec, this._gameState.me.radius))
    const newRocket = createGameRocketElement({
      background: 'blue',
      x: pos.x,
      y: pos.y,
      // shitty inconsistent code
      direction: directionVec,
    })

    this._gameState.rockets.push(newRocket)
  }

  public handlePlaygroundMove = (e: any) => {
    e.preventDefault()
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
    // }, 500)
  }

  /**
   * this is heart of whole game
   * each actions is recalculated by each frame in this function
   */
  _recalculateGameLoopState = (timeSinceLastTick: number) => {
    // for more optimised calculations
    this._gameState.playground.walls = this._gameState.playground.walls.map(item =>
      addViewProperty(item, this._gameState.view)
    )

    const { x, y, rotationAngle } = calculateNewObjPos(
      this._gameState.mousePos,
      this._gameState.view,
      this._gameState.me,
      this._gameState.playground,
      timeSinceLastTick,
      this._gameState.camera.angle
    )

    // update static tick stuffs (radar & view & my position)
    this._gameState = {
      ...this._gameState,
      // me: { ...this._gameState.me, x, y },
      me: { ...this._gameState.me, x, y, rotationAngle },
      view: {
        ...this._gameState.view,
        // shift view by user move
        x: x - this._gameState.view.width / 2,
        y: y - this._gameState.view.height / 2,
      },
    }

    // camera
    // const an = Angle.getAngleBetweenPoints(
    //   {
    //     x: this._gameState.view.width / 2,
    //     // upper vector for camera fixing position
    //     y: this._gameState.view.height / 2,
    //   },
    //   this._gameState.mousePos
    // )
    // const anToTopVec = Angle.add(an, 90)

    // console.log('---')
    // console.log(this._gameState.camera.angle)
    // console.log(anToTopVec)

    // if (anToTopVec > 10) {
    //   // this._gameState.camera.angle = this._gameState.camera.angle + 0.1
    // }
    const moveAngle = this._gameState.me.rotationAngle
    const cameraAngle = this._gameState.camera.angle

    // TODO: add clock speeed
    if (moveAngle > cameraAngle) {
      // const newCameraAngle =
      this._gameState.camera.angle--
    } else {
      this._gameState.camera.angle++
    }

    // rockets
    const rockets = calcNewRocketsPos(this._gameState.rockets, timeSinceLastTick)
    this._gameState.rockets = rockets

    const newRadarRotationAngle = calcNewRadarRotation()
    this._gameState.radar.startAngle = newRadarRotationAngle
    this._gameState.radar.endAngle = Angle.add(newRadarRotationAngle, RADAR_SECTOR_ANGLE)

    // check collisions with food elements
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

    this._gameState.rockets = this._gameState.rockets.map(item => ({
      ...item,
      seenByRadar: item.seenByRadar > 0 ? item.seenByRadar - timeSinceLastTick : 0,
    }))

    this._gameState.gameElements = updatedGameElements.map(item => ({
      ...item,
      seenByRadar: item.seenByRadar > 0 ? item.seenByRadar - timeSinceLastTick : 0,
    }))

    const visibleGameElements = this._gameState.gameElements.filter(
      e => e.visibleInView && !e.deleted
    )

    const elementsToRayCol = [
      ...visibleGameElements,
      ...this._gameState.playground.walls,
      ...this._gameState.rockets,
    ]
    const rayCastCollisions = getRayCastCollisions(
      {
        x: this._gameState.me.x,
        y: this._gameState.me.y,
        radius: this._gameState.radar.radius,
        startAngle: this._gameState.radar.startAngle,
        endAngle: this._gameState.radar.endAngle,
      },
      elementsToRayCol
    )

    // make radar elements collisions visible
    rayCastCollisions.forEach(r => {
      const id = r.collisionId
      const el = [...visibleGameElements, ...this._gameState.rockets].find(
        ({ id: elId }) => elId === id
      )
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

    playgroundGridView(this._ctx, {
      view: s.view,
      gameElements: s.gameElements,
      me: s.me,
      radar: s.radar,
      rayCastRays: s.rayCastRays,
      playground: s.playground,
      rockets: s.rockets,
      camera: s.camera,
    })
  }
}

export default GameRoot
