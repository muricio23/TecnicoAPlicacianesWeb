// Estado del juego
let gameBoard = ['', '', '', '', '', '', '', '', '']; // Representa las 9 celdas
let currentPlayer = 'X'; // El juego siempre comienza con 'X'
let gameActive = true; // Indica si el juego aún está en curso

// Contadores de victorias
let winsX = 0;
let winsO = 0;

// Elementos del DOM
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const resetScoreButton = document.getElementById('resetScoreButton'); // Nuevo botón
const cells = document.querySelectorAll('.cell');
const scoreXDisplay = document.getElementById('scoreX'); // Elemento para score X
const scoreODisplay = document.getElementById('scoreO'); // Elemento para score O

// Posibilidades de victoria (índices del array gameBoard)
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

// Mensajes de estado
const messageTurn = (player) => `Turno de ${player}`;
const messageWin = (player) => `¡El jugador ${player} ha ganado! 🏆`;
const messageDraw = '¡Empate! Nadie ha ganado. 🤝';

// Función para actualizar los marcadores en el DOM
function updateScoreDisplay() {
    scoreXDisplay.innerHTML = `X: ${winsX}`;
    scoreODisplay.innerHTML = `O: ${winsO}`;
}

// **Funciones Principales**

// 1. Maneja el clic en una celda
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer);

    handleResultValidation();
}

// 2. Verifica si alguien ha ganado o si hay un empate
function handleResultValidation() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameBoard[winCondition[0]];
        let b = gameBoard[winCondition[1]];
        let c = gameBoard[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = messageWin(currentPlayer);
        gameActive = false;
        // Incrementa el contador de victorias
        if (currentPlayer === 'X') {
            winsX++;
        } else {
            winsO++;
        }
        updateScoreDisplay(); // Actualiza el display del marcador
        return;
    }

    if (!gameBoard.includes('')) {
        statusDisplay.innerHTML = messageDraw;
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

// 3. Cambia al siguiente jugador
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.innerHTML = messageTurn(currentPlayer);
}

// 4. Reinicia el tablero del juego (pero mantiene el marcador)
function handleRestartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    statusDisplay.innerHTML = messageTurn(currentPlayer);

    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('X', 'O');
    });
}

// 5. Reinicia todo el juego, incluyendo el marcador de victorias
function handleResetScore() {
    winsX = 0;
    winsO = 0;
    updateScoreDisplay(); // Actualiza el display del marcador
    handleRestartGame(); // También reinicia el tablero
}

// **Listeners de Eventos**

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', handleRestartGame);
resetScoreButton.addEventListener('click', handleResetScore); // Listener para el nuevo botón

// Inicializa el mensaje de estado y los marcadores al cargar
statusDisplay.innerHTML = messageTurn(currentPlayer);
updateScoreDisplay();