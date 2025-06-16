import { Entity } from '../core/Entity';
import { Vector2, EntityType, HumanState, HumanConfig } from '../types/game.types';

export class Human extends Entity {
  public speed: number;
  public target?: Vector2;
  public state: HumanState;
  private color: string;
  private animationTime: number = 0;
  private walkCycle: number = 0;
  private facingDirection: 'left' | 'right' = 'right';
  private speechBubbleTimer: number = 0;
  private showSpeechBubble: boolean = false;
  private speechBubbleInterval: number = 5 + Math.random() * 10; // Random interval between 5-15 seconds
  
  constructor(config: HumanConfig) {
    super(config);
    this.speed = config.speed;
    this.target = config.target;
    this.state = config.state;
    this.color = this.generateRandomColor();
  }

  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(deltaTime: number): void {
    // Update animation time
    this.animationTime += deltaTime;
    
    // Update speech bubble timer for idle humans
    if (this.state === HumanState.IDLE) {
      this.speechBubbleTimer += deltaTime;
      
      if (this.speechBubbleTimer >= this.speechBubbleInterval) {
        this.showSpeechBubble = true;
        // Reset timer after 2 seconds
        if (this.speechBubbleTimer >= this.speechBubbleInterval + 2) {
          this.speechBubbleTimer = 0;
          this.showSpeechBubble = false;
          // Randomize next interval
          this.speechBubbleInterval = 5 + Math.random() * 10;
        }
      }
    } else {
      // Reset speech bubble when moving
      this.speechBubbleTimer = 0;
      this.showSpeechBubble = false;
    }
    
    if (this.target && this.state === HumanState.MOVING) {
      const dx = this.target.x - this.position.x;
      const dy = this.target.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update facing direction based on movement
      if (Math.abs(dx) > 0.1) {
        this.facingDirection = dx > 0 ? 'right' : 'left';
      }

      // Update walk cycle for animation
      this.walkCycle = (this.animationTime * 8) % (Math.PI * 2);

      // If we're close enough to the target, stop moving
      if (distance < 2) {
        this.position.x = this.target.x;
        this.position.y = this.target.y;
        this.target = undefined;
        this.state = HumanState.IDLE;
        this.walkCycle = 0;
      } else {
        // Move towards target
        const moveDistance = this.speed * deltaTime;
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        this.position.x += normalizedDx * moveDistance;
        this.position.y += normalizedDy * moveDistance;
      }
    } else {
      // Reset walk cycle when idle
      this.walkCycle = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D, viewport: { x: number; y: number; zoom: number }): void {
    const screenPos = this.getScreenPosition(viewport);
    const scale = viewport.zoom;
    
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    
    // Flip horizontally if facing left
    if (this.facingDirection === 'left') {
      ctx.scale(-1, 1);
    }

    // Draw cute human figure
    this.drawCuteHuman(ctx, scale);

    ctx.restore();

    // Draw selection indicator
    if (this.selected) {
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 10 * scale, 20 * scale, 0, 2 * Math.PI);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw target line if moving
    if (this.target && this.state === HumanState.MOVING) {
      const targetScreenPos = {
        x: (this.target.x - viewport.x) * viewport.zoom,
        y: (this.target.y - viewport.y) * viewport.zoom
      };

      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(targetScreenPos.x, targetScreenPos.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw target indicator
      ctx.beginPath();
      ctx.arc(targetScreenPos.x, targetScreenPos.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    // Draw speech bubble if showing
    if (this.showSpeechBubble) {
      this.drawSpeechBubble(ctx, screenPos, scale);
    }
  }

  private drawCuteHuman(ctx: CanvasRenderingContext2D, scale: number): void {
    const isWalking = this.state === HumanState.MOVING;
    const legSwing = isWalking ? Math.sin(this.walkCycle) * 0.3 : 0;
    const armSwing = isWalking ? Math.sin(this.walkCycle + Math.PI) * 0.2 : 0;
    const bodyBounce = isWalking ? Math.abs(Math.sin(this.walkCycle * 2)) * 2 : 0;

    // Head
    ctx.beginPath();
    ctx.arc(0, -20 * scale + bodyBounce, 8 * scale, 0, 2 * Math.PI);
    ctx.fillStyle = '#FDBCB4'; // Peach color for skin
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-3 * scale, -20 * scale + bodyBounce, 1.5 * scale, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3 * scale, -20 * scale + bodyBounce, 1.5 * scale, 0, 2 * Math.PI);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(0, -18 * scale + bodyBounce, 4 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -12 * scale + bodyBounce);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(0, -8 * scale + bodyBounce);
    ctx.lineTo(-8 * scale + armSwing * 5 * scale, -2 * scale + bodyBounce);
    ctx.moveTo(0, -8 * scale + bodyBounce);
    ctx.lineTo(8 * scale - armSwing * 5 * scale, -2 * scale + bodyBounce);
    ctx.strokeStyle = '#FDBCB4';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5 * scale + legSwing * 8 * scale, 10 * scale);
    ctx.moveTo(0, 0);
    ctx.lineTo(5 * scale - legSwing * 8 * scale, 10 * scale);
    ctx.strokeStyle = '#4169E1'; // Blue jeans
    ctx.lineWidth = 2.5 * scale;
    ctx.stroke();

    // Feet
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(-5 * scale + legSwing * 8 * scale, 12 * scale, 3 * scale, 2 * scale, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 * scale - legSwing * 8 * scale, 12 * scale, 3 * scale, 2 * scale, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  private drawSpeechBubble(ctx: CanvasRenderingContext2D, screenPos: Vector2, scale: number): void {
    const bubbleX = screenPos.x + 15 * scale;
    const bubbleY = screenPos.y - 35 * scale;
    const bubbleWidth = 30 * scale;
    const bubbleHeight = 20 * scale;
    const radius = 5 * scale;
    
    // Draw bubble background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Bubble body (manual rounded rectangle for compatibility)
    ctx.beginPath();
    const x = bubbleX - bubbleWidth/2;
    const y = bubbleY - bubbleHeight/2;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + bubbleWidth - radius, y);
    ctx.quadraticCurveTo(x + bubbleWidth, y, x + bubbleWidth, y + radius);
    ctx.lineTo(x + bubbleWidth, y + bubbleHeight - radius);
    ctx.quadraticCurveTo(x + bubbleWidth, y + bubbleHeight, x + bubbleWidth - radius, y + bubbleHeight);
    ctx.lineTo(x + radius, y + bubbleHeight);
    ctx.quadraticCurveTo(x, y + bubbleHeight, x, y + bubbleHeight - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(bubbleX - 5 * scale, bubbleY + bubbleHeight/2);
    ctx.lineTo(bubbleX - 10 * scale, bubbleY + bubbleHeight/2 + 5 * scale);
    ctx.lineTo(bubbleX, bubbleY + bubbleHeight/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#333';
    ctx.font = `${12 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Hi!', bubbleX, bubbleY);
  }

  // Set target position and start moving
  setTarget(target: Vector2): void {
    this.target = { ...target };
    this.state = HumanState.MOVING;
  }

  // Stop moving
  stop(): void {
    this.target = undefined;
    this.state = HumanState.IDLE;
  }

  // Check if human is moving
  isMoving(): boolean {
    return this.state === HumanState.MOVING && this.target !== undefined;
  }

  // Get current target (for debugging)
  getTarget(): Vector2 | undefined {
    return this.target ? { ...this.target } : undefined;
  }

  // Create a new human at random position
  static createRandom(id: string, bounds: { width: number; height: number }): Human {
    return new Human({
      id,
      type: EntityType.HUMAN,
      position: {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height
      },
      speed: 50 + Math.random() * 50, // Random speed between 50-100
      state: HumanState.IDLE
    });
  }

  // Add method to avoid collision with other humans
  avoidCollision(otherHumans: Human[]): void {
    const avoidanceRadius = 30; // Minimum distance between humans
    const pushForce = 5; // How strongly to push away
    
    otherHumans.forEach(other => {
      if (other.id === this.id) return;
      
      const dx = this.position.x - other.position.x;
      const dy = this.position.y - other.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < avoidanceRadius && distance > 0) {
        // Push away from other human
        const pushX = (dx / distance) * (avoidanceRadius - distance) * pushForce / avoidanceRadius;
        const pushY = (dy / distance) * (avoidanceRadius - distance) * pushForce / avoidanceRadius;
        
        this.position.x += pushX;
        this.position.y += pushY;
      }
    });
  }
} 