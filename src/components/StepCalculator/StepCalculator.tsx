import React, { useState } from "react";
import styles from "./StepCalculator.module.css";

interface StepCalculatorProps {}

interface StepCalculatorState {
  currentStepsPerMillimeter: number;
  desiredDistance: number;
  currentDistance: number;
}

const StepCalculator: React.FC<StepCalculatorProps> = () => {
  const [state, setState] = useState<StepCalculatorState>({
    currentStepsPerMillimeter: 0,
    desiredDistance: 0,
    currentDistance: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: parseFloat(value),
    });
  };

  const calculateSteps = (): number => {
    const { currentStepsPerMillimeter, desiredDistance, currentDistance } =
      state;
    const distanceToMove = desiredDistance - currentDistance;
    return currentStepsPerMillimeter * distanceToMove;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>3D Printer Step Calculator</h2>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Steps per millimeter:
          <input
            type="number"
            name="stepsPerMillimeter"
            value={state.currentStepsPerMillimeter}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Desired distance (mm):
          <input
            type="number"
            name="desiredDistance"
            value={state.desiredDistance}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Current distance (mm):
          <input
            type="number"
            name="currentDistance"
            value={state.currentDistance}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className={styles.result}>
        <h3>Required steps: {calculateSteps()}</h3>
      </div>
    </div>
  );
};

export default StepCalculator;
