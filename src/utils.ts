import {
  Coord,
  Direction,
  initSnakeSize,
  board,
  ctx,
  pixelSize,
  snake,
  directionalChange,
} from "./snake"

// canvas

export function clearBoard() {
  ctx.clearRect(0, 0, board.width, board.height)
}

export function drawPixel(x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
}

export function drawPixelHalf(x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize * 0.5, pixelSize * 0.5)
}

export function clearPixel(x: number, y: number) {
  ctx.clearRect(x * pixelSize - 1, y * pixelSize -1 , pixelSize + 2, pixelSize + 2)
}

export function clearSnake() {
  for (let [x, y] of snake) {
    ctx.clearRect(
      x * pixelSize -1,
      y * pixelSize -1,
      pixelSize + 2,
      pixelSize + 2
    )
  }
}

export function clearApple(coord: Coord) {
  clearPixel(coord[0], coord[1])
}

// snake

export function isOnSnake(cube: Coord, snake: Coord[]) {
  return snake.some((coord) => coord.every((val, idx) => val === cube[idx]))
}

export function isOnWall([x, y]: Coord, columns: number, rows: number) {
  return x >= columns || x < 0 || y >= rows || y < 0
}

export function genRandomCoordInArea(
  colmin: number,
  colmax: number,
  rowmin: number,
  rowmax: number
): Coord {
  const [x, y] = [
    Math.floor(Math.random() * (colmax - colmin + 1) + colmin),
    Math.floor(Math.random() * (rowmax - rowmin + 1) + rowmin),
  ]
  return [x, y]
}

// Spawn

export function spawnAppleRandomly(
  columns: number,
  rows: number,
  snake: Coord[]
) {
  let newApple = genRandomCoordInArea(0, columns - 1, 0, rows - 1)
  if (isOnSnake(newApple, snake)) {
    newApple = spawnAppleRandomly(columns, rows, snake)
  }
  return newApple
}

export function spawnSnakeRandomly(
  columns: number,
  rows: number
): [Coord[], Direction] {
  const newSnake: Coord[] = []
  let [x, y] = genRandomCoordInArea(
    initSnakeSize,
    columns - initSnakeSize,
    initSnakeSize,
    rows - initSnakeSize
  )
  newSnake.push([x, y])
  const allDirections: Direction[] = ["left", "right", "up", "down"]
  const spawnDirection = allDirections[Math.floor(Math.random() * 4)]
  for (let i = 0; i < initSnakeSize - 1; i++) {
    x -= directionalChange[spawnDirection][0]
    y -= directionalChange[spawnDirection][1]
    newSnake.push([x, y])
  }
  return [newSnake, spawnDirection]
}
