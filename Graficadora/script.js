// =========================================================
// 🎨 CONFIGURACIÓN INICIAL Y VARIABLES DEL ESTADO GLOBAL
// =========================================================

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el canvas

// Establecer las dimensiones del canvas (deben coincidir con el CSS)
const width = canvas.width = 600;
const height = canvas.height = 600;

// Mover el origen de las coordenadas al centro del canvas (0, 0)
ctx.translate(width / 2, height / 2);

// Definición de los parámetros iniciales (para la función de reset)
// scale = 30px por unidad, lo que permite ver aproximadamente de -10 a 10 en 600px.
const DEFAULT_SCALE = 30; 
const DEFAULT_PAN_X = 0; // Desplazamiento horizontal inicial
const DEFAULT_PAN_Y = 0; // Desplazamiento vertical inicial

// Variables de estado dinámicas
let scale = DEFAULT_SCALE; // Escala actual (píxeles por unidad)
let panX = DEFAULT_PAN_X;   // Desplazamiento actual del plano (unidades)
let panY = DEFAULT_PAN_Y;   // Desplazamiento actual del plano (unidades)
let isDragging = false;     // Bandera para el evento de Panning (arrastrar)
let lastX, lastY;           // Última posición del mouse al arrastrar

// Parámetros de la cuadrícula
const GRID_STEP_MAJOR = 1;   // Líneas principales cada 1 unidad
const GRID_STEP_MINOR = 0.2; // Líneas secundarias cada 0.2 unidades

// =========================================================
// ⚙️ ELEMENTOS DE INTERFAZ (DOM)
// =========================================================

const drawAllButton = document.getElementById('drawAllButton');
const addFunctionButton = document.getElementById('addFunctionButton');
const functionsContainer = document.getElementById('functions-container');

// Controles de navegación
const zoomInButton = document.getElementById('zoom-in-button');
const zoomOutButton = document.getElementById('zoom-out-button');
const resetViewButton = document.getElementById('reset-view-button');

// Controles del teclado virtual
const hideKeyboardButton = document.getElementById('hide-keyboard-button'); // Botón '❌'
const toggleKeyboardIcon = document.getElementById('toggle-keyboard-icon'); // Icono '⌨️' flotante
const keyboardContainer = document.getElementById('keyboard-container');
let activeInput = null; // Referencia al último input de texto enfocado

// =========================================================
// ⌨️ LÓGICA DEL TECLADO VIRTUAL
// =========================================================

/**
 * Controla la visibilidad del teclado y del icono flotante.
 * @param {boolean} shouldHide - Si es true, oculta el teclado y muestra el icono.
 */
function updateKeyboardState(shouldHide) {
    if (shouldHide) {
        // Oculta el teclado deslizando hacia abajo
        keyboardContainer.classList.add('hidden');
        // Muestra el icono de acceso rápido en la esquina
        toggleKeyboardIcon.style.display = 'block';
    } else {
        // Muestra el teclado deslizando hacia arriba
        keyboardContainer.classList.remove('hidden');
        // Oculta el icono de acceso rápido
        toggleKeyboardIcon.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Rastrea el campo de entrada activo
    document.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('function-input')) {
            activeInput = e.target;
        }
    });

    // 2. Inicializa el estado (oculto)
    updateKeyboardState(true);

    // 3. Eventos para mostrar/ocultar
    hideKeyboardButton.addEventListener('click', () => updateKeyboardState(true));
    toggleKeyboardIcon.addEventListener('click', () => updateKeyboardState(false));

    // 4. Lógica de inserción de teclas
    keyboardContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('key') && activeInput) {
            const keyValue = e.target.textContent;
            const input = activeInput;
            let finalValue = keyValue;

            // Mapeo de símbolos de la interfaz a la sintaxis de math.js
            const keyMap = {
                '×': '*', '÷': '/', 'sen': 'sin(', 'cos': 'cos(', 'tg': 'tan(',
                'log₁₀': 'log10(', 'ln': 'log(', 'eˣ': 'exp(', '10ˣ': '10^',
                '√': 'sqrt(', 'sen⁻¹': 'asin(', 'cos⁻¹': 'acos(', 'tg⁻¹': 'atan(',
                'logₓ': 'log('
            };

            if (keyMap[keyValue]) {
                finalValue = keyMap[keyValue];
            } else if (keyValue === '⬅️') {
                // Borrar un solo carácter
                input.value = input.value.slice(0, -1);
                return;
            } else if (keyValue === '❌') {
                // Borrar todo
                input.value = '';
                return;
            }

            // Insertar el valor y mantener el foco en el input
            input.value += finalValue;
            input.focus();
        }
    });
});

