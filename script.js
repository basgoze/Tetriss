/**
 * Created by ahmet.basgoze on 8/23/2023.
 */

//import { Tetromino } from 'tetromino.js';


const gameBoard = document.getElementById("game-board");

let ROWS = 20;
let COLS = 10;
let currentTetromino;
let nextTetromino;
let readyForDeployment = false;
let gameOver = false;

//    let tetrDeployed = false;

// Initialize the score
let score = 0;
const scoreElement = document.getElementById("score");

let lines = 0;
const linesElement = document.getElementById("lines");

let board = [];

// Initialize the game board with empty cells
for (let row = 0; row < ROWS; row++) {
    const newRow = Array(COLS).fill(0);
    board.push(newRow);
}

// Initialize the game board
for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        gameBoard.appendChild(cell);
    }
}


const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

// Function to render the next tetromino on the nextCanvas
function renderNextTetromino() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    const blockSize = nextCanvas.width / nextTetromino.shape[0].length;

    for (let row = 0; row < nextTetromino.shape.length; row++) {
        for (let col = 0; col < nextTetromino.shape[row].length; col++) {
            if (nextTetromino.shape[row][col] === 1) {
                nextCtx.fillStyle = "rgb(100, 100, 100)";
                nextCtx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
        }
    }
}


const tetrominos = [
    // Define various Tetromino shapes with rotations
    [[1, 1, 1, 1]],              // I
    [[1, 1, 1], [0, 1, 0]],     // T
    [[1, 1, 1], [1, 0, 0]],     // L
    [[1, 1, 1], [0, 0, 1]],     // J
    [[1, 1], [1, 1]],           // O
    [[1, 1, 0], [0, 1, 1]],     // S
    [[0, 1, 1], [1, 1, 0]],     // Z
];

function getRandomShape() {

    const randomIndex = Math.floor(Math.random() * tetrominos.length);
    return tetrominos[randomIndex];
}




document.addEventListener("keydown", (event) => {
    if(gameOver)
        return;
    if (event.key === "ArrowDown") {
    currentTetromino.moveDown();
} else if (event.key === "ArrowLeft") {
    currentTetromino.moveLeft();
} else if (event.key === "ArrowRight") {
    currentTetromino.moveRight();
} else if (event.key === "ArrowUp") {
    currentTetromino.rotate();
}  else if (event.key === "Enter") {
    for (let i=1;i<ROWS; i++) {
        readyForDeployment=true;
        currentTetromino.moveDown();
    }
}
updateGame();
});

function destroyRows() {
    const rowsToRemove = [];

    const cells = document.getElementsByClassName("cell");
    for (let row = 0; row < ROWS; row++) {
        let isFullRow = true;
        for (let col = 0; col < COLS; col++) {
            const cellIndex =  row * COLS +  col;
            if (!cells[cellIndex].classList.contains("passive")) {
                isFullRow = false;
                break;
            }
        }
        if (isFullRow) {
            rowsToRemove.push(row);
        }

    }

    // Animate and remove full rows
    for (const rowIndex of rowsToRemove) {
        animateRowRemoval(cells, rowIndex);
    }

    // After animation, remove the rows and shift down above rows
    setTimeout(() => {
        for (const rowIndex of rowsToRemove) {
            board.splice(rowIndex, 1);
            const newRow = Array(COLS).fill(0);
            board.unshift(newRow);
        }
        updateGameBoard();
    }, 500); // Adjust the animation duration as needed


    // Update the score based on the number of rows cleared
    const rowsCleared = rowsToRemove.length;
    if (rowsCleared > 0) {
        score += rowsCleared*rowsCleared * 100 ; // Adjust the scoring as needed
        lines += rowsCleared ; 
        updateScore();
    }

}

// Function to animate row removal
function animateRowRemoval(cells, rowIndex) {
    for (let col = 0; col < COLS; col++) {
        const cellIndex = rowIndex * COLS + col;
        cells[cellIndex].style.backgroundColor = "cyan"; // Apply animation color
    }
    setTimeout(() => {
        for (let col = 0; col < COLS; col++) {
            const cellIndex = rowIndex * COLS + col;
            cells[cellIndex].style.backgroundColor = ""; // Reset color
        }
    }, 300); // Adjust the animation duration as needed
}

// Function to update the score display
function updateScore() {
    scoreElement.textContent = score;
    linesElement.textContent = lines;
}


// Function to update both the visual and logical game boards
function updateGameBoard() {
    currentTetromino.render();
    const cells = gameBoard.getElementsByClassName("cell");
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cellIndex = row * COLS + col;
            if (board[row][col] === 1) {
                cells[cellIndex].classList.add("passive");
            } else {
                cells[cellIndex].classList.remove("passive");
            }
        }
    }

}

