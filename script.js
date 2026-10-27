const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const board = document.getElementById("board");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart");

for (let i = 0; i < WORD_LENGTH * MAX_ATTEMPTS; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
}

const tiles = document.querySelectorAll(".tile");

let words = [];
let answer = "";
let currentRow = 0;
let currentGuess = "";
let gameOver = false;

async function loadWords() {
    if (words.length > 0) return;

    const response = await fetch("words.txt");
    const text = await response.text();

    words = text
        .split(/\s+/)
        .filter(word => word.length === WORD_LENGTH);
}

async function startGame() {
    await loadWords();

    const randomIndex = Math.floor(Math.random() * words.length);
    answer = words[randomIndex].toUpperCase();
}

function getTileIndex() {
    return currentRow * WORD_LENGTH + currentGuess.length;
}

function addLetter(letter) {
    tiles[getTileIndex()].textContent = letter;
    currentGuess += letter;
}

function removeLetter() {
    currentGuess = currentGuess.slice(0, -1);
    tiles[getTileIndex()].textContent = "";
}

function clearBoard() {
    for (const tile of tiles) {
        tile.textContent = "";
        tile.classList.remove("green", "yellow", "gray");
    }
}


function scoreGuess(guess, answer) {
    const results = Array(WORD_LENGTH).fill("gray");
    const unmatchedLetters = answer.split("");

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === answer[i]) {
            results[i] = "green";
            unmatchedLetters[i] = null;
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (results[i] === "green") continue;

        const matchIndex = unmatchedLetters.indexOf(guess[i]);
        if (matchIndex !== -1) {
            results[i] = "yellow";
            unmatchedLetters[matchIndex] = null; // each answer letter used once
        }
    }

    return results;
}

function submitGuess() {
    const results = scoreGuess(currentGuess, answer);
    const rowStart = currentRow * WORD_LENGTH;

    results.forEach((color, i) => {
        tiles[rowStart + i].classList.add(color);
    });

    const isWin = currentGuess === answer;
    currentRow++;
    currentGuess = "";

    if (isWin) {
        message.textContent = "You won!";
        gameOver = true;
    } else if (currentRow === MAX_ATTEMPTS) {
        message.textContent = "Game over! The answer was " + answer;
        gameOver = true;
    } else {
        message.textContent = "Try again!";
    }
}

function handleKeydown(event) {
    if (gameOver || !answer) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const isLetter = /^[a-z]$/i.test(event.key);

    if (isLetter && currentGuess.length < WORD_LENGTH) {
        addLetter(event.key.toUpperCase());
    } else if (event.key === "Backspace" && currentGuess.length > 0) {
        removeLetter();
    } else if (event.key === "Enter" && currentGuess.length === WORD_LENGTH) {
        submitGuess();
    }
}

function restartGame() {
    restartButton.blur(); 

    currentRow = 0;
    currentGuess = "";
    gameOver = false;
    answer = "";
    message.textContent = "";

    clearBoard();
    startGame();
}

document.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", restartGame);
startGame();