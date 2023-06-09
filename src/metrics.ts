import { app, currentScore, gameOver } from "./main"

export let currentHunger = 6

// Function: add score board
export function createScoreBoard() {
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
  app.appendChild(scoreBoard)
}

// Function: update score
export function updateScore() {
  const scoreElement = document.getElementById(
    "score-board-score"
  ) as HTMLElement
  scoreElement.textContent = currentScore.toString()
}

// Function: create hunger meter
export function createHungerMeter() {
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
  app.appendChild(hungerMeter)
}


// Function: update hunger
export function updateHunger() {
  const hungerElement = document.getElementById(
    "hunger-meter-score"
  ) as HTMLElement
  hungerElement.textContent = currentHunger.toString()
}

export function hungerCounter() {
  currentHunger--
  updateHunger()
  if (currentHunger === 0) {
    gameOver()
    currentHunger = 10
  }
  setTimeout(hungerCounter, 1000)
}