const calculator = document.querySelector('.calculator');
const keys = calculator.querySelector('.calculator-keys');
const display = document.querySelector('.calculator-screen');
const historyDisplay = document.querySelector('.history');

let firstValue = null;
let operator = null;
let waitingForSecondValue = false;

function handleInput(value) {
    switch (value) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case 'sqrt':
            handleOperator(value);
            break;
        case '=':
        case 'Enter':
            calculate();
            break;
        case 'all-clear':
        case 'Escape':
            clear();
            break;
        case '.':
            inputDecimal(value);
            break;
        case 'Backspace':
            backspace();
            break;
        default:
            if (isNumber(value)) {
                inputNumber(value);
            }
    }
}

keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) {
        return;
    }
    handleInput(target.value);
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const validKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '+', '-', '*', '/', '.', 'Enter', 'Escape', 'Backspace'
    ];
    if (validKeys.includes(key)) {
        event.preventDefault();
        handleInput(key);
    }
});

function isNumber(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
}

function inputNumber(num) {
    if (waitingForSecondValue) {
        display.value = num;
        waitingForSecondValue = false;
    } else {
        display.value = display.value === '0' ? num : display.value + num;
    }
}

function inputDecimal(dot) {
    if (!display.value.includes(dot)) {
        display.value += dot;
    }
}

function handleOperator(nextOperator) {
    const value = parseFloat(display.value);
    
    if (nextOperator === 'sqrt') {
        const result = Math.sqrt(value);
        display.value = result;
        firstValue = result;
        historyDisplay.textContent = `√(${value})`;
        return;
    }

    if (operator && waitingForSecondValue) {
        operator = nextOperator;
        return;
    }

    if (firstValue === null) {
        firstValue = value;
    } else if (operator) {
        const result = operate(operator, firstValue, value);
        display.value = `${parseFloat(result.toFixed(7))}`;
        firstValue = result;
    }
    
    historyDisplay.textContent = `${firstValue} ${nextOperator}`;
    waitingForSecondValue = true;
    operator = nextOperator;
}

function operate(operator, first, second) {
    switch (operator) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            return first / second;
        case '%':
            return (first / 100) * second;
        default:
            return second;
    }
}

function calculate() {
    const secondValue = parseFloat(display.value);
    const result = operate(operator, firstValue, secondValue);
    historyDisplay.textContent = `${firstValue} ${operator} ${secondValue} =`;
    display.value = `${parseFloat(result.toFixed(7))}`;
    firstValue = result;
    operator = null;
    waitingForSecondValue = true;
}

function clear() {
    display.value = '0';
    historyDisplay.textContent = '';
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
}

function backspace() {
    display.value = display.value.slice(0, -1);
    if (display.value === '') {
        display.value = '0';
    }
}