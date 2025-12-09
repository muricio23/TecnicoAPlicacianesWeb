// Estado del juego
let gameBoard = ['', '', '', '', '', '', '', '', '']; 
let currentPlayer = 'X'; 
let gameActive = true; 
let gameMode = 'pvp'; // Modo de juego: 'pvp' o 'pvc'   

// Contadores de victorias
let winsX = 0;
let winsO = 0;

// Elementos del DOM
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const resetScoreButton = document.getElementById('resetScoreButton');
const cells = document.querySelectorAll('.cell');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const gameModeSelect = document.getElementById('gameMode'); // Selector de modo de juego

// Posibilidades de victoria
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
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

// Función auxiliar: Busca si hay un movimiento ganador o un bloqueo para un jugador dado
// Devuelve el índice de la celda si lo encuentra, o -1 si no.
function getWinningMove(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        
        // Contar cuántas celdas de la condición tienen el símbolo del jugador
        let count = 0;
        let emptyIndex = -1; // Almacena el índice de la celda vacía

        // Comprobación de las 3 posiciones
        [a, b, c].forEach(index => {
            if (board[index] === player) {
                count++;
            } else if (board[index] === '') {
                emptyIndex = index;
            }
        });

        // Si el jugador tiene 2 en línea y la tercera está vacía, es un movimiento ganador/bloqueo
        if (count === 2 && emptyIndex !== -1) {
            return emptyIndex; // Devuelve el índice que garantiza la victoria/bloqueo
        }
    }
    return -1; // No se encontró un movimiento ganador/bloqueo
}


// --- LÓGICA DE LA COMPUTADORA (IA INTELIGENTE) ---
function computerMove() {
    // Si no es el turno de la O, no hay juego activo o no es modo PVC, salir.
    if (currentPlayer !== 'O' || !gameActive || gameMode !== 'pvc') {
        return;
    }

    let moveIndex = -1;
    const availableCells = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            availableCells.push(i);
        }
    }
    
    if (availableCells.length === 0) {
        // No hay celdas disponibles, no debería pasar si gameActive es true
        return;
    }


    // 1. **Prioridad: Intentar Ganar**
    // La IA busca si puede ganar en este turno.
    moveIndex = getWinningMove(gameBoard, 'O'); 

    // 2. **Prioridad: Bloquear al Jugador 'X'**
    // Si no puede ganar, la IA busca si 'X' va a ganar y lo bloquea.
    if (moveIndex === -1) {
        moveIndex = getWinningMove(gameBoard, 'X');
    }

    // 3. **Prioridad: Estrategia (Centro)**
    // Si no hay que ganar ni bloquear, toma el centro (índice 4), que es la mejor posición.
    if (moveIndex === -1 && availableCells.includes(4)) {
        moveIndex = 4;
    }
    
    // 4. **Prioridad: Esquinas (0, 2, 6, 8)**
    // Si el centro no está disponible, toma la primera esquina libre.
    if (moveIndex === -1) {
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => availableCells.includes(index));
        if (availableCorners.length > 0) {
            // Elige la primera esquina disponible
            moveIndex = availableCorners[0]; 
        }
    }

    // 5. **Prioridad: Último Recurso (Primera celda disponible)**
    // Si ninguna de las estrategias anteriores funciona, toma la primera celda vacía.
    if (moveIndex === -1) {
        moveIndex = availableCells[0]; 
    }
    
    // Ejecutar el movimiento
    if (moveIndex !== -1) {
        gameBoard[moveIndex] = currentPlayer;
        const clickedCell = cells[moveIndex];
        
        clickedCell.innerHTML = currentPlayer;
        clickedCell.classList.add(currentPlayer);
        
        handleResultValidation();
    }
}

// --- FUNCIONES PRINCIPALES DEL JUEGO ---

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return; 
    }
    
    // Evita que el jugador humano mueva la O en modo PVC
    if (gameMode === 'pvc' && currentPlayer === 'O') {
        return; 
    }

    // Mueve el jugador humano
    gameBoard[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer);

    handleResultValidation();
}

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
        
        if (currentPlayer === 'X') {
            winsX++;
        } else {
            winsO++;
        }
        updateScoreDisplay(); 
        return;
    }

    if (!gameBoard.includes('')) {
        statusDisplay.innerHTML = messageDraw;
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

// 3. Cambia al siguiente jugador (¡CORRECCIÓN AQUÍ!)
function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.innerHTML = messageTurn(currentPlayer);
    
    // **Lógica que faltaba**
    if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
        setTimeout(computerMove, 500); 
    }
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    statusDisplay.innerHTML = messageTurn(currentPlayer);

    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('X', 'O');
    });
    
    // **Asegúrate de que la computadora juegue si comienza el juego y es su turno**
    if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
         setTimeout(computerMove, 500); 
    }
}

function handleResetScore() {
    winsX = 0;
    winsO = 0;
    updateScoreDisplay(); 
    handleRestartGame(); 
}

// --- MANEJO DEL MODO DE JUEGO (¡NUEVA FUNCIÓN!) ---
function handleGameModeChange(event) {
    gameMode = event.target.value;
    handleRestartGame(); 
}


// **Listeners de Eventos**

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', handleRestartGame);
resetScoreButton.addEventListener('click', handleResetScore);
// **Listener de evento que faltaba**
gameModeSelect.addEventListener('change', handleGameModeChange);

// Inicializa el mensaje de estado y los marcadores al cargar
statusDisplay.innerHTML = messageTurn(currentPlayer);
updateScoreDisplay();