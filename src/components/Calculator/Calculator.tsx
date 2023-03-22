// Calculator.tsx
import React, { useState } from "react";
import "./Calculator.css";

const Calculator: React.FC = () => {
  const [input, setInput] = useState("");

  const handleClick = (value: string) => {
    setInput(input + value);
  };

  const handleClear = () => {
    setInput("");
  };

  const calculate = (expression: string): string => {
    try {
      const result = evaluateExpression(expression);
      return result.toString();
    } catch (error) {
      return "Error";
    }
  };

  const handleCalculate = () => {
    setInput(calculate(input));
  };

  return (
    <div className="calculator">
      <input
        type="text"
        className="calculator-display"
        value={input}
        readOnly
      />
      <div className="calculator-buttons">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((number) => (
          <button key={number} onClick={() => handleClick(number + "")}>
            {number}
          </button>
        ))}
        <button onClick={() => handleClick("+")}>+</button>
        <button onClick={() => handleClick("-")}>-</button>
        <button onClick={() => handleClick("*")}>*</button>
        <button onClick={() => handleClick("/")}>/</button>
        <button onClick={handleClear}>C</button>
        <button onClick={handleCalculate}>=</button>
      </div>
    </div>
  );
};

export default Calculator;

// Helper function to parse and evaluate arithmetic expressions
function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);

  const parseOperand = (): number => {
    const token = tokens.shift();
    if (!token) throw new Error("Unexpected end of expression");

    if (isNumber(token)) return parseFloat(token);

    throw new Error(`Unexpected token: ${token}`);
  };

  const parseTerm = (): number => {
    let left = parseFactor();

    while (tokens.length > 0 && (tokens[0] === "*" || tokens[0] === "/")) {
      const op = tokens.shift() as string;
      const right = parseFactor();

      if (op === "*") {
        left *= right;
      } else {
        left /= right;
      }
    }

    return left;
  };

  const parseFactor = (): number => {
    let left = parseOperand();

    while (tokens.length > 0 && (tokens[0] === "+" || tokens[0] === "-")) {
      const op = tokens.shift() as string;
      const right = parseOperand();

      if (op === "+") {
        left += right;
      } else {
        left -= right;
      }
    }

    return left;
  };

  return parseTerm();
}

function tokenize(expression: string): string[] {
  const regex = /\s*(=>|{|}|[+*/()-]|[A-Za-z_]\w*|[0-9.]+|\S)\s*/g;
  return expression.split(regex).filter((s) => s.length > 0);
}

function isNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}
