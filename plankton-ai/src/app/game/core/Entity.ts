import { Vector2, EntityType, EntityConfig } from '../types/game.types';

export abstract class Entity {
  public id: string;
  public position: Vector2;
  public selected: boolean = false;
  public type: EntityType;

  constructor(config: EntityConfig) {
    this.id = config.id;
    this.position = { ...config.position };
    this.type = config.type;
  }

  // Abstract methods that each entity type must implement
  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D, viewport: { x: number; y: number; zoom: number }): void;

  // Utility methods
  distanceTo(other: Vector2): number {
    const dx = this.position.x - other.x;
    const dy = this.position.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if point is within entity bounds (for selection)
  containsPoint(point: Vector2, radius: number = 10): boolean {
    return this.distanceTo(point) <= radius;
  }

  // Get screen position from world position
  getScreenPosition(viewport: { x: number; y: number; zoom: number }): Vector2 {
    return {
      x: (this.position.x - viewport.x) * viewport.zoom,
      y: (this.position.y - viewport.y) * viewport.zoom
    };
  }
} 