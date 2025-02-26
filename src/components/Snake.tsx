import React from 'react';
import { Position } from '../types/types';

interface SnakeProps {
  segments: Position[];
}

const Snake: React.FC<SnakeProps> = ({ segments }) => {
  return (
    <>
      {segments.map((segment, index) => (
        <div
          key={index}
          className="snake-segment"
          style={{
            left: `${segment.x * 20}px`,
            top: `${segment.y * 20}px`,
          }}
        />
      ))}
    </>
  );
};

export default Snake;
