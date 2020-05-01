import { Angle } from '../engine/mathCalc'
import { Line, Point, Polygon } from '../gameElementTypes'

// use http://asciiflow.com/ for generating maps
const map1 = `
+---------------------------------------------------------------------+
|                                                                     |
|      +---+                                                          |
|      |   |                                                          |
|      |   |                                                          |
|      +---+                                    ++                    |
|              +---+                            ||                    |
|              |   |    +------+                ||                    |
|              +---+    |      |                ||                    |
|                       +------+                ||                    |
|                                              +---+                  |
|                                           +-------+                 |
|                                          +--------|                 |
|                                     +-------------|                 |
|            +----+                   +-------------+                 |
|            |    |                                                   |
|            |    |                                                   |
|            |    |                                                   |
|            |    |                                                   |
|            +----+                                                   |
|                                                                     |
|                                  +--------------------+             |
|            XX                    +--------------------+             |
|       +----XXXX------+                                              |
|       |              |                                              |
|       +--------------+                                              |
|                                                                     |
|                                                                     |
+---------------------------------------------------------------------+

`

const generateMapFromAsciiArt = (asciiArt: string): Polygon[] => {
  const gameWalls = []

  const lines = asciiArt.split('\n').filter(Boolean)

  // remove borders from ascii art
  const gameContent = lines
    .map(line =>
      // remove first and last letter
      line.substring(1).slice(0, -1)
    )
    // remove first and last line
    .slice(1)
    .slice(0, -1)

  const usedPoints = Array.from({ length: gameContent.length }, () =>
    Array.from({ length: gameContent[0].length })
  )
  console.log(usedPoints)
  let emptyPrevious = true
  for (let i = 0; i < gameContent.length; i++) {
    const line = gameContent[i]
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === ' ') {
        emptyPrevious = true
      } else {
        if (usedPoints[i][j]) {
          // already snapghosed -> so ignore
        } else {
          usedPoints[i][j] = 'used rofl'
          if (emptyPrevious) {
            console.log('add new element')
            emptyPrevious = false
          }
          console.log(char)
        }
      }
    }
  }
  return []
}

// generateMapFromAsciiArt(map1)

/**
 * omg
 */
const get3x3MatrixAroundPoint = ({ x, y }: Point, text: string) => {
  const lines = text.split('\n').filter(Boolean)

  const textWithSpaces = [' '.repeat(lines[0].length), ...lines, ' '.repeat(lines[0].length)]
    .map(line => line.split(''))
    .map(line => [' ', ...line, ' '])

  // console.log(textWithSpaces)

  // todo: fix right and bottom max collisions
  return [textWithSpaces[y], textWithSpaces[y + 1], textWithSpaces[y + 2]].map(row =>
    row.slice(x, x + 3)
  )
}

// console.log(
//   get3x3MatrixAroundPoint(
//     { x: 4, y: 3 },
//     `
// xxx
//  x xx
//  x   x
//  xxxxx
// `
//   )
// )

/**
 *
 * priority table:
 * _____________
 * | 8 | 1 | 5 |
 * -------------
 * | 4 | P | 2 |
 * _____________
 * | 7 | 3 | 6 |
 * -------------
 * legend:
 * P: your current point
 * @param matrix3x3
 * for example:
 * ```
 *  xx
 * x
 * x
 *
 * ```
 */
const getNextPointsByPriority = (matrix3x3: string[][]): Point[] => {
  const m = matrix3x3.map((row, yIndex) =>
    row.map((col, xIndex) => ({
      x: xIndex,
      y: yIndex,
      char: col,
    }))
  )
  const pointsByPriority = [
    // like docs
    m[0][1],
    m[1][2],
    m[2][1],
    m[1][0],
    m[0][2],
    m[2][2],
    m[2][0],
    m[0][0],
  ].filter(({ char }) => char !== ' ')
  return pointsByPriority
}
// console.log(
//   getNextPointsByPriority([
//     [' ', ' ', 'x'],
//     [' ', ' ', 'x'],
//     [' ', ' ', 'x'],
//   ])
// )

// todo: simplify lines -> now is each char one line
// + add is in view for each line (tooo much canvas drawing)
// => or i can filter it in the component by the view size
export const getLinesFromShape = (shape: string, startPoint: Point): Polygon => {
  const lines = shape.split('\n').filter(Boolean)

  const linesWithIndexes = lines.map((line, y) =>
    line.split('').map((char, x) => ({
      x,
      y,
      char,
    }))
  )

  const points: Point[] = []
  // TODO: find first point
  // const firstPoint = linesWithIndexes[0][linesWithIndexes[0].findIndex(p => p.char !== ' ')]
  const firstPoint = linesWithIndexes[startPoint.y][startPoint.x]
  // console.log(linesWithIndexes)
  // console.log(firstPoint)

  points.push(firstPoint)
  let currPoint = firstPoint
  let lol = 0
  // lol just for bad programmers
  // dont want to have heap overflow
  while (lol < 10000) {
    // recalculate relative coordinations to absolute
    const nextPointRelativeCoord = getNextPointsByPriority(
      get3x3MatrixAroundPoint(currPoint, shape)
    )
    const nextPointAbsoluteCoords = nextPointRelativeCoord.map(p => ({
      ...p,
      x: p.x + currPoint.x - 1,
      y: p.y + currPoint.y - 1,
    }))
    // filter used points
    const unusedPoints = nextPointAbsoluteCoords.filter(
      // find if point was used
      p => points.find(po => po.x === p.x && po.y === p.y) === undefined
    )

    if (unusedPoints.length === 0) {
      // console.log('end')
      lol = Infinity
    } else {
      // todo: check if point is used
      // @ts-ignore
      currPoint = unusedPoints[0]
      points.push(currPoint)
    }
    lol++
  }

  return { points }
}

/*
const res = getLinesFromShape(
  `
  XXXXXXXXXXX2XX                                |
XXX             XXXXXXX                         |
XX      XXX            X                        |
 XXXXXXX  XXX         X                         |
             X        XXX                       |
           XX            1XX       XXX          |
      XXXXXX                XXXX   X  XX        |
  XXXXX                        XXX2     3       |
  X                                      X      |
  XXX                                   X       |
     XXX                            XXXX        |
        XXXXXXXXXXXXXXXXXXXXXXXXXXXX            |
                                                +
`,

  {
    x: 4,
    y: 0,
  }

  // @ts-ignore
).map(({ x, y }) => ({ x: 400 + x * 10, y: 400 + y * 10 }))
*/
// console.log(JSON.stringify(res, null, 2))
