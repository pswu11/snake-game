import "./snake.css"
import {
  spawnAppleRandomly,
  spawnSnakeRandomly,
  drawPixel,
  clearSnake,
  isOnWall,
  isOnSnake,
  clearBoard,
} from "./utils"
import { createInfoPanel } from "./scores"

// global
export type Coord = [number, number]
export type Direction = "left" | "right" | "up" | "down"
export const app = document.getElementById("app") as HTMLElement

// board & game elements
export const [columns, rows] = [20, 20]
export const initSnakeSize = 3
export const directionalChange = {
  left: [-1, 0],
  right: [1, 0],
  down: [0, 1],
  up: [0, -1],
}
const initSnakeSpeed = 300
const snakeColor = "#31784c"
const appleColor = "#ae0505"
export let [snake, currentDirection]: [Coord[], Direction] = spawnSnakeRandomly(
  columns,
  rows
)
let apple: Coord = spawnAppleRandomly(columns, rows, snake)

// game control: event queue and moving loop
let isGameActive: boolean = false
let now: EpochTimeStamp
let then: EpochTimeStamp
let elapsed: EpochTimeStamp
let eventQueue: string[] = []
let newEvent: string
let nextEvent: string
let queueTrafficLight: boolean = true

// draw board
function createBoard() {
  // create new board
  const board = document.createElement("canvas")
  board.classList.add("board")
  let viewportMinSize = Math.min(window.innerWidth, window.innerHeight)
  board.width = viewportMinSize * 0.7
  board.height = viewportMinSize * 0.7
  createInfoPanel()
  app.appendChild(board)
  return board
}

export const board = createBoard()
export const ctx = board.getContext("2d") as CanvasRenderingContext2D
export const pixelSize = board.width / columns

function drawSnake() {
  for (let [x, y] of snake) {
    drawPixel(x, y, snakeColor)
  }
}

function drawApple() {
  drawPixel(apple[0], apple[1], appleColor)
}

function moveSnake(direction: Direction) {
  const [cX, cY] = snake[0]
  const [dX, dY] = directionalChange[direction]
  const newHead = [cX + dX, cY + dY] as Coord
  if (isOnWall(newHead, columns, rows) || isOnSnake(newHead, snake)) {
    gameOver()
  } else {
    clearSnake()
    snake.pop()
    snake.unshift(newHead)
    drawSnake()
  }
}

function gameLoop() {
  now = Date.now() // 10
  // console.log("gameloop started: ", now, isGameActive, queueTrafficLight)
  elapsed = now - then // 10 - 5 = 5
  const speed =
    initSnakeSpeed - (snake.length * 10 > 140 ? 140 : snake.length * 10)
  drawSnake()
  drawApple()
  // check when can we process the next event
  if (queueTrafficLight) {
    queueTrafficLight = false
    nextEvent = eventQueue[0]
    changeDirection(nextEvent)
    eventQueue.shift()
  }
  // check whether we should the snake based on its speed
  if (elapsed > speed) {
    moveSnake(currentDirection)
    queueTrafficLight = true
    then = now
  }
  if (isGameActive) {
    setTimeout(gameLoop, 1)
  }
}

function changeDirection(eventKey: string) {
  console.log(eventKey)
  switch (eventKey) {
    case "ArrowLeft": {
      if (currentDirection === "right") return
      currentDirection = "left"
      break
    }
    case "ArrowRight": {
      if (currentDirection === "left") return
      currentDirection = "right"
      break
    }
    case "ArrowUp": {
      if (currentDirection === "down") return
      currentDirection = "up"
      break
    }
    case "ArrowDown": {
      if (currentDirection === "up") return
      currentDirection = "down"
      break
    }
    default: {
      return
    }
  }
}

const handleArrowKey = (event: KeyboardEvent) => {
  newEvent = event.key
  eventQueue.push(newEvent)
}

function activateSnake() {
  document.addEventListener("keydown", handleArrowKey)
}

function createGameEndMsg() {
  const endMsg = document.createElement("dialog")
  const text = document.createElement("p")
  const button = document.createElement("button")
  endMsg.id = "gameover-dialog"
  text.textContent = "Gameover!!!"
  button.textContent = "Restart"
  endMsg.append(text)
  endMsg.append(button)
  app.append(endMsg)
  // click on button to restart
  button.addEventListener("click", () => {
    endMsg.remove()
    clearBoard()
    const newSnake = spawnSnakeRandomly(columns, rows)
    snake = newSnake[0]
    currentDirection = newSnake[1]
    apple = spawnAppleRandomly(columns, rows, snake)
    init()
  })
  return endMsg
}

function removeAllKeyDownListener() {
  document.removeEventListener("keydown", handleSpaceKey)
  document.removeEventListener("keydown", handleArrowKey)
  console.log("removed!")
}

function gameOver() {
  removeAllKeyDownListener()
  isGameActive = false
  const gameoverMsg = createGameEndMsg()
  gameoverMsg.showModal()
}

const handleSpaceKey = (event: KeyboardEvent) => {
  console.log("event listner added!")
  if (event.key === " ") {
    if (!isGameActive) {
      isGameActive = true
      then = Date.now()
      activateSnake()
      gameLoop()
    } else {
      isGameActive = false
    }
  }
}

function init() {
  drawSnake()
  drawApple()
  // console.log("init", isGameActive, queueTrafficLight)
  document.addEventListener("keydown", handleSpaceKey)
  console.log("added event listener")
}

init()
