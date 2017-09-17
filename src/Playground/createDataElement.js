import {
  CIRCLE,
  RECTANGLE,
  DEFAULT_AUDIO
} from '../constants'
import { playground } from '../config'

const randomWidth = () => Math.random() * 20 + 10
const randomColor = () => "#"+((1<<24)*Math.random()/8|0).toString(16)
export const createDataElement = type => ({
  x = Math.random() * playground.width,
  y = Math.random() * playground.height,
  radius = type === RECTANGLE ? undefined : randomWidth(),
  width = type === CIRCLE ? undefined : randomWidth() * 2,
  height = type === CIRCLE ? undefined : randomWidth() * 2,
  background = randomColor(),
  audio = DEFAULT_AUDIO,
  // PERFORMANCE!!! shadowOffsetY = SHADOW_MARGIN-7,
  // PERFORMANCE!!! shadowBlur = 30,
  deleted = false,
  shakingTime = null,
  ...props,
}) => {
  const customProperties = (
    type === CIRCLE
      ? { radius }
    : type === RECTANGLE
      ? { height, width }
    : {}
  )
  return{
    type,
    x,
    y,
    background,
    audio,
    deleted,
    shakingTime,
    ...props,
    ...customProperties,
  }
}

export const createDataElements = (counts, type, config) => (
  Array(counts).fill(0).map(item => (
    createDataElement(type)(config)
  ))
)