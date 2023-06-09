import "./style.css"
import {createScoreBoard, updateScore, createHungerMeter, hungerCounter} from "./metrics"
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
export let rows = 10
export let columns = 10
export let currentScore = 0
export let [snake, currentDirection] = spawnSnakeRandomly(3, columns, rows)
export let board: HTMLElement = app
export let apple: Coord = spawnAppleRandomly(columns, rows, snake)
export let isGameActive: boolean = false

// Function: create start button
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

// Function: create board
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

// Function: draw a snake
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

// Function: draw an apple
function drawApple() {
  // remove existing apple
  const oldApple = document.querySelector(".apple-cube")
  oldApple?.classList.toggle("apple-cube")
  // generate a new apple & draw it
  const [xRange, yRange] = spawnAppleRandomly(columns, rows, snake)
  const appleDiv = document.getElementById(`${xRange}-${yRange}`) as HTMLElement
  appleDiv?.classList.add("apple-cube")
  apple = [xRange, yRange]
}

export function gameOver() {
  // remove key controls and switch to false
  document.removeEventListener("keydown", activateSnake)
  isGameActive = false
  // show gameover message
  const gameoverMsg = createGameEndMsg()
  gameoverMsg.showModal()
}

// Function: Reset
function resetGame() {
  // clear any existing board, score, and popup
  document.querySelector(".board")?.remove()
  document.getElementById("score-board")?.remove()
  document.getElementById("hunger-meter")?.remove()
  document.getElementById("gameover-dialog")?.remove()
  // respawn the snake
  const result = spawnSnakeRandomly(3, columns, rows)
  snake = result[0]
  currentDirection = result[1]
}

// Function: move the snake
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
      Math.random() < 0.2
    ) {
      drawApple()
    }
    if (newHead.every((val, idx) => val === apple[idx])) {
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
      console.log("left")
      break
    }
    case "ArrowRight": {
      if (currentDirection === "left") return
      currentDirection = "right"
      console.log("right")
      break
    }
    case "ArrowUp": {
      if (currentDirection === "down") return
      currentDirection = "up"

      console.log("up")
      break
    }
    case "ArrowDown": {
      if (currentDirection === "up") return
      currentDirection = "down"
      console.log("down")
      break
    }
    default: {
      return
    }
  }
  // Comment it to turn off moving loop
  if (!isGameActive) {
    isGameActive = true
    hungerCounter()
    movingLoop()
  }
  // Uncomment it to switch to turn on manual move
  // moveSnake(currentDirection)
}

// Function: move snake constantly using setInterval()
// function keepMovingSnake() {
//   // clear any previous internal (PS. setInterval() keeps running even if you remove the event listener)
//   clearInterval(internvalId)
//   internvalId = setInterval(function () {
//     if (isGameActive) {
//       moveSnake(currentDirection)
//     }
//   }, 200)
// }

function movingLoop() {
  moveSnake(currentDirection)
  var speed = 200 - (snake.length * 10 > 140 ? 140 : snake.length * 10)
  if (isGameActive) {
    console.log(speed)
    setTimeout(movingLoop, speed)
  }
}

function initGame() {
  board = createBoard()
  drawSnake(board)
  createScoreBoard()
  createHungerMeter()
  drawApple()
  console.log("check init:", snake, apple)
  document.addEventListener("keydown", activateSnake)
}

// Function: Gameover Popup
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
