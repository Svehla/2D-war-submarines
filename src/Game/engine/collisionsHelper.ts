import { GameCollisionsEl, GameElementType, Line, Polygon } from '../gameElementTypes'
import { getAngleBetweenPoints } from '../engine/mathCalc'
import { getLineVec, getNormalVec, toUnitVec, multiplyVec } from '../engine/vec'
import { getLinesFromPoints, getPointsFromLines } from '../engine/line'
import { shiftLine } from '../engine/line'

// move to utils
const moveLastItemToHead = <T>(arr: T[]) => {
  const size = arr.length
  if (size === 0) {
    return []
  }
  const lastItem = arr[arr.length - 1]
  return [
    lastItem,
    // remove last item from arr
    ...arr.slice(0, size - 1),
  ]
}

// todo: add docs
// todo: does not work for triangles :( (odd count of lines??? i guess???)
export const getElementCollisionsElements = (pol: Polygon, colSize: number): GameCollisionsEl[] => {
  const points = pol.points

  const polygonLines = getLinesFromPoints(points)
  const shiftedCollisionsLines: Line[] = polygonLines.map(line => {
    const lVec = getNormalVec(getLineVec(line))
    const shiftVec = multiplyVec(toUnitVec(lVec), colSize)
    return shiftLine(line, shiftVec)
  })

  // get lines for edges
  const shiftedLines = moveLastItemToHead(getPointsFromLines(shiftedCollisionsLines))
  // filter un-edges/corner (every second) line
  const cornerLines = getLinesFromPoints(shiftedLines).filter((_, i) => 0 === i % 2)

  // console.log(arcRadius)
  // for each point -> there is corner and polygon with collisions
  // @ts-ignore
  return points
    .map((point, index) => {
      const line = cornerLines[index]
      return [
        {
          x: point.x,
          y: point.y,
          type: GameElementType.Arc,
          startAngle: getAngleBetweenPoints(point, { x: line.x1, y: line.y1 }),
          endAngle: getAngleBetweenPoints(point, { x: line.x2, y: line.y2 }),
          radius: colSize,
        },
        {
          type: GameElementType.Polygon,
          // magic trick how to do 2times more lines :D
          // have to known outer and inner line for getting normal vector
          baseLine: polygonLines[index],
          points: [
            {
              x: shiftedCollisionsLines[index].x1,
              y: shiftedCollisionsLines[index].y1,
            },
            {
              x: shiftedCollisionsLines[index].x2,
              y: shiftedCollisionsLines[index].y2,
            },
            {
              x: polygonLines[index].x2,
              y: polygonLines[index].y2,
            },
            {
              x: polygonLines[index].x1,
              y: polygonLines[index].y1,
            },
          ],
        },
      ]
    })
    .flat()
}
