import { Entity } from './Entity';
import { EntityType, Vector2 } from '../types/game.types';

export class EntityManager {
  private entities: Map<string, Entity> = new Map();

  // Add entity to the game
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  // Remove entity from the game
  removeEntity(id: string): boolean {
    return this.entities.delete(id);
  }

  // Get entity by ID
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  // Get all entities
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  // Get entities by type (easy for adding new entity types)
  getByType(type: EntityType): Entity[] {
    return this.getAllEntities().filter(entity => entity.type === type);
  }

  // Get entities in a rectangular area (for selection box)
  getEntitiesInRect(start: Vector2, end: Vector2): Entity[] {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return this.getAllEntities().filter(entity => {
      const pos = entity.position;
      return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
    });
  }

  // Get entity at specific point (for clicking)
  getEntityAtPoint(point: Vector2, radius: number = 10): Entity | undefined {
    return this.getAllEntities().find(entity => entity.containsPoint(point, radius));
  }

  // Update all entities
  update(deltaTime: number): void {
    this.entities.forEach(entity => entity.update(deltaTime));
  }

  // Render all entities
  render(ctx: CanvasRenderingContext2D, viewport: { x: number; y: number; zoom: number }): void {
    this.entities.forEach(entity => entity.render(ctx, viewport));
  }

  // Clear all entities
  clear(): void {
    this.entities.clear();
  }

  // Get entity count
  getCount(): number {
    return this.entities.size;
  }
} 