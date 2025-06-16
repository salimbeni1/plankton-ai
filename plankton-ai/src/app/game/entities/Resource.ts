import { Entity } from '../core/Entity';
import { Vector2, EntityType, ResourceConfig } from '../types/game.types';

export class Resource extends Entity {
  public resourceType: string;
  public amount: number;
  private color: string;

  constructor(config: ResourceConfig) {
    super(config);
    this.resourceType = config.resourceType;
    this.amount = config.amount;
    this.color = this.getResourceColor();
  }

  private getResourceColor(): string {
    const colors: Record<string, string> = {
      wood: '#8B4513',
      stone: '#696969',
      food: '#FFA500',
      water: '#1E90FF',
      gold: '#FFD700'
    };
    return colors[this.resourceType] || '#666666';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(deltaTime: number): void {
    // Resources don't move or change over time (for now)
    // Future: could add resource regeneration, decay, etc.
  }

  render(ctx: CanvasRenderingContext2D, viewport: { x: number; y: number; zoom: number }): void {
    const screenPos = this.getScreenPosition(viewport);
    const size = 12 * viewport.zoom;

    // Draw resource as a square
    ctx.fillStyle = this.color;
    ctx.fillRect(screenPos.x - size/2, screenPos.y - size/2, size, size);

    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenPos.x - size/2, screenPos.y - size/2, size, size);

    // Draw selection indicator
    if (this.selected) {
      ctx.beginPath();
      ctx.rect(screenPos.x - size/2 - 3, screenPos.y - size/2 - 3, size + 6, size + 6);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw resource amount (if zoomed in enough)
    if (viewport.zoom > 0.5) {
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(8, 10 * viewport.zoom)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.amount.toString(), screenPos.x, screenPos.y + size/2 + 8 * viewport.zoom);
    }
  }

  // Check if resource can be harvested
  canHarvest(): boolean {
    return this.amount > 0;
  }

  // Harvest resource (reduce amount)
  harvest(amount: number = 1): number {
    const harvested = Math.min(amount, this.amount);
    this.amount -= harvested;
    return harvested;
  }

  // Check if resource is depleted
  isDepleted(): boolean {
    return this.amount <= 0;
  }

  // Create a new resource at a specific position
  static create(id: string, position: Vector2, resourceType: string, amount: number): Resource {
    return new Resource({
      id,
      type: EntityType.RESOURCE,
      position,
      resourceType,
      amount
    });
  }

  // Create random resources
  static createRandom(id: string, bounds: { width: number; height: number }): Resource {
    const resourceTypes = ['wood', 'stone', 'food', 'water', 'gold'];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const amount = Math.floor(Math.random() * 50) + 10; // 10-60 amount

    return Resource.create(
      id,
      {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height
      },
      resourceType,
      amount
    );
  }
} 