'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameWorld } from '../core/GameWorld';
import { Human } from '../entities/Human';
import { Resource } from '../entities/Resource';
import { Vector2, EntityType, HumanState } from '../types/game.types';
import { getMousePosition, clamp } from '../utils/canvas.utils';
import { FloatingMenu } from './FloatingMenu';
import { HumansPanel } from './HumansPanel';
import { ResourcesPanel } from './ResourcesPanel';
import { TokensPanel } from './TokensPanel';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

type Tool = 'select' | 'drag' | 'add';

interface Transaction {
  id: string;
  description: string;
  cost: number;
  timestamp: Date;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width, 
  height 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameWorld] = useState(() => new GameWorld());
  const [canvasSize, setCanvasSize] = useState({ width: width || 800, height: height || 600 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  // Mouse and interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Vector2>({ x: 0, y: 0 });
  const [selectedCount, setSelectedCount] = useState(0);
  const [activeTool, setActiveTool] = useState<Tool>('select');

  // Token management state
  const [availableTokens, setAvailableTokens] = useState(300); // Start with 300 tokens
  const [spentTokens, setSpentTokens] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // New: Humans & resources info for UI panels
  const [humansInfo, setHumansInfo] = useState<{ id: string; state: HumanState; selected: boolean }[]>([]);
  const [resourcesInfo, setResourcesInfo] = useState<{ id: string; resourceType: string; amount: number; selected: boolean }[]>([]);
  const lastUiUpdateRef = useRef<number>(0);

  // Panel state management - only one panel can be open at a time
  const [openPanel, setOpenPanel] = useState<'humans' | 'resources' | 'tokens' | null>(null);

  const handlePanelToggle = useCallback((panel: 'humans' | 'resources' | 'tokens') => {
    setOpenPanel(current => current === panel ? null : panel);
  }, []);

  // Selection handlers for panels
  const handleEntitySelect = useCallback((entityId: string, addToSelection: boolean = false) => {
    gameWorld.selectEntity(entityId, addToSelection);
  }, [gameWorld]);

  const handleEntityDeselect = useCallback((entityId: string) => {
    gameWorld.deselectEntity(entityId);
  }, [gameWorld]);

  // Token management functions
  const deductTokens = useCallback((cost: number, description: string) => {
    if (availableTokens >= cost) {
      setAvailableTokens(prev => prev - cost);
      setSpentTokens(prev => prev + cost);
      setTransactions(prev => [...prev, {
        id: `transaction-${Date.now()}`,
        description,
        cost,
        timestamp: new Date()
      }]);
      return true;
    }
    return false;
  }, [availableTokens]);

  // Update canvas size when window resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: width || rect.width,
          height: height || rect.height
        });
      } else if (typeof window !== 'undefined') {
        // Fallback to window size if container is not available
        setCanvasSize({
          width: width || window.innerWidth,
          height: height || window.innerHeight
        });
      }
    };

    updateCanvasSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }
  }, [width, height]);

  // Initialize/Reset game to initial state
  const initializeGame = useCallback(() => {
    // Clear existing entities
    gameWorld.getAllEntities().forEach(entity => {
      gameWorld.removeEntity(entity.id);
    });

    // Reset viewport to center on the world origin using the actual rendered size
    const containerWidth = containerRef.current?.clientWidth ?? canvasSize.width;
    const containerHeight = containerRef.current?.clientHeight ?? canvasSize.height;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Center the viewport so that world origin appears in the middle of the screen
    gameWorld.setViewport({ x: -centerX, y: -centerY, zoom: 1 });

    // Clear all selections and selection state
    gameWorld.clearSelection();

    // Reset UI state
    setActiveTool('select');
    setIsPanning(false);
    setSelectedCount(0);

    // Reset token state
    setAvailableTokens(300);
    setSpentTokens(0);
    setTransactions([]);

    // Add 5 humans at the center of the world (0, 0)
    const radius = 50; // Radius for initial placement
    
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      
      const human = new Human({
        id: `human-${i}`,
        type: EntityType.HUMAN,
        position: {
          x: offsetX,
          y: offsetY
        },
        speed: 50 + Math.random() * 50, // Random speed between 50-100
        state: HumanState.IDLE
      });
      gameWorld.addEntity(human);
    }

    // Add some random resources around the world origin
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200; // Between 100-300 units from center
      const resource = new Resource({
        id: `resource-${i}`,
        type: EntityType.RESOURCE,
        position: {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        },
        resourceType: ['wood', 'stone', 'food'][Math.floor(Math.random() * 3)],
        amount: Math.floor(Math.random() * 50) + 50
      });
      gameWorld.addEntity(resource);
    }
  }, [gameWorld, canvasSize]);

  // Add a new human at a random location
  const addHuman = useCallback(() => {
    // Spawn humans within a reasonable distance from the world origin
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 150; // Between 50-200 units from center
    
    const human = new Human({
      id: `human-${Date.now()}`,
      type: EntityType.HUMAN,
      position: {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      },
      speed: 50 + Math.random() * 50, // Random speed between 50-100
      state: HumanState.IDLE
    });
    gameWorld.addEntity(human);
  }, [gameWorld]);

  // Handle tool change
  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = currentTime;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;

    // Update game state
    gameWorld.update(deltaTime);

    // Render game
    gameWorld.render(ctx);

    // Update UI state
    setSelectedCount(gameWorld.getSelectedEntityIds().length);

    // Throttle UI info updates (every 500ms)
    if (currentTime - lastUiUpdateRef.current > 500) {
      const entities = gameWorld.getAllEntities();
      const humans = entities.filter(e => e instanceof Human) as Human[];
      const resources = entities.filter(e => e instanceof Resource) as Resource[];
      const selectedIds = gameWorld.getSelectedEntityIds();

      setHumansInfo(humans.map(h => ({ id: h.id, state: h.state, selected: selectedIds.includes(h.id) })));
      setResourcesInfo(resources.map(r => ({ id: r.id, resourceType: r.resourceType, amount: r.amount, selected: selectedIds.includes(r.id) })));
      lastUiUpdateRef.current = currentTime;
    }

    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameWorld]);

  // Start game loop
  useEffect(() => {
    initializeGame();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop, initializeGame]);

  // Handle mouse down
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePosition(event.nativeEvent, canvas);
    const worldPos = gameWorld.screenToWorld(mousePos);
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    setLastMousePos(mousePos);

    if (event.button === 0) { // Left click
      if (activeTool === 'drag') {
        // Start panning immediately when drag tool is active
        setIsPanning(true);
      } else if (activeTool === 'select') {
        // Try to select entity first
        const entitySelected = gameWorld.selectAtPoint(worldPos, isCtrlPressed);
        
        if (!entitySelected && !isCtrlPressed) {
          // Start selection box if no entity was selected
          gameWorld.startSelection(worldPos);
        }
      }
    } else if (event.button === 2) { // Right click
      // Set target for selected humans
      const selectedEntities = gameWorld.getSelectedEntities();
      const humansToMove = selectedEntities.filter(entity => entity instanceof Human) as Human[];
      
      if (humansToMove.length > 0) {
        const totalCost = humansToMove.length * 10; // 10 tokens per human
        const humanNames = humansToMove.map(h => h.id).join(', ');
        const description = `Move ${humansToMove.length} human${humansToMove.length > 1 ? 's' : ''} (${humanNames})`;
        
        if (deductTokens(totalCost, description)) {
          humansToMove.forEach(human => {
            human.setTarget(worldPos);
          });
        }
      }
    }
  }, [gameWorld, activeTool, deductTokens]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePosition(event.nativeEvent, canvas);
    const worldPos = gameWorld.screenToWorld(mousePos);

    if (event.buttons === 1) { // Left mouse button is down
      if (isPanning || activeTool === 'drag') {
        // Pan the viewport
        const viewport = gameWorld.getViewport();
        const deltaX = (lastMousePos.x - mousePos.x) / viewport.zoom;
        const deltaY = (lastMousePos.y - mousePos.y) / viewport.zoom;
        
        gameWorld.setViewport({
          x: viewport.x + deltaX,
          y: viewport.y + deltaY
        });
      } else if (activeTool === 'select') {
        // Update selection box
        gameWorld.updateSelection(worldPos);
      }
    }

    setLastMousePos(mousePos);
  }, [isPanning, lastMousePos, gameWorld, activeTool]);

  // Handle mouse up
  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left click
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      
      if (activeTool === 'select') {
        gameWorld.finishSelection(isCtrlPressed);
      }
      
      setIsPanning(false);
    }
  }, [gameWorld, activeTool]);

  // Handle mouse wheel (zoom)
  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePosition(event.nativeEvent, canvas);
    const viewport = gameWorld.getViewport();
    
    // Get world position before zoom
    const worldPosBeforeZoom = gameWorld.screenToWorld(mousePos);
    
    // Normalize wheel delta for consistent zoom speed across different devices
    // Most browsers use deltaY values of ±100 for normal scrolling
    const normalizedDelta = Math.sign(event.deltaY);
    
    // Slower zoom speed: 5% change per wheel event
    const zoomSpeed = 0.05;
    const zoomFactor = normalizedDelta > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);
    const newZoom = clamp(viewport.zoom * zoomFactor, 0.1, 5);
    
    // Update zoom
    gameWorld.setViewport({ zoom: newZoom });
    
    // Get world position after zoom (this will be different due to zoom change)
    const worldPosAfterZoom = gameWorld.screenToWorld(mousePos);
    
    // Calculate the difference and adjust viewport to keep mouse position fixed
    const deltaX = worldPosBeforeZoom.x - worldPosAfterZoom.x;
    const deltaY = worldPosBeforeZoom.y - worldPosAfterZoom.y;
    
    // Apply the adjustment to keep the world position under the cursor constant
    gameWorld.setViewport({
      x: viewport.x + deltaX,
      y: viewport.y + deltaY
    });
  }, [gameWorld]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  }, []);

  // Prevent browser zoom on the canvas
  useEffect(() => {
    const handleWheelPassive = (event: WheelEvent) => {
      // Check if the event target is our canvas
      if (event.target === canvasRef.current) {
        event.preventDefault();
      }
    };

    // Add wheel event listener with passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheelPassive, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheelPassive);
    };
  }, []);

  // Handle key presses
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent browser zoom shortcuts when canvas is focused
      if (document.activeElement === canvasRef.current || 
          containerRef.current?.contains(document.activeElement)) {
        if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '0')) {
          event.preventDefault();
        }
      }

      switch (event.key) {
        case 'Escape':
          gameWorld.clearSelection();
          break;
        case 'r':
        case 'R':
          initializeGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [initializeGame, gameWorld]);

  return (
    <div 
      ref={containerRef} 
      className="game-container relative w-screen h-screen"
      style={{
        // Prevent touch zoom on mobile devices
        touchAction: 'none',
        // Ensure the container fills its parent
        position: 'relative',
        // Prevent user selection
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        className="block cursor-crosshair relative top-0 left-0 w-screen h-screen"
        style={{ 
          backgroundColor: '#fafafa',
          imageRendering: 'pixelated',
          // Prevent touch actions on the canvas
          touchAction: 'none',
          // Ensure canvas doesn't have any transform from parent
          transform: 'none',
        }}
        tabIndex={0}
      />
      
      <FloatingMenu
        onAddHuman={addHuman}
        onReset={initializeGame}
        selectedCount={selectedCount}
        zoom={gameWorld.getViewport().zoom}
        activeTool={activeTool}
        onToolChange={handleToolChange}
      />

      {/* Top-right floating panels */}
      <HumansPanel
        humans={humansInfo}
        open={openPanel === 'humans'}
        onToggle={handlePanelToggle}
        onSelect={handleEntitySelect}
        onDeselect={handleEntityDeselect}
      />
      <ResourcesPanel
        resources={resourcesInfo}
        open={openPanel === 'resources'}
        onToggle={handlePanelToggle}
        onSelect={handleEntitySelect}
        onDeselect={handleEntityDeselect}
      />
      <TokensPanel
        availableTokens={availableTokens}
        spentTokens={spentTokens}
        transactions={transactions}
        open={openPanel === 'tokens'}
        onToggle={handlePanelToggle}
      />
    </div>
  );
}; 