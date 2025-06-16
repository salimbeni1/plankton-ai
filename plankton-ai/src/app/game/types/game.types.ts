export interface Vector2 {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export enum EntityType {
  HUMAN = 'human',
  RESOURCE = 'resource',
}

export enum HumanState {
  IDLE = 'idle',
  MOVING = 'moving',
  SELECTED = 'selected',
}

export interface EntityConfig {
  id: string;
  position: Vector2;
  type: EntityType;
}

export interface HumanConfig extends EntityConfig {
  type: EntityType.HUMAN;
  speed: number;
  target?: Vector2;
  state: HumanState;
}

export interface ResourceConfig extends EntityConfig {
  type: EntityType.RESOURCE;
  resourceType: string;
  amount: number;
}

export interface GameState {
  entities: Map<string, EntityConfig>;
  selectedEntities: Set<string>;
  viewport: Viewport;
  isSelecting: boolean;
  selectionStart?: Vector2;
  selectionEnd?: Vector2;
} 