import { GameElementRocket } from './gameElementTypes'

export const calcNewRocketsPos = (rockets: GameElementRocket[], timeSinceLastTick: number) => {
  return rockets.map(({ x, y, ...rest }) => ({
    ...rest,
    x: x - rest.direction.x * (rest.secSpeed / timeSinceLastTick),
    y: y - rest.direction.y * (rest.secSpeed / timeSinceLastTick),
  }))
}
