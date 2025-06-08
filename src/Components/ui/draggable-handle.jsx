import React, { useState, useEffect, useCallback } from 'react';

// A simple component that adds a draggable handle to the top of a dialog
// This allows users to move the dialog around when Razorpay window is open
export function DraggableHandle({ enabled = true, onPositionChange = () => {} }) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (!enabled) return;

    setDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });

    // Prevent text selection during dragging
    e.preventDefault();
  }, [enabled, position]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;

    const newPosition = {
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    };

    setPosition(newPosition);
    onPositionChange(newPosition);
  }, [dragging, startPos, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
    }
  }, [dragging]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [enabled, handleMouseMove, handleMouseUp]);

  // Only show draggable handle if enabled
  if (!enabled) return null;

  return (
    <div 
      className="absolute top-0 left-0 w-full bg-blue-600 h-8 cursor-move flex items-center justify-center text-white text-sm font-medium rounded-t-lg"
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Move dialog (Razorpay payment in progress)</span>
      </div>
      
      {dragging && (
        <div className="fixed inset-0 z-50 cursor-move" />
      )}
    </div>
  );
}
