import { Angle } from './angle'
import { GameCollisionsElement, GameElementType, Line, Polygon } from './gameElementTypes'
import { getLineVec, getNormalVec, multiplyVec, toUnitVec } from '../engine/vec'
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
// TODO: does not work if points are in the bad order
export const getWallCollisionElements = (
  pol: Polygon,
  colRadius: number
): GameCollisionsElement[] => {
  const points = pol.points

  const polygonLines = getLinesFromPoints(points)
  const shiftedCollisionsLines: Line[] = polygonLines.map(line => {
    const lVec = getNormalVec(getLineVec(line))
    const shiftVec = multiplyVec(toUnitVec(lVec), colRadius)
    return shiftLine(line, shiftVec)
  })

  // get lines for edges
  const shiftedLines = moveLastItemToHead(getPointsFromLines(shiftedCollisionsLines))
  // filter un-edges/corner (every second) line
  const cornerLines = getLinesFromPoints(shiftedLines).filter((_, i) => 0 === i % 2)

  // for each point -> there is corner and polygon with collisions
  return points.flatMap((point, index) => {
    const line = cornerLines[index]
    return [
      {
        x: point.x,
        y: point.y,
        type: GameElementType.Arc,
        startAngle: Angle.getAngleBetweenPoints(point, { x: line.s.x, y: line.s.y }),
        endAngle: Angle.getAngleBetweenPoints(point, { x: line.e.x, y: line.e.y }),
        radius: colRadius,
      },
      {
        type: GameElementType.Polygon,
        // magic trick how to do 2times more lines :D
        // have to known outer and inner line for getting normal vector
        // todo: should be read only -> coz of duplicit definition (or add proper method for getting normal Vec)
        baseLine: polygonLines[index],
        points: [
          {
            x: shiftedCollisionsLines[index].s.x,
            y: shiftedCollisionsLines[index].s.y,
          },
          {
            x: shiftedCollisionsLines[index].e.x,
            y: shiftedCollisionsLines[index].e.y,
          },
          {
            x: polygonLines[index].e.x,
            y: polygonLines[index].e.y,
          },
          {
            x: polygonLines[index].s.x,
            y: polygonLines[index].s.y,
          },
        ],
      },
    ]
  })
}
