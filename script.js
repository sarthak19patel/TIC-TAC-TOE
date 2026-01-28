const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const hintBtn = document.getElementById('hintBtn');

let hintTimeout = null;

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('filled');
    clickedCell.classList.add(currentPlayer.toLowerCase());

    checkResult();
}

function checkResult() {
    let roundWon = false;
    let winningCombination = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        const a = gameState[condition[0]];
        const b = gameState[condition[1]];
        const c = gameState[condition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningCombination = condition;
            break;
        }
    }

    if (roundWon) {
        status.textContent = `🎉 Player ${currentPlayer} wins! 🎉`;
        gameActive = false;
        highlightWinningCells(winningCombination);
        return;
    }

    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        status.textContent = "🤝 It's a draw! 🤝";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;
}

function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function getHint() {
    if (!gameActive) {
        hintBtn.classList.add('shake');
        setTimeout(() => hintBtn.classList.remove('shake'), 500);
        return;
    }

    // Clear previous hint
    cells.forEach(cell => cell.classList.remove('hint'));
    clearTimeout(hintTimeout);

    const hintIndex = calculateBestMove();
    
    if (hintIndex !== -1) {
        cells[hintIndex].classList.add('hint');
        hintTimeout = setTimeout(() => {
            cells[hintIndex].classList.remove('hint');
        }, 4500);
    }
}

function calculateBestMove() {
    // 1. Check if current player can win
    const winMove = findWinningMove(currentPlayer);
    if (winMove !== -1) return winMove;

    // 2. Block opponent from winning
    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    const blockMove = findWinningMove(opponent);
    if (blockMove !== -1) return blockMove;

    // 3. Take center if available
    if (gameState[4] === '') return 4;

    // 4. Take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => gameState[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 5. Take any edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(i => gameState[i] === '');
    if (availableEdges.length > 0) {
        return availableEdges[0];
    }

    return -1;
}

function findWinningMove(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        const values = [gameState[a], gameState[b], gameState[c]];
        const playerCount = values.filter(v => v === player).length;
        const emptyCount = values.filter(v => v === '').length;

        if (playerCount === 2 && emptyCount === 1) {
            if (gameState[a] === '') return a;
            if (gameState[b] === '') return b;
            if (gameState[c] === '') return c;
        }
    }
    return -1;
}

function restartGame() {
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = "Player X's turn";

    clearTimeout(hintTimeout);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'x', 'o', 'winner', 'hint');
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
hintBtn.addEventListener('click', getHint);
