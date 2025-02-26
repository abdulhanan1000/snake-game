import React, { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board";
import { Position, Direction, GameStatus, ControlType } from "../types/types";
import "../styles/Game.css";

const BOARD_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_FOOD: Position = { x: 5, y: 5 };
const GAME_SPEED = 150;

const Game: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [score, setScore] = useState<number>(0);
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [controlType, setControlType] = useState<ControlType>(ControlType.KEYBOARD);
  const boardRef = useRef<HTMLDivElement>(null);

  const generateFood = useCallback((): Position => {
    const newFood: Position = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };

    // Make sure food doesn't appear on snake
    if (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    ) {
      return generateFood();
    }

    return newFood;
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setStatus(GameStatus.PLAYING);
    setScore(0);
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (controlType !== ControlType.KEYBOARD) return;
      
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setNextDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setNextDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setNextDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setNextDirection("RIGHT");
          break;
        case " ":
          if (status === GameStatus.GAME_OVER) {
            resetGame();
          } else {
            setStatus(
              status === GameStatus.PLAYING
                ? GameStatus.PAUSED
                : GameStatus.PLAYING
            );
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [direction, status, resetGame, controlType]);

  // Handle mouse controls
  useEffect(() => {
    if (controlType !== ControlType.MOUSE || !boardRef.current) return;
    
    const calculateDirection = (e: MouseEvent) => {
      if (!boardRef.current) return;

      const rect = boardRef.current.getBoundingClientRect();
      const boardCenterX = rect.left + rect.width / 2;
      const boardCenterY = rect.top + rect.height / 2;
      
      const dx = e.clientX - boardCenterX;
      const dy = e.clientY - boardCenterY;
      
      // Determine which direction has the largest component
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement is dominant
        const newDirection = dx > 0 ? "RIGHT" : "LEFT";
        if ((newDirection === "RIGHT" && direction !== "LEFT") || 
            (newDirection === "LEFT" && direction !== "RIGHT")) {
          setNextDirection(newDirection as Direction);
        }
      } else {
        // Vertical movement is dominant
        const newDirection = dy > 0 ? "DOWN" : "UP";
        if ((newDirection === "DOWN" && direction !== "UP") || 
            (newDirection === "UP" && direction !== "DOWN")) {
          setNextDirection(newDirection as Direction);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (status === GameStatus.PLAYING) {
        calculateDirection(e);
      }
    };

    const handleClick = () => {
      if (status === GameStatus.GAME_OVER) {
        resetGame();
      } else {
        setStatus(status === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    boardRef.current.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (boardRef.current) {
        boardRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [controlType, direction, status, resetGame]);

  // Game loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const moveSnake = () => {
      setDirection(nextDirection);
      const head = { ...snake[0] };

      switch (nextDirection) {
        case "UP":
          head.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case "DOWN":
          head.y = (head.y + 1) % BOARD_SIZE;
          break;
        case "LEFT":
          head.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case "RIGHT":
          head.x = (head.x + 1) % BOARD_SIZE;
          break;
      }

      // Check if snake hits itself
      if (
        snake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setStatus(GameStatus.GAME_OVER);
        return;
      }

      const newSnake = [head, ...snake];

      // Check if snake eats food
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore((prevScore) => prevScore + 10);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [snake, food, nextDirection, status, generateFood]);

  const toggleControlType = () => {
    setControlType(prevType => 
      prevType === ControlType.KEYBOARD ? ControlType.MOUSE : ControlType.KEYBOARD
    );
  };

  return (
    <div className="game-container">
      <h1>Snake Game</h1>
      <div ref={boardRef}>
        <Board snake={snake} food={food} status={status} score={score} />
      </div>
      
      <div className="control-switcher">
        <label>Controls: </label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={controlType === ControlType.MOUSE}
            onChange={toggleControlType}
          />
          <span className="slider"></span>
        </label>
        <span className="active-control">
          {controlType === ControlType.KEYBOARD ? "Keyboard" : "Mouse"}
        </span>
      </div>
      
      <div className="instructions">
        {controlType === ControlType.KEYBOARD ? (
          <>
            <p>Use arrow keys to move</p>
            <p>Space to pause/restart</p>
          </>
        ) : (
          <>
            <p>Move mouse to control direction</p>
            <p>Click to pause/restart</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
