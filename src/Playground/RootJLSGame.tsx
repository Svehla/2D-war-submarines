import './rayCasting'
import {
  DrumType,
  RADAR_VISIBLE_DELAY,
  gameElements,
  getView,
  initSoundsConf,
  playground,
} from '../config'
import { GameElementShape } from './createGameElements'
import { GameElementType, Line, Point, Radar } from './gameElementTypes'
import { KonvaEventObject } from 'konva/types/Node'
import { PlayAudioConf, pauseSound, playAudio } from '../audio/audio'
import {
  View,
  calcNewRadarRotation,
  calculateNewObjPos,
  decreaseBy1ToZero,
  getInRange,
  isInView,
} from './mathCalc'
import { getRayCastCollisions } from './rayCasting'
import { isArcRectCollision, isTwoElementCollision } from './collisions'
import { isMobile } from '../utils'
import JLSMainLogo from '../img/JLSMainLogo.jpg'
import Playground from './Playground'
import React from 'react'

const addViewProperty = <T extends { deleted: boolean }>(item: T, view: View) => ({
  ...item,
  visibleOnView: item.deleted
    ? false // performance optimisation
    : isInView(view, item as any),
})

const addArcViewProperty = (radar: Radar, viewer: Point, item: GameElementShape) => ({
  ...item,
  isSeenByRadar:
    item.deleted || !item.visibleOnView
      ? false
      : isArcRectCollision(
          {
            x: viewer.x,
            y: viewer.y,
            sectorAngle: radar.sectorAngle,
            startAngle: radar.rotation,
            radius: radar.radius,
          },
          item as any
        ),
})
//
const view = getView()

const getGameState = () => ({
  me: {
    bandName: 'jake-loves-space',
    // absolute coordinations
    x: view.leftX + view.width / 2,
    y: view.topY + view.height / 2,
    // relative coordinations
    xRel: view.width / 2,
    yRel: view.height / 2,
    type: GameElementType.Circle as GameElementType,
    radius: isMobile ? 60 : 90,
    backgroundImage: JLSMainLogo,
    fillPatternScale: isMobile ? { x: 0.66, y: 0.66 } : { x: 1, y: 1 },
    fillPatternOffset: { x: -100, y: 100 },
    shadowOffsetX: 20,
    shadowOffsetY: 25,
    shadowBlur: 40,
    background: '#F0F',
    maxSpeedPerSecond: isMobile ? 125 : 250,
  },
  cameraShakeIntensity: 0,
  playground,
  view: getView(),
  actualDrum: null as null | Promise<AudioBufferSourceNode>,
  gameElements: gameElements,
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
    sectorAngle: 20,
    radius: 500,
  } as Radar,
  rayCast: {
    rays: [] as Line[],
  },
})

/**
 *
 * base Component for handling game logic
 */
class RootJLSGame extends React.Component<{}> {
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
  _gameState = getGameState()
  _highResTimestamp = 0
  /**
   * this is used for: `request animation frame`
   *
   * inspiration:
   * > https://gist.github.com/jacob-beltran/aa114af1b6fd5de866aa365e3763a90b
   */
  _frameId = 0

