import "./style.css"
import {
  coordToId,
  directionalChange,
  isOnSnake,
  isOnWall,
  spawnAppleRandomly,
  spawnSnakeRandomly,
} from "./utils"

// Types
export type Coord = [number, number]
export type Id = `${number}-${number}`
export type Direction = "left" | "right" | "up" | "down"
export const app = document.getElementById("app") as HTMLElement
export const initSnakeSize = 3
export const initScore = 0
export const initHunger = 30
export const appleRespawnChance = 0.15
export let rows = 20
export let columns = 20
export let [snake, currentDirection] = spawnSnakeRandomly(columns, rows)
export let board: HTMLElement = app
export let apple: Coord = spawnAppleRandomly(columns, rows, snake)
export let isGameActive: boolean = false
export let currentHunger = initHunger
export let currentScore = initScore

// create start button
function addStartScene(): HTMLElement {
  const startBtn = document.createElement("button")
  startBtn.id = "start-btn"
  startBtn.textContent = "Start game"
  app.appendChild(startBtn)
  startBtn.addEventListener(
    "click",
    () => {
      startBtn.remove()
      initGame()
    },
    { once: true }
  )
  return startBtn
}

// create board
function createBoard() {
  // create new board
  const board = document.createElement("div")
  board.classList.add("board")
  app.appendChild(board)
  // set grid size dynamically
  board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
  // generate cubes dynamically
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const cube = document.createElement("div")
      cube.id = `${j}-${i}`
      cube.classList.add("cube")
      board.appendChild(cube)
    }
  }
  return board
}

// add score board
function createScoreBoard() {
  const scoreBoard = document.createElement("div")
  const text = document.createElement("div")
  const score = document.createElement("div")
  scoreBoard.id = "score-board"
  text.id = "score-board-text"
  score.id = "score-board-score"
  text.textContent = "Score: "
  score.textContent = currentScore.toString()
  scoreBoard.appendChild(text)
  scoreBoard.appendChild(score)
  return scoreBoard
}

// create hunger meter
function createHungerMeter() {
  const hungerMeter = document.createElement("div")
  const text = document.createElement("div")
  const score = document.createElement("div")
  hungerMeter.id = "hunger-meter"
  text.id = "hunger-meter-text"
  score.id = "hunger-meter-score"
  text.textContent = "Hunger: "
  score.textContent = currentHunger.toString()
  hungerMeter.appendChild(text)
  hungerMeter.appendChild(score)
  return hungerMeter
}

// wrap the game info panel
function createInfoPanel() {
  const panel = document.createElement("div")
  panel.id = "gameInfoPanel"
  app.appendChild(panel)
  const hungerEl = createHungerMeter()
  const scoreEl = createScoreBoard()
  panel.appendChild(hungerEl)
  panel.appendChild(scoreEl)

}

// update score
function updateScore() {
  const scoreElement = document.getElementById(
    "score-board-score"
  ) as HTMLElement
  scoreElement.textContent = currentScore.toString()
}


// update hunger
function updateHunger() {
  const hungerElement = document.getElementById(
    "hunger-meter-score"
  ) as HTMLElement
  hungerElement.textContent = currentHunger.toString()
}

// draw a snake
function drawSnake(board: HTMLElement) {
  const cubes = [...board.children]
  cubes.forEach((cube) => {
    cube.classList.remove("snake-cube")
  })
  snake.forEach((coord, idx) => {
    const id = coordToId(coord)
    const cube = document.getElementById(id) as HTMLElement
    if (idx === 0) {
      cube.classList.add("snake-head")
    } else {
      cube.classList.remove("snake-head")
      cube.classList.add("snake-cube")
    }
  })
}

// draw an apple
function drawApple() {
  // remove existing apple
  const oldApple = document.querySelector(".apple-cube")
  oldApple?.classList.toggle("apple-cube")
  // generate a new apple
  const [xRange, yRange] = spawnAppleRandomly(columns, rows, snake)
  const appleDiv = document.getElementById(`${xRange}-${yRange}`) as HTMLElement
  appleDiv?.classList.add("apple-cube")
  apple = [xRange, yRange]
}

export function gameOver() {
  // remove key controls and switch to false
  document.removeEventListener("keydown", activateSnake)
  isGameActive = false
  const gameoverMsg = createGameEndMsg()
  gameoverMsg.showModal()
}

// reset: remove all the previous elements and values
function resetGame() {
  // clear any existing board, score, and popup
  document.querySelector(".board")?.remove()
  document.getElementById("score-board")?.remove()
  document.getElementById("hunger-meter")?.remove()
  document.getElementById("gameover-dialog")?.remove()
  // reset scores and hunger
  currentHunger = initHunger
  currentScore = initScore
  // respawn the snake
  const result = spawnSnakeRandomly(columns, rows)
  snake = result[0]
  currentDirection = result[1]
}

// move snake for one step
function moveSnake(direction: Direction) {
  const [XcurrentHead, YcurrentHead] = snake[0]
  const [dX, dY] = directionalChange[direction]
  const newHead = [XcurrentHead + dX, YcurrentHead + dY] as Coord
  snake.unshift(newHead)
  if (isOnWall(newHead, columns, rows) || isOnSnake(newHead, snake.slice(1))) {
    gameOver()
  } else {
    // the apple disappears at a chance when you're getting closer
    if (
      newHead.every((val, idx) => Math.abs(val - apple[idx]) <= 2) &&
      Math.random() < appleRespawnChance
    ) {
      drawApple()
    }
    if (newHead.every((val, idx) => val === apple[idx])) {
      currentHunger += 3
      updateHunger()
      currentScore += 1
      updateScore()
      apple = spawnAppleRandomly(columns, rows, snake)
      drawApple()
    } else {
      snake.pop()
    }
    drawSnake(board)
  }
}

function activateSnake(event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowLeft": {
      if (currentDirection === "right") return
      currentDirection = "left"
      // console.log("left")
      break
    }
    case "ArrowRight": {
      if (currentDirection === "left") return
      currentDirection = "right"
      // console.log("right")
      break
    }
    case "ArrowUp": {
      if (currentDirection === "down") return
      currentDirection = "up"
      // console.log("up")
      break
    }
    case "ArrowDown": {
      if (currentDirection === "up") return
      currentDirection = "down"
      // console.log("down")
      break
    }
    default: {
      return
    }
  }
  if (!isGameActive) {
    isGameActive = true
    movingLoop()
    HungerLoop()
  }
  // Manual move:
  // moveSnake(currentDirection)
}

function HungerLoop() {
  currentHunger -= 1
  updateHunger()
  if (currentHunger === 0) {
    gameOver()
    return
  }
  if (isGameActive) {
    setTimeout(HungerLoop, 1000)
  }
}

function movingLoop() {
  moveSnake(currentDirection)
  var speed = 200 - (snake.length * 10 > 140 ? 140 : snake.length * 10)
  if (isGameActive) {
    // console.log(speed)
    setTimeout(movingLoop, speed)
  }
}

function initGame() {
  board = createBoard()
  drawSnake(board)
  createInfoPanel()
  drawApple()
  document.addEventListener("keydown", activateSnake)
}

// Gameover Popup
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
  button.addEventListener(
    "click",
    () => {
      resetGame()
      addStartScene()
    },
    { once: true }
  )
  return endMsg
}

addStartScene()
