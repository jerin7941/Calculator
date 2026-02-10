class CasioCalculator {
    constructor() {
        this.mainDisplay = document.querySelector('.main-display');
        this.subDisplay = document.querySelector('.sub-display');
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.expression = '';
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-value]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNumberInput(e.target.dataset.value));
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOperator(e.target.dataset.operator));
        });

        // Function buttons
        document.querySelectorAll('[data-function]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFunction(e.target.dataset.function));
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleNumberInput(value) {
        if (this.shouldResetDisplay) {
            this.currentValue = value;
            this.shouldResetDisplay = false;
        } else {
            if (value === '.') {
                if (this.currentValue.includes('.')) return;
                this.currentValue += value;
            } else {
                if (this.currentValue === '0') {
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
        } else {
            this.previousValue = this.currentValue;
        }

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
                this.calculate();
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
                // These are placeholder functions for UI completeness
                break;
        }
    }

    applySciFunction(name, func, isRadian = false) {
        try {
            let num = parseFloat(this.currentValue);

            if (isNaN(num)) return;

            if (isRadian) {
                // Convert degrees to radians
                num = num * (Math.PI / 180);
            }

            let result = func(num);
            this.currentValue = String(Math.round(result * 100000000) / 100000000);
            this.shouldResetDisplay = true;
            this.updateDisplay();
        } catch (e) {
            this.showError('Math Error');
        }
    }

    applyPercent() {
        try {
            if (this.operation && this.previousValue !== '') {
                const num1 = parseFloat(this.previousValue);
                const num2 = parseFloat(this.currentValue);
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
                this.currentValue = String(parseFloat(this.currentValue) / 100);
            }
            this.updateDisplay();
        } catch (e) {
            this.showError('Math Error');
        }
    }

    applyFactorial() {
        try {
            const num = Math.floor(parseFloat(this.currentValue));
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
        // Simple parenthesis handling
        if (!this.currentValue.includes('(')) {
            this.currentValue = '(' + this.currentValue;
        } else if (!this.currentValue.includes(')')) {
            this.currentValue += ')';
        }
        this.updateDisplay();
    }

    deleteLastChar() {
        if (this.currentValue === '0') return;
        this.currentValue = this.currentValue.slice(0, -1);
        if (this.currentValue === '') {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    calculate() {
        if (this.operation === null || this.previousValue === '') {
            return;
        }

        try {
            const num1 = parseFloat(this.previousValue);
            const num2 = parseFloat(this.currentValue);

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
                        this.showError('E');
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

            // Round to avoid floating point errors
            result = Math.round(result * 100000000) / 100000000;

            this.currentValue = String(result);
            this.previousValue = '';
            this.operation = null;
            this.shouldResetDisplay = true;
            this.updateDisplay();
        } catch (e) {
            this.showError('E');
        }
    }

    reset() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.expression = '';
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
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumberInput(e.key);
        } else if (e.key === '.') {
            this.handleNumberInput('.');
        } else if (e.key === '+' || e.key === '-') {
            e.preventDefault();
            this.handleOperator(e.key);
        } else if (e.key === '*') {
            e.preventDefault();
            this.handleOperator('*');
        } else if (e.key === '/') {
            e.preventDefault();
            this.handleOperator('/');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.deleteLastChar();
        } else if (e.key === 'Delete' || e.key.toLowerCase() === 'c') {
            e.preventDefault();
            this.reset();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CasioCalculator();
});
