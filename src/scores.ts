import { app } from "./snake"

const initScore: number = 0
const initHunger: number = 20
let currentScore = initScore
let currentHunger = initHunger

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
export function createInfoPanel() {
  const panel = document.createElement("div")
  panel.id = "game-info-panel"
  app.appendChild(panel)
  const hungerEl = createHungerMeter()
  const scoreEl = createScoreBoard()
  panel.appendChild(hungerEl)
  panel.appendChild(scoreEl)

}

// update score
export function updateScore() {
  const scoreElement = document.getElementById(
    "score-board-score"
  ) as HTMLElement
  scoreElement.textContent = currentScore.toString()
}

// update hunger
export function updateHunger() {
  const hungerElement = document.getElementById(
    "hunger-meter-score"
  ) as HTMLElement
  hungerElement.textContent = currentHunger.toString()
}