class Calculator {
	constructor() {
		this.currentOperand = "";
		this.expression = "";
		this.shouldResetScreen = false;
	}

	clear() {
		this.currentOperand = "";
		this.expression = "";
		this.shouldResetScreen = false;
	}

	delete() {
		this.currentOperand = this.currentOperand.toString().slice(0, -1);
	}

	appendNumber(number) {
		if (this.shouldResetScreen) {
			this.currentOperand = "";
			this.shouldResetScreen = false;
		}
		if (number === "." && this.currentOperand.includes(".")) return;
		this.currentOperand =
			this.currentOperand.toString() + number.toString();
	}

	chooseOperation(operation) {
		if (this.currentOperand === "") return;

		// Add the current operand and operation to the expression
		this.expression += this.currentOperand + " " + operation + " ";
		this.currentOperand = "";
	}

	compute() {
		if (this.currentOperand === "") return;

		// Build the complete expression
		const fullExpression = this.expression + this.currentOperand;
		console.log("Full expression to evaluate:", fullExpression);

		// Evaluate with proper order of operations
		const result = this.evaluateExpression(fullExpression);
		console.log("Result:", result);

		this.currentOperand = result;
		this.expression = "";
		this.shouldResetScreen = true;
	}

	// Evaluate expression with proper order of operations (PEMDAS)
	evaluateExpression(expression) {
		// Remove all spaces and convert to array of tokens
		const tokens = this.tokenize(expression);
		console.log("Tokens:", tokens);

		// First pass: handle multiplication and division
		let result = this.evaluateMD(tokens);
		console.log("After MD evaluation:", result);

		// Second pass: handle addition and subtraction
		result = this.evaluateAS(result);
		console.log("After AS evaluation:", result);

		return result[0];
	}

	tokenize(expression) {
		const tokens = [];
		let current = "";
		let i = 0;

		while (i < expression.length) {
			const char = expression[i];

			// Skip spaces
			if (char === " ") {
				i++;
				continue;
			}

			// Handle negative numbers at the beginning or after operators
			if (char === "-") {
				// Check if this is a negative number (not subtraction)
				let isNegativeNumber = false;

				if (i === 0) {
					// At the beginning of expression
					isNegativeNumber = true;
				} else {
					// Check if previous non-space character is an operator
					let j = i - 1;
					while (j >= 0 && expression[j] === " ") j--;
					if (j >= 0 && this.isOperator(expression[j])) {
						isNegativeNumber = true;
					}
				}

				if (isNegativeNumber) {
					current = "-";
					i++;
					continue;
				}
			}

			if (
				char === "+" ||
				char === "-" ||
				char === "×" ||
				char === "÷" ||
				char === "%"
			) {
				if (current !== "") {
					tokens.push(parseFloat(current));
					current = "";
				}
				tokens.push(char);
			} else {
				current += char;
			}
			i++;
		}

		if (current !== "") {
			tokens.push(parseFloat(current));
		}

		return tokens;
	}

	isOperator(char) {
		return (
			char === "+" ||
			char === "-" ||
			char === "×" ||
			char === "÷" ||
			char === "%"
		);
	}

	evaluateMD(tokens) {
		const result = [];

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			if (token === "×" || token === "÷" || token === "%") {
				const left = result.pop();
				const right = tokens[i + 1];

				if (typeof left !== "number" || typeof right !== "number") {
					console.error(
						"Invalid operands for MD operation:",
						left,
						right
					);
					return [NaN];
				}

				let computation;
				switch (token) {
					case "×":
						computation = left * right;
						break;
					case "÷":
						if (right === 0) {
							console.error("Division by zero");
							return [NaN];
						}
						computation = left / right;
						break;
					case "%":
						computation = left % right;
						break;
				}

				result.push(computation);
				i++; // Skip the next token since we've used it
			} else {
				result.push(token);
			}
		}

