import { isPointArcCollision } from './collisions'

describe('arc collisions', () => {
  const arc = {
    x: 10,
    y: 10,
    radius: 100,
    sectorAngle: 50,
    startAngle: 0,
  }
  it('collision with point', () => {
    expect(
      isPointArcCollision(arc, {
        x: 11,
        y: 11,
      })
    ).toEqual(true)

    expect(
      isPointArcCollision(arc, {
        x: -9,
        y: -5,
      })
    ).toEqual(false)
  })
})
