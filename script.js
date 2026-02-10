class CasioCalculator {
    constructor() {
        this.mainDisplay = document.querySelector('.main-display');
        this.subDisplay = document.querySelector('.sub-display');
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateDisplay();
    }

    attachEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-value]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNumberInput(e.currentTarget.dataset.value));
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOperator(e.currentTarget.dataset.operator));
        });

        // Function buttons
        document.querySelectorAll('[data-function]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFunction(e.currentTarget.dataset.function));
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    parseInput(value) {
        if (!value) return 0;
        // Remove parentheses and trim
        const clean = value.toString().replace(/[()]/g, '').trim();
        // Handle lone decimal point or empty string
        if (clean === '.' || clean === '') return 0;
        const parsed = parseFloat(clean);
        return isNaN(parsed) ? 0 : parsed;
    }

    handleNumberInput(value) {
        if (this.shouldResetDisplay) {
            // If starting new input with decimal, make it "0."
            this.currentValue = value === '.' ? '0.' : value;
            this.shouldResetDisplay = false;
        } else {
            if (value === '.') {
                if (this.currentValue.includes('.')) return;
                this.currentValue += value;
            } else {
                if (this.currentValue === '0' || this.currentValue === 'Error' || this.currentValue === 'Math Error') {
                    this.currentValue = value;
                } else {
                    this.currentValue += value;
                }
            }
        }
        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.shouldResetDisplay && this.operation) {
            this.operation = op;
            this.updateDisplay();
            return;
        }

        if (this.previousValue !== '' && this.operation && !this.shouldResetDisplay) {
            this.calculate();
        }

        // Whether we calculated or just started, the current value (or result)
        // becomes the previous value for the next operation.
        this.previousValue = this.currentValue;
        this.operation = op;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    handleFunction(fn) {
        switch (fn) {
            case 'ac':
                this.reset();
                break;
            case 'del':
                this.deleteLastChar();
                break;
            case 'equals':
                this.calculate(true); // true indicates final calculation
                break;
            case 'sin':
                this.applySciFunction('sin', Math.sin, true);
                break;
            case 'cos':
                this.applySciFunction('cos', Math.cos, true);
                break;
            case 'tan':
                this.applySciFunction('tan', Math.tan, true);
                break;
            case 'log':
                this.applySciFunction('log', Math.log10);
                break;
            case 'ln':
                this.applySciFunction('ln', Math.log);
                break;
            case 'sqrt':
                this.applySciFunction('√', Math.sqrt);
                break;
            case 'power':
                this.handleOperator('**');
                break;
            case 'reciprocal':
                this.applySciFunction('1/x', (x) => 1 / x);
                break;
            case 'percent':
                this.applyPercent();
                break;
            case 'pi':
                this.currentValue = String(Math.PI);
                this.shouldResetDisplay = true;
                this.updateDisplay();
                break;
            case 'factorial':
                this.applyFactorial();
                break;
            case 'parenthesis':
                this.toggleParenthesis();
                break;
            case 'shift':
            case 'alpha':
            case 'menu':
            case 'calc':
                break;
        }
    }

    applySciFunction(name, func, isRadian = false) {
        try {
            let num = this.parseInput(this.currentValue);

            if (isRadian) {
                num = num * (Math.PI / 180);
            }

            let result = func(num);
            this.currentValue = this.formatResult(result);
            this.shouldResetDisplay = true;
            this.updateDisplay();
        } catch (e) {
            this.showError('Math Error');
        }
    }

    applyPercent() {
        try {
            if (this.operation && this.previousValue !== '') {
                const num1 = this.parseInput(this.previousValue);
                const num2 = this.parseInput(this.currentValue);
                let result;

                switch (this.operation) {
                    case '+':
                    case '-':
                        result = (num2 / 100) * num1;
                        break;
                    default:
                        result = num2 / 100;
                }
                this.currentValue = String(result);
            } else {
                this.currentValue = String(this.parseInput(this.currentValue) / 100);
            }
            this.updateDisplay();
        } catch (e) {
            this.showError('Math Error');
        }
    }

    applyFactorial() {
        try {
            const num = Math.floor(this.parseInput(this.currentValue));
            if (num < 0) {
                this.showError('Math Error');
                return;
            }
            if (num > 170) {
                this.showError('Too Large');
                return;
            }

            let result = 1;
            for (let i = 2; i <= num; i++) {
                result *= i;
            }
            this.currentValue = String(result);
            this.shouldResetDisplay = true;
            this.updateDisplay();
        } catch (e) {
            this.showError('Math Error');
        }
    }

    toggleParenthesis() {
        if (this.currentValue.startsWith('(') && this.currentValue.endsWith(')')) {
            this.currentValue = this.currentValue.slice(1, -1);
        } else if (!this.currentValue.includes('(')) {
            this.currentValue = '(' + this.currentValue;
        } else if (!this.currentValue.includes(')')) {
            this.currentValue += ')';
        }
        this.updateDisplay();
    }

    deleteLastChar() {
        if (this.currentValue === '0' || this.currentValue === 'Error' || this.currentValue === 'Math Error') {
            this.currentValue = '0';
            return;
        }
        this.currentValue = this.currentValue.slice(0, -1);
        if (this.currentValue === '') {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    calculate(isFinal = false) {
        if (this.operation === null || this.previousValue === '') {
            return;
        }

        try {
            const num1 = this.parseInput(this.previousValue);
            const num2 = this.parseInput(this.currentValue);
            let result;

            switch (this.operation) {
                case '+':
                    result = num1 + num2;
                    break;
                case '-':
                    result = num1 - num2;
                    break;
                case '*':
                    result = num1 * num2;
                    break;
                case '/':
                    if (num2 === 0) {
                        this.showError('Math Error');
                        return;
                    }
                    result = num1 / num2;
                    break;
                case '**':
                    result = Math.pow(num1, num2);
                    break;
                default:
                    return;
            }

            this.currentValue = this.formatResult(result);

            if (isFinal) {
                this.previousValue = '';
                this.operation = null;
            }
            // If not final (chained), we leave previousValue/operation to be handled by handleOperator

            this.shouldResetDisplay = true;
            this.updateDisplay();
        } catch (e) {
            this.showError('Error');
        }
    }

    formatResult(num) {
        // Round to 8 decimal places to avoid floating point errors
        // and remove trailing zeros
        return String(Math.round(num * 100000000) / 100000000);
    }

    reset() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    showError(msg) {
        this.currentValue = msg;
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    updateDisplay() {
        this.mainDisplay.textContent = this.currentValue;

        if (this.operation && this.previousValue !== '') {
            this.subDisplay.textContent = `${this.previousValue} ${this.operation}`;
        } else if (this.previousValue !== '') {
            this.subDisplay.textContent = this.previousValue;
        } else {
            this.subDisplay.textContent = '';
        }
    }

    handleKeyboard(e) {
        const key = e.key;
        if (key >= '0' && key <= '9') {
            this.handleNumberInput(key);
        } else if (key === '.') {
            this.handleNumberInput('.');
        } else if (key === '+' || key === '-') {
            e.preventDefault();
            this.handleOperator(key);
        } else if (key === '*') {
            e.preventDefault();
            this.handleOperator('*');
        } else if (key === '/') {
            e.preventDefault();
            this.handleOperator('/');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate(true);
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.deleteLastChar();
        } else if (key === 'Delete' || key.toLowerCase() === 'c') {
            e.preventDefault();
            this.reset();
        }
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    new CasioCalculator();
});
