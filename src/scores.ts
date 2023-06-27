import { app, gameOver, isGameActive } from "./snake"
import axios from 'axios'

type Score = {
  id: number;
  user: string;
  score: number;
}

// scores
const initScore: number = 0
const initHunger: number = 30
export let currentScore = initScore
export let currentHunger = initHunger


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

// increase score 
export function increaseScore(score: number = 1) {
  currentScore += score
  updateScore()
}

// reduce hunger
export function reduceHunger(score: number = 1) {
  currentHunger -= score
  updateHunger()
}

export function resetAllScores() {
  currentScore = initScore
  currentHunger = initHunger
  updateHunger()
  updateScore()
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

export function HungerLoop() {
  reduceHunger()
  if (currentHunger === 0) {
    gameOver()
    return
  }
  if (isGameActive) {
    setTimeout(HungerLoop, 1000)
  }
}

// high scores

// add new score record
export async function updateHighScores(newScore: Omit<Score, "id">) {
  const response = await axios.post("http://localhost:3000/scores", {
    ...newScore
  })
  return response
}


// fetch scores from json server
export async function fetchHighScores() {
  const response = await axios.get("http://localhost:3000/scores")
  return response.data
}

// TODO: sort scores
function sortScores(scores: Score[]) {
  const sortedScores = scores.sort((a, b) => a.score < b.score ? 1 : -1)
  return sortedScores
}


// display scores on the board
export async function addHighScores() {
  const highScores = document.createElement("div")
  highScores.id = "highscore-board"
  const scores = sortScores(await fetchHighScores() as Score[])
  console.log(scores)
  scores.forEach(el => {
    const userName = document.createElement("span")
    const userScore = document.createElement("span")
    userName.classList.add("name")
    userScore.classList.add("score")
    userName.textContent = el.user
    userScore.textContent = el.score.toString()
    highScores.appendChild(userName)
    highScores.appendChild(userScore)
  })
  app.appendChild(highScores)
}

