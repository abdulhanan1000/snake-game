
import React from 'react';
import { Position } from '../types/types';

interface FoodProps {
  position: Position;
}

const Food: React.FC<FoodProps> = ({ position }) => {
  return (
    <div
      className="food"
      style={{
        left: `${position.x * 20}px`,
        top: `${position.y * 20}px`,
      }}
    />
  );
};

export default Food;