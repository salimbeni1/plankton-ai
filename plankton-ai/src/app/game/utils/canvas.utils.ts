import { Vector2 } from '../types/game.types';

// Get mouse position relative to canvas
export function getMousePosition(event: MouseEvent, canvas: HTMLCanvasElement): Vector2 {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

// Get touch position relative to canvas
export function getTouchPosition(touch: Touch, canvas: HTMLCanvasElement): Vector2 {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Distance between two points
export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Linear interpolation between two values
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Linear interpolation between two vectors
export function lerpVector(start: Vector2, end: Vector2, factor: number): Vector2 {
  return {
    x: lerp(start.x, end.x, factor),
    y: lerp(start.y, end.y, factor)
  };
}

// Check if a point is inside a rectangle
export function pointInRect(point: Vector2, rect: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

// Normalize a vector
export function normalize(vector: Vector2): Vector2 {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

// Add two vectors
export function addVectors(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

// Subtract two vectors
export function subtractVectors(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

// Multiply vector by scalar
export function multiplyVector(vector: Vector2, scalar: number): Vector2 {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar
  };
}

// Create a unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
} 