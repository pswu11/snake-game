import { Id, Coord, Direction } from "./main"

export const directionalChange = {
  left: [-1, 0],
  right: [1, 0],
  down: [0, 1],
  up: [0, -1],
}

export function idToCoord(id: Id): Coord {
  return id.split("-").map((x) => parseInt(x)) as Coord
}

export function coordToId([x, y]: Coord): Id {
  return `${x}-${y}`
}

export function isOnSnake(cube: Coord, snake: Coord[]) {
  return snake.some((coord) => coord.every((val, idx) => val === cube[idx]))
}

export function isOnWall([x, y]: Coord, columns: number, rows: number) {
  return x >= columns || x < 0 || y >= rows || y < 0
}

export function genRandomCoordInArea(colmin: number, colmax: number, rowmin: number, rowmax: number): Coord {
  const [x, y] = [Math.floor(Math.random()* (colmax - colmin + 1) + colmin), Math.floor(Math.random() * (rowmax - rowmin + 1) + rowmin)]
  return [x, y]
}

// Spawn

export function spawnAppleRandomly(columns: number, rows: number, snake: Coord[]) {
  let newApple = genRandomCoordInArea(0, columns-1, 0, rows-1)
  if (isOnSnake(newApple, snake)) {
    newApple = spawnAppleRandomly(columns, rows, snake)
  }
  return newApple
}

export function spawnSnakeRandomly(initSnakeLength: number, columns: number, rows: number): [Coord[], Direction] {
  const newSnake: Coord[] = []
  let [x, y] = genRandomCoordInArea(initSnakeLength, columns - initSnakeLength, initSnakeLength,rows - initSnakeLength)
  newSnake.push([x, y])
  const allDirections: Direction[] = ["left", "right", "up", "down"]
  const spawnDirection = allDirections[Math.floor(Math.random() * 4)]
  for (let i = 0; i < initSnakeLength - 1; i++) {
    x -= directionalChange[spawnDirection][0]
    y -= directionalChange[spawnDirection][1]
    newSnake.push([x, y])
  }
  return [newSnake, spawnDirection]
}