// =========================================================
// 📈 FUNCIONES DE DIBUJO Y GRÁFICOS
// =========================================================

/**
 * Dibuja la cuadrícula, los ejes principales y las etiquetas de los ejes.
 * La posición de los ejes se ajusta con panX y panY.
 */
function drawAxes() {
    // 1. Limpiar el fondo
    ctx.clearRect(-width / 2, -height / 2, width, height);

    // Función auxiliar para dibujar líneas de cuadrícula con un paso y estilo dados.
    const drawGridLines = (step, color, lineWidth) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        const stepPixels = scale * step;
        
        // El operador módulo (%) permite que las líneas de la cuadrícula se muevan
        // fluidamente mientras el usuario hace panning.

        // Cuadrícula Vertical
        for (let x = -width / 2; x < width / 2; x += stepPixels) {
            ctx.beginPath();
            ctx.moveTo(x + (panX * scale) % stepPixels, -height / 2);
            ctx.lineTo(x + (panX * scale) % stepPixels, height / 2);
            ctx.stroke();
        }

        // Cuadrícula Horizontal
        for (let y = -height / 2; y < height / 2; y += stepPixels) {
            ctx.beginPath();
            ctx.moveTo(-width / 2, y + (panY * scale) % stepPixels);
            ctx.lineTo(width / 2, y + (panY * scale) % stepPixels);
            ctx.stroke();
        }
    };
    
    // 2. Dibujar cuadrícula menor y mayor
    drawGridLines(GRID_STEP_MINOR, '#e0e0e0', 0.5); // Menor (fina)
    drawGridLines(GRID_STEP_MAJOR, '#cccccc', 1);   // Mayor (gruesa)


    // 3. Dibujar Ejes X e Y (Líneas más gruesas)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2; 
    
    // Eje X (Ajustado por el panY)
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0 + panY * scale);
    ctx.lineTo(width / 2, 0 + panY * scale);
    ctx.stroke();

    // Eje Y (Ajustado por el panX)
    ctx.beginPath();
    ctx.moveTo(0 + panX * scale, -height / 2);
    ctx.lineTo(0 + panX * scale, height / 2);
    ctx.stroke();

    // 4. Dibujar Etiquetas de los Ejes
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';

    // Marcadores del eje X
    ctx.textBaseline = 'top';
    const stepLabel = scale * GRID_STEP_MAJOR;
    for (let x_pixel = -width / 2; x_pixel < width / 2; x_pixel += stepLabel) {
        // Evita dibujar la etiqueta '0' sobre el eje Y
        if (Math.abs(x_pixel + panX * scale) > 1) { 
            const x_val = (x_pixel / scale) - panX;
            ctx.textAlign = 'center';
            // Posiciona la etiqueta cerca del eje X
            ctx.fillText(x_val.toFixed(0), x_pixel, 10 + panY * scale);
        }
    }

    // Marcadores del eje Y
    ctx.textAlign = 'right';
    for (let y_pixel = -height / 2; y_pixel < height / 2; y_pixel += stepLabel) {
        // Evita dibujar la etiqueta '0' sobre el eje X
        if (Math.abs(y_pixel - panY * scale) > 1) {
            const y_val = -(y_pixel / scale) - panY;
            ctx.textBaseline = 'middle';
            // Posiciona la etiqueta cerca del eje Y
            ctx.fillText(y_val.toFixed(0), -10 + panX * scale, y_pixel);
        }
    }
}

