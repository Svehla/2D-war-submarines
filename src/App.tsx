import './basicStyle.css'
import GameRootReactWrapper from './Game/GameRootReactWrapper'
import React from 'react'

// TODO: add styled components
const styles = {
  backgroundStyle: {
    width: '100%',
    height: '100%',
    background: '#fff',
  },
} as const

// react is there used for menus etc...
// but pure game is non react component
const App = () => (
  <div style={styles.backgroundStyle}>
    <GameRootReactWrapper />
  </div>
)

export default App