  componentDidMount() {
    // does not work on ios devices:
    // > https://medium.com/flawless-app-stories/how-to-request-device-motion-and-orientation-permission-in-ios-13-74fc9d6cd140
    // https://github.com/aframevr/aframe/issues/3976
    window.addEventListener('deviceorientation', this.handleOrientation)
    window.addEventListener('mousemove', this.handleMouseMove)

    // init infinite gameLoop
    this._frameId = requestAnimationFrame(this.tick)

    // setup music for background
    this._gameState.actualDrum = this.play('fastDrum', initSoundsConf.fastDrum)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._frameId)
    window.removeEventListener('deviceorientation', this.handleOrientation)
    window.removeEventListener('mousemove', this.handleMouseMove)
  }

  // --------------------------
  // ---- event listeners -----
  // --------------------------

  // beta (`up` and `down`) (y)
  // gama (`left` and `right`) (x)
  // todo: does not work on new ios phones (security `feature` i guess)
  handleOrientation = ({ beta, gamma }: DeviceOrientationEvent) => {
    if (!beta || !gamma) {
      return
    }
    // TODO: move this logic out of component to util file
    const { width, height } = this._gameState.view
    // angle only {angleForMax} deg for 90pos
    const angleForMax = 20
    const gammaRatio = getInRange(gamma / angleForMax)
    const betaRatio = getInRange(beta / angleForMax)
    const xPlayGroundRelPos = (gammaRatio * width) / 2
    const yPlayGroundRelPos = (betaRatio * height) / 2
    const x = xPlayGroundRelPos + this._gameState.me.xRel
    const y = yPlayGroundRelPos + this._gameState.me.yRel

    this._gameState.mousePosition = { x, y }
  }

  handleMouseMove = (e: MouseEvent) => {
    const x = e.pageX
    const y = e.pageY
    this._gameState.mousePosition = { x, y }
  }

  handleBandClick = (bandName: string) => {
    this._gameState.me.bandName = bandName
  }

  // support of mobile devices
  handlePlaygroundMove = (e: KonvaEventObject<Event>) => {
    // @ts-ignore
    const { x, y } = e.target.getStage().getPointerPosition()
    this._gameState.mousePosition = { x, y }
  }

  // --------------------------
  // --------- others --------
  // --------------------------

  // audio middleware
  play = (audioName: string, config: PlayAudioConf = {}) => {
    const playConfig = {
      ...config,
      volume: config.volume || this._gameState.volume,
    }
    return playAudio(audioName, playConfig)
  }

  tick = (highResTimestamp: number) => {
    const timeSinceLastTick = highResTimestamp - this._highResTimestamp
    this._highResTimestamp = highResTimestamp

    this.recalculateGameLoopState(timeSinceLastTick)
    // let rerender react app
    // TODO: is react efficient way for app like this? what about pure canvas+konva?
    this.setState({})

    this._frameId = requestAnimationFrame(this.tick)
  }

  stopDrumAndGetNew = (drumName: DrumType): Promise<AudioBufferSourceNode> => {
    // make async call inside of sync fn (should refactor it somehow?)
    ;(async () => {
      if (this._gameState.actualDrum) {
        const currDrum = await this._gameState.actualDrum
        pauseSound(currDrum)
      }
    })()

    // todo: create new structure for saving audio data
    return this.play(drumName, initSoundsConf[drumName])
  }

  recalculateGameLoopState = (timeSinceLastTick: number) => {
    const { me, mousePosition, playground, cameraShakeIntensity, view } = this._gameState
    const { x, y } = calculateNewObjPos(mousePosition, me, timeSinceLastTick, playground, {
      cameraShakeIntensity,
    })

    const newRadarRotationAngle = calcNewRadarRotation()
    let newCameraShakeIntensity = cameraShakeIntensity
    let newDrum: any | null = null

    // update static tick stuffs (radar & view & my position)
    this._gameState = {
      ...this._gameState,
      me: { ...me, x, y },
      view: {
        ...this._gameState.view,
        leftX: x - this._gameState.view.width / 2,
        topY: y - this._gameState.view.height / 2,
      },
      radar: {
        ...this._gameState.radar,
        rotation: newRadarRotationAngle,
      },
    }

    // check collisions
    const updatedGameElements = this._gameState.gameElements
      .map(item => addViewProperty(item, view))
      // todo: outdated value of radar (one frame out -> change order of setting values)
      // todo: does it make sense for implemented rayCasting?
      .map(item => addArcViewProperty(this._gameState.radar, me, item as any))
      .map(item => {
        if (item.deleted) {
          return item
        }
        // todo: does it make sense for implemented rayCasting?
        // if (item.isSeenByRadar) {
        //   item.seenByRadar = RADAR_VISIBLE_DELAY
        // }
        // I don't want to calculate collisions of items out of `view`
        if (!item.visibleOnView) {
          return item
        }

        // is not in collision -> just return and ignore next code..
        // @ts-ignore
        if (!isTwoElementCollision(me, item)) {
          return item
        }

        // > <> <> <> <> <> <> <> <> <> <> <
        // unpure shitty side effect while you
        // eat some new game object (aka collision is happened)
        // > <> <> <> <> <> <> <> <> <> <> <
        if (item.shakingTime) {
          newDrum = this.stopDrumAndGetNew('slowDrum')
          // @ts-ignore
          // increment shaking intensity by each ate object
          newCameraShakeIntensity += item.shakingTime
        }

        // @ts-ignore
        this.play(
          newCameraShakeIntensity === 0
            ? item.audio
            : // for shaking camera use only slow zero sounds
              'slowZero'
        )
        return { ...item, deleted: true }
      })

    if (newCameraShakeIntensity === 1) {
      newDrum = this.stopDrumAndGetNew('fastDrum')
    }

    this._gameState.gameElements = updatedGameElements.map(item => ({
      ...item,
      seenByRadar: item.seenByRadar > 0 ? item.seenByRadar - timeSinceLastTick : 0,
    }))
    this._gameState.cameraShakeIntensity = decreaseBy1ToZero(newCameraShakeIntensity)

    if (newDrum) {
      this._gameState.actualDrum = newDrum
    }

    const visibleGameElements = this._gameState.gameElements.filter(
      // todo: radar does not detect elements correctly (it checks points, not shapes)
      e => e.visibleOnView && !e.deleted // && e.seenByRadar > 0
    )

    this._gameState.rayCast.rays = getRayCastCollisions(
      this._gameState.radar,
      this._gameState.me,
      visibleGameElements as any
    )

    // make radar elements collisions visible
    this._gameState.rayCast.rays.forEach(r => {
      // @ts-ignore
      const id = r.elementMatchedId
      if (!id) return
      const el = this._gameState.gameElements.find(({ id: elId }) => elId === id)
      // mutable shiiiiitttty code
      // @ts-ignore
      el.seenByRadar = RADAR_VISIBLE_DELAY
    })
  }

  render() {
    return (
      <Playground
        view={this._gameState.view}
        gameElements={this._gameState.gameElements}
        me={this._gameState.me}
        radar={this._gameState.radar}
        cameraShakeIntensity={this._gameState.cameraShakeIntensity}
        mousePos={this._gameState.mousePosition}
        handlePlaygroundMove={this.handlePlaygroundMove}
        handleBandClick={this.handleBandClick}
        rayCast={this._gameState.rayCast}
      />
    )
  }
}

export default RootJLSGame