/**
 * Evalúa y dibuja una función en el canvas.
 * @param {string} funcStr - La expresión matemática a evaluar (e.g., 'x^2').
 * @param {string} color - El color de la línea.
 */
function drawFunction(funcStr, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Itera por cada columna de píxel en el canvas
    for (let x = -width / 2; x <= width / 2; x++) {
        // Convierte la coordenada de píxel (x) a una coordenada real (x_scaled)
        const x_scaled = (x / scale) - panX;
        try {
            // Evalúa la función para el valor x_scaled
            const y_val = math.evaluate(funcStr, {x: x_scaled});
            // Convierte el resultado (y_val) a la coordenada de píxel (y_scaled)
            // Se usa el signo negativo porque en el canvas Y crece hacia abajo.
            const y_scaled = (-y_val * scale) + panY; 
            
            // Si es el primer punto, se usa moveTo. Si no, lineTo.
            x === -width / 2 ? ctx.moveTo(x, y_scaled) : ctx.lineTo(x, y_scaled);
        } catch (e) {
             // Ignorar errores de evaluación (e.g., dominio de logaritmos)
        }
    }

    ctx.stroke();
}

/**
 * Borra el canvas y redibuja los ejes y todas las funciones.
 */
function redraw() {
    // Nota: drawAxes() ya limpia el fondo.
    drawAxes(); 

    // Itera sobre todas las filas de funciones para dibujarlas.
    document.querySelectorAll('.function-row').forEach(row => {
        const funcStr = row.querySelector('.function-input').value;
        const color = row.querySelector('.color-picker').value;
        if (funcStr) drawFunction(funcStr, color);
    });
}

// =========================================================
// ➕ GESTIÓN DE FUNCIONES
// =========================================================

addFunctionButton.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.classList.add('function-row');
    newRow.innerHTML = `
        <input type="text" class="function-input" placeholder="Ej: x^2">
        <input type="color" class="color-picker" value="#0000ff">
    `;
    functionsContainer.appendChild(newRow);
});

drawAllButton.addEventListener('click', redraw);

// =========================================================
// 🔍 ZOOM Y RESET DE VISTA
// =========================================================

/**
 * Aplica un factor de multiplicación a la escala actual.
 * @param {number} factor - Factor de zoom (e.g., 1.2 para acercar, 0.8 para alejar).
 */
function applyZoom(factor) {
    scale *= factor;
    redraw();
}

/**
 * Restablece la escala y el desplazamiento a los valores predeterminados.
 */
function resetView() {
    scale = DEFAULT_SCALE;
    panX = DEFAULT_PAN_X;
    panY = DEFAULT_PAN_Y;
    redraw();
}

zoomInButton.addEventListener('click', () => applyZoom(1.2));
zoomOutButton.addEventListener('click', () => applyZoom(0.8));
resetViewButton.addEventListener('click', resetView);

// =========================================================
// 🖱️ EVENTOS DE MOUSE (Zoom por rueda y Panning)
// =========================================================

// Zoom por Rueda (más suave)
canvas.addEventListener('wheel', (e) => {
    // Factor de zoom más suave (0.95/1.05) para un control más fino.
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05; 
    scale *= zoomFactor;
    redraw();
    e.preventDefault(); // Evita el desplazamiento de la página
});

// Inicio del arrastre (mousedown)
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.offsetX; // Posición X del mouse
    lastY = e.offsetY; // Posición Y del mouse
});

// Movimiento del arrastre (mousemove) - Panning
canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    // Calcular el cambio en la posición del mouse
    const dx = e.offsetX - lastX;
    const dy = e.offsetY - lastY;
    
    // Ajustar el desplazamiento (pan)
    // SUMAMOS (+) para que el plano se mueva en la misma dirección que el cursor (efecto "manita")
    panX += dx / scale; 
    panY += dy / scale; 
    
    lastX = e.offsetX;
    lastY = e.offsetY;
    redraw();
});

// Final del arrastre (mouseup)
canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// =========================================================
// ✅ INICIALIZACIÓN
// =========================================================

// Dibujar la vista inicial al cargar la página.
redraw();