function updateGame() {

    if (isPaused) {
        // Don't update the game if paused
        return;
    }

    updateGameBoard();
    if (!currentTetromino.isValidMove(currentTetromino.x, currentTetromino.y +1, currentTetromino.shape)) {
        if(!readyForDeployment) {
            readyForDeployment=true;
            return;
        }
        readyForDeployment=false;
        // Place current tetromino on the game board
        currentTetromino.placeOnBoard();

        destroyRows(); // Call the destroy rows method

        currentTetromino = nextTetromino;
        nextTetromino = new Tetromino();
        renderNextTetromino();

        if (!currentTetromino.isValidMove(currentTetromino.x, currentTetromino.y, currentTetromino.shape)) {
            // Game over condition
            clearInterval(gameInterval);

            // Example usage of the functions
            const playerName = document.getElementById("name-input").value;

            saveHighScore(playerName, score);
            updateLastPlayer(playerName);
            gameOver=true;
            showGameOverPopup(score)
        }
    }


}

function tick() {
    if (isPaused) {
        // Don't update the game if paused
        return;
    }
    
    currentTetromino.moveDown();
    updateGame();
}


const nameInput = document.getElementById("name-input");
const lastPlayer = localStorage.getItem("lastPlayer");
if (lastPlayer) {
    nameInput.value = lastPlayer;
}

// Function to update the last player's name in local storage
function updateLastPlayer(name) {
    localStorage.setItem("lastPlayer", name);
}

// Function to save high scores in local storage
function saveHighScore(name, score) {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem("highScores", JSON.stringify(highScores));
}


function showGameOverPopup(score) {
    const gameOverPopup = document.getElementById("game-over-popup");
    const gameOverScore = document.getElementById("game-over-score");
    gameOverScore.textContent = score;
    gameOverPopup.style.display = "flex";

    const playAgainButton = document.getElementById("play-again-button");
    playAgainButton.addEventListener("click", () => {
        gameOverPopup.style.display = "none";
        window.location.reload(); // Restart the game
    });
}

function showBestScoresPopup() {
    const bestScoresPopup = document.getElementById("best-scores-popup");

    bestScoresPopup.style.display = "flex";

    const okButton = document.getElementById("close-button");
    okButton.addEventListener("click", () => {
        bestScoresPopup.style.display = "none";
        //window.location.reload(); // Restart the game
    });
}

function clearBoard() {
    board=[];
    for (let row = 0; row < ROWS; row++) {
        const newRow = Array(COLS).fill(0);
        board.push(newRow);
    }
    const cells1 = document.getElementsByClassName("cell");
    for (let i = 0; i < cells1.length; i++) {
        cells1[i].classList.remove("active");
        cells1[i].classList.remove("passive");
    }
}

//const settingsButton = document.getElementById("settings-button");
//const settingsPanel = document.getElementById("settings-panel");
//
//settingsButton.addEventListener("click", () => {
//    settingsPanel.style.display = "flex";
//});

// Apply settings
const applySettingsButton = document.getElementById("apply-settings-button");
const rowsInput = document.getElementById("rows-input");
const colsInput = document.getElementById("cols-input");
const colorInput = document.getElementById("color-input");

applySettingsButton.addEventListener("click", () => {
    ROWS = parseInt(rowsInput.value);
    COLS = parseInt(colsInput.value);
    document.documentElement.style.setProperty('--cols', colsInput.value);
    document.documentElement.style.setProperty('--rows', rowsInput.value);
    document.body.style.backgroundColor = colorInput.value;
    settingsPanel.style.display = "none";

    // Update game board and other components as needed
});


let isPaused = false; // Track the pause state

// Pause the game
function pauseGame() {
    isPaused = true;
}

// Resume the game
function resumeGame() {
    isPaused = false;
    updateGame(); // Restart the game loop
}

const pauseButton = document.getElementById("pause-button");
pauseButton.addEventListener("click", () => {
    if (isPaused) {
        resumeGame();
        pauseButton.textContent = "Pause";
    } else {
        pauseGame();
        pauseButton.textContent = "Resume";
    }
});

function startGame() {
    clearBoard();
    currentTetromino = new Tetromino();
    nextTetromino = new Tetromino();
    //updateGameBoard();
    renderNextTetromino();
    updateGame();
    //gameInterval.start;
}

const gameInterval  = setInterval(tick, 1000); // Update every 1 seconds;

startGame();



