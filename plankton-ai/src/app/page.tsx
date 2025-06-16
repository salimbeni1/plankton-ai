import { GameCanvas } from './game/components/GameCanvas';

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <GameCanvas />
    </div>
  );
}
