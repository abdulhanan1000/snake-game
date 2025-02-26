import React from "react";
import Snake from "./Snake";
import Food from "./Food";
import { Position, GameStatus } from "../types/types";

interface BoardProps {
  snake: Position[];
  food: Position;
  status: GameStatus;
  score: number;
}

const Board: React.FC<BoardProps> = ({ snake, food, status, score }) => {
  return (
    <div className="board">
      {status === GameStatus.GAME_OVER ? (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your Score: {score}</p>
          <p>Press Space or Click to Restart</p>
        </div>
      ) : (
        <>
          <Snake segments={snake} />
          <Food position={food} />
          <div className="score">Score: {score}</div>
        </>
      )}
    </div>
  );
};

export default Board;
