import GameRoot from './GameRoot'
import React from 'react'

/**
 *
 * Basic react wrapper for non react application
 */
class GameRootReactWrapper extends React.Component<{}> {
  _canvasRef = React.createRef<HTMLCanvasElement>()
  _game: GameRoot | null = null

  componentDidMount() {
    if (!this._canvasRef.current) {
      alert('cant init game canvas')
      return
    }

    this._game = new GameRoot(this._canvasRef.current)
    window.addEventListener('mousemove', this._game.handleMouseMove)
    window.addEventListener('resize', this._game.handleResize)
  }

  componentWillUnmount() {
    if (!this._game) return
    // cancel game events
    cancelAnimationFrame(this._game.frameId)
    window.removeEventListener('mousemove', this._game.handleMouseMove)
    window.removeEventListener('resize', this._game.handleResize)
  }

  // render method is called only once for init of app
  render() {
    return (
      <canvas
        onTouchStart={this._game?.handlePlaygroundMove}
        onTouchMove={this._game?.handlePlaygroundMove}
        onTouchEnd={this._game?.handlePlaygroundMove}
        ref={this._canvasRef}
      />
    )
  }
}

export default GameRootReactWrapper