		return result;
	}

	evaluateAS(tokens) {
		const result = [];

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			if (token === "+" || token === "-") {
				const left = result.pop();
				const right = tokens[i + 1];

				if (typeof left !== "number" || typeof right !== "number") {
					console.error(
						"Invalid operands for AS operation:",
						left,
						right
					);
					return [NaN];
				}

				let computation;
				switch (token) {
					case "+":
						computation = left + right;
						break;
					case "-":
						computation = left - right;
						break;
				}

				result.push(computation);
				i++; // Skip the next token since we've used it
			} else {
				result.push(token);
			}
		}

		return result;
	}

	getDisplayNumber(number) {
		const stringNumber = number.toString();
		const integerDigits = parseFloat(stringNumber.split(".")[0]);
		const decimalDigits = stringNumber.split(".")[1];
		let integerDisplay;

		if (isNaN(integerDigits)) {
			integerDisplay = "";
		} else {
			integerDisplay = integerDigits.toLocaleString("en", {
				maximumFractionDigits: 0,
			});
		}

		if (decimalDigits != null) {
			return `${integerDisplay}.${decimalDigits}`;
		} else {
			return integerDisplay;
		}
	}

	updateDisplay() {
		document.querySelector(".currentOperand").textContent =
			this.getDisplayNumber(this.currentOperand);
		if (this.expression !== "") {
			document.querySelector(".previousOperand").textContent =
				this.expression;
		} else {
			document.querySelector(".previousOperand").textContent = "";
		}
	}
}

// Initialize calculator
const calculator = new Calculator();

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
	// Hide page loader after a short delay for smooth transition
	setTimeout(() => {
		const pageLoader = document.querySelector(".page-loader");
		if (pageLoader) {
			pageLoader.classList.add("hide");
			// Remove loader from DOM after animation completes
			setTimeout(() => {
				pageLoader.remove();
			}, 500);
		}
	}, 1000);

	// Number buttons
	document.querySelectorAll(".operand").forEach((button) => {
		button.addEventListener("click", () => {
			if (button.textContent === "-") {
				// Handle negative numbers
				if (calculator.currentOperand === "") {
					calculator.appendNumber("-");
				} else if (calculator.currentOperand === "-") {
					calculator.currentOperand = "";
				}
			} else {
				calculator.appendNumber(button.textContent);
			}
			calculator.updateDisplay();
		});
	});

	// Operator buttons
	document.querySelectorAll(".operator").forEach((button) => {
		button.addEventListener("click", () => {
			let operation;
			if (button.querySelector(".fa-plus")) operation = "+";
			else if (button.querySelector(".fa-minus")) operation = "-";
			else if (button.querySelector(".fa-xmark")) operation = "×";
			else if (button.querySelector(".fa-divide")) operation = "÷";
			else if (button.querySelector(".fa-percent")) operation = "%";

			if (operation) {
				calculator.chooseOperation(operation);
				calculator.updateDisplay();
			}
		});
	});

	// Equal button
	document.querySelector(".equal").addEventListener("click", () => {
		calculator.compute();
		calculator.updateDisplay();
	});

	// Clear button
	document.querySelector(".clear-all").addEventListener("click", () => {
		calculator.clear();
		calculator.updateDisplay();
	});

	// Delete button
	document.querySelector(".delete").addEventListener("click", () => {
		calculator.delete();
		calculator.updateDisplay();
	});

	// Keyboard support
	document.addEventListener("keydown", (e) => {
		if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
			calculator.appendNumber(e.key);
		} else if (e.key === "+") {
			calculator.chooseOperation("+");
		} else if (e.key === "-") {
			calculator.chooseOperation("-");
		} else if (e.key === "*") {
			calculator.chooseOperation("×");
		} else if (e.key === "/") {
			calculator.chooseOperation("÷");
		} else if (e.key === "%") {
			calculator.chooseOperation("%");
		} else if (e.key === "Enter" || e.key === "=") {
			calculator.compute();
		} else if (e.key === "Backspace") {
			calculator.delete();
		} else if (e.key === "Escape") {
			calculator.clear();
		}
		calculator.updateDisplay();
	});
});
