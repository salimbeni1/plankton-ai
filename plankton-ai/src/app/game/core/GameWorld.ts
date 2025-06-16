import { EntityManager } from './EntityManager';
import { Entity } from './Entity';
import { Vector2, Viewport, GameState } from '../types/game.types';
import { Human } from '../entities/Human';

export class GameWorld {
  private entityManager: EntityManager;
  private selectedEntities: Set<string> = new Set();
  private viewport: Viewport;
  private isSelecting: boolean = false;
  private selectionStart?: Vector2;
  private selectionEnd?: Vector2;

  constructor() {
    this.entityManager = new EntityManager();
    this.viewport = { x: 0, y: 0, zoom: 1 };
  }

  // Entity management
  addEntity(entity: Entity): void {
    this.entityManager.addEntity(entity);
  }

  removeEntity(id: string): boolean {
    this.selectedEntities.delete(id);
    return this.entityManager.removeEntity(id);
  }

  getEntity(id: string): Entity | undefined {
    return this.entityManager.getEntity(id);
  }

  getAllEntities(): Entity[] {
    return this.entityManager.getAllEntities();
  }

  // Viewport management
  getViewport(): Viewport {
    return { ...this.viewport };
  }

  setViewport(viewport: Partial<Viewport>): void {
    this.viewport = { ...this.viewport, ...viewport };
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenPos: Vector2): Vector2 {
    return {
      x: screenPos.x / this.viewport.zoom + this.viewport.x,
      y: screenPos.y / this.viewport.zoom + this.viewport.y
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldPos: Vector2): Vector2 {
    return {
      x: (worldPos.x - this.viewport.x) * this.viewport.zoom,
      y: (worldPos.y - this.viewport.y) * this.viewport.zoom
    };
  }

  // Selection management
  selectEntity(id: string, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.clearSelection();
    }
    this.selectedEntities.add(id);
    const entity = this.getEntity(id);
    if (entity) {
      entity.selected = true;
    }
  }

  deselectEntity(id: string): void {
    this.selectedEntities.delete(id);
    const entity = this.getEntity(id);
    if (entity) {
      entity.selected = false;
    }
  }

  clearSelection(): void {
    this.selectedEntities.forEach(id => {
      const entity = this.getEntity(id);
      if (entity) {
        entity.selected = false;
      }
    });
    this.selectedEntities.clear();
  }

  getSelectedEntities(): Entity[] {
    return Array.from(this.selectedEntities).map(id => this.getEntity(id)).filter(Boolean) as Entity[];
  }

  getSelectedEntityIds(): string[] {
    return Array.from(this.selectedEntities);
  }

  // Selection box
  startSelection(worldPos: Vector2): void {
    this.isSelecting = true;
    this.selectionStart = worldPos;
    this.selectionEnd = worldPos;
  }

  updateSelection(worldPos: Vector2): void {
    if (this.isSelecting) {
      this.selectionEnd = worldPos;
    }
  }

  finishSelection(addToSelection: boolean = false): void {
    if (this.isSelecting && this.selectionStart && this.selectionEnd) {
      const entitiesInRect = this.entityManager.getEntitiesInRect(this.selectionStart, this.selectionEnd);
      
      if (!addToSelection) {
        this.clearSelection();
      }

      entitiesInRect.forEach(entity => {
        this.selectEntity(entity.id, true);
      });
    }

    this.isSelecting = false;
    this.selectionStart = undefined;
    this.selectionEnd = undefined;
  }

  getSelectionRect(): { start: Vector2; end: Vector2 } | null {
    if (this.isSelecting && this.selectionStart && this.selectionEnd) {
      return {
        start: this.selectionStart,
        end: this.selectionEnd
      };
    }
    return null;
  }

  // Click selection
  selectAtPoint(worldPos: Vector2, addToSelection: boolean = false): boolean {
    const entity = this.entityManager.getEntityAtPoint(worldPos);
    
    if (entity) {
      if (entity.selected && addToSelection) {
        // Deselect if already selected and we're adding to selection
        this.deselectEntity(entity.id);
      } else {
        this.selectEntity(entity.id, addToSelection);
      }
      return true;
    } else if (!addToSelection) {
      this.clearSelection();
    }
    
    return false;
  }

  // Game loop
  update(deltaTime: number): void {
    this.entityManager.update(deltaTime);
    
    // Apply collision avoidance for humans
    const allEntities = this.entityManager.getAllEntities();
    const humans = allEntities.filter(entity => entity instanceof Human) as Human[];
    
    humans.forEach(human => {
      human.avoidCollision(humans);
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Render all entities
    this.entityManager.render(ctx, this.viewport);
    
    // Render selection box
    this.renderSelectionBox(ctx);
  }

  private renderSelectionBox(ctx: CanvasRenderingContext2D): void {
    const selectionRect = this.getSelectionRect();
    if (selectionRect) {
      const startScreen = this.worldToScreen(selectionRect.start);
      const endScreen = this.worldToScreen(selectionRect.end);
      
      const x = Math.min(startScreen.x, endScreen.x);
      const y = Math.min(startScreen.y, endScreen.y);
      const width = Math.abs(endScreen.x - startScreen.x);
      const height = Math.abs(endScreen.y - startScreen.y);
      
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.lineWidth = 1;
      
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    }
  }

  // Get game state (for debugging or saving)
  getGameState(): GameState {
    return {
      entities: new Map(), // We'll populate this if needed
      selectedEntities: new Set(this.selectedEntities),
      viewport: { ...this.viewport },
      isSelecting: this.isSelecting,
      selectionStart: this.selectionStart,
      selectionEnd: this.selectionEnd
    };
  }
} 