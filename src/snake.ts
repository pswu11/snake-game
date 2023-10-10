import "./snake.css"
import {
  spawnAppleRandomly,
  spawnSnakeRandomly,
  drawPixel,
  isOnWall,
  isOnSnake,
  clearBoard,
  clearPixel,
  clearApple,
} from "./utils"
import {
  createInfoPanel,
  increaseScore,
  currentScore,
  resetAllScores,
  reduceHunger,
  HungerLoop,
  addHighScores,
  createInstructionPanel,
} from "./scores"

// global
export type Coord = [number, number]
export type Direction = "left" | "right" | "up" | "down"
export const app = document.getElementById("app") as HTMLElement

// board & game elements
export let board: HTMLCanvasElement
export let ctx: CanvasRenderingContext2D
export let pixelSize: number
export const [columns, rows] = [20, 20]
export const initSnakeSize = 3
export const directionalChange = {
  left: [-1, 0],
  right: [1, 0],
  down: [0, 1],
  up: [0, -1],
}
const initSnakeSpeed = 200
const snakeColor = "#31784c"
const appleColor = "#ae0505"
export let [snake, currentDirection]: [Coord[], Direction] = spawnSnakeRandomly(
  columns,
  rows
)
let apple: Coord = [0, 0]

// game control: event queue and moving loop
export let isGameActive: boolean = false
let now: EpochTimeStamp
let then: EpochTimeStamp
let elapsed: EpochTimeStamp
let eventQueue: string[] = []
let newEvent: string
let nextEvent: string
let queueTrafficLight: boolean = true

// player
let playerName: string


// add start scence
function addStartScene(): HTMLElement {
  const playerNameForm = document.createElement("form")
  const startBtn = document.createElement("button")
  playerNameForm.id = "player-name-form"
  playerNameForm.innerHTML = `
  <div class="form-row">
  <label>Player name: </label>
  <input type="text" id="player-name" name="player-name" maxlength="20" required/>
  </div>
  `
  startBtn.id = "start-btn"
  startBtn.textContent = "Start game"
  playerNameForm.appendChild(startBtn)
  app.appendChild(playerNameForm)
  playerNameForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault()
      const myForm = event.target as HTMLFormElement
      const formData = new FormData(myForm)
      playerName = formData.get("player-name") as string
      console.log("Current player: ", playerName)
      playerNameForm.remove()
      startBtn.remove()
      init()
    },
    { once: true }
  )
  return startBtn
}

// draw board
function createBoard() {
  const canvasBoard = document.querySelector("canvas")
  if (!canvasBoard) {
      // create new board
    const newBoard = document.createElement("canvas")
    newBoard.classList.add("board")
    let viewportMinSize = Math.min(window.innerWidth, window.innerHeight)
    newBoard.width = viewportMinSize * 0.7
    newBoard.height = viewportMinSize * 0.7
    createInfoPanel()
    createInstructionPanel()
    app.appendChild(newBoard)
    return newBoard
  }
  return canvasBoard
}

function drawSnake(rate: number = 1) {
  for (let [x, y] of snake) {
    drawPixel(x * rate, y * rate, snakeColor)
  }
}

function drawApple() {
  clearApple(apple)
  apple = spawnAppleRandomly(columns, rows, snake)
  drawPixel(apple[0], apple[1], appleColor)
}

function moveSnake(direction: Direction) {
  const [cX, cY] = snake[0]
  const [dX, dY] = directionalChange[direction]
  const newHead = [cX + dX, cY + dY] as Coord
  snake.unshift(newHead)
  if (isOnWall(newHead, columns, rows) || isOnSnake(newHead, snake.slice(1))) {
    gameOver()
  } else {
    if (
      newHead.every((val, idx) => Math.abs(val - apple[idx]) <= 2) &&
      Math.random() < 0.15
    ) {
      drawApple()
    }
    if (newHead.every((val, idx) => val === apple[idx])) {
      increaseScore(1)
      reduceHunger(-3)
      drawApple()
    } else {
      const [tX, tY] = snake.pop() as Coord
      clearPixel(tX, tY)
    }
  }
}

function gameLoop() {
  now = Date.now() // 10
  elapsed = now - then // 10 - 5 = 5
  const speed =
    initSnakeSpeed - (currentScore * 10 > 140 ? 140 : currentScore * 10)
  drawSnake()
  // check when can we process the next event
  if (queueTrafficLight) {
    queueTrafficLight = false
    nextEvent = eventQueue[0]
    changeDirection(nextEvent)
    eventQueue.shift()
  }
  // check whether we should draw the snake based on its speed
  if (elapsed > speed) {
    moveSnake(currentDirection)
    queueTrafficLight = true
    then = now
  }

  if (elapsed > 1000) {
    reduceHunger(1)
  }

  if (isGameActive) {
    setTimeout(gameLoop, 1)
  }
}

function changeDirection(eventKey: string) {
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
  const restartBtn = document.createElement("button")
  const checkScoresBtn = document.createElement("button")
  endMsg.id = "gameover-dialog"
  text.textContent = `
  Gameover! 
  Your Score: ${currentScore}
  `
  restartBtn.textContent = "Restart"
  checkScoresBtn.textContent = "High Scores"
  endMsg.append(text)
  endMsg.append(restartBtn)
  // endMsg.append(checkScoresBtn)
  app.append(endMsg)
  // click on button to restart
  restartBtn.addEventListener("click", () => {
    endMsg.remove()
    clearBoard()
    const newSnake = spawnSnakeRandomly(columns, rows)
    snake = newSnake[0]
    currentDirection = newSnake[1]
    apple = spawnAppleRandomly(columns, rows, snake)
    init()
  })
  checkScoresBtn.id = "check-scores-btn"
  checkScoresBtn.addEventListener("click", () => {
    app.querySelectorAll(":not(#heading)").forEach((el) => el.remove())
    addHighScores()
  })
  return endMsg
}

function removeAllKeyDownListener() {
  document.removeEventListener("keydown", handleSpaceKey)
  document.removeEventListener("keydown", handleArrowKey)
  console.log("removed!")
}

export function gameOver() {
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
      HungerLoop()
      gameLoop()
    } else {
      isGameActive = false
    }
  }
}

function init() {
  board = createBoard()
  ctx = board.getContext("2d") as CanvasRenderingContext2D
  pixelSize = board.width / columns
  drawSnake()
  drawApple()
  resetAllScores()
  document.addEventListener("keydown", handleSpaceKey)
  console.log("added event listener")
}

addStartScene()
