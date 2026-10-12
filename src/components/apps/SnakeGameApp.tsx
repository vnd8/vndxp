import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../utils/audio';

type Position = { x: number; y: number };

const GRID_SIZE = 18;
const INITIAL_SNAKE: Position[] = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];

const FOOD_ITEMS = [
  { short: 'Ae', name: 'After Effects', bg: '#00005b', text: '#9999ff', points: 15 },
  { short: 'Da', name: 'DaVinci Resolve', bg: '#1a1a1a', text: '#ff4b4b', points: 20 },
  { short: 'Ps', name: 'Photoshop', bg: '#001e36', text: '#31a8ff', points: 10 },
  { short: 'Ai', name: 'Illustrator', bg: '#330000', text: '#ff9a00', points: 10 },
];

export const SnakeGameApp: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [food, setFood] = useState<{ pos: Position; item: typeof FOOD_ITEMS[0] }>({
    pos: { x: 12, y: 9 },
    item: FOOD_ITEMS[0],
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('anes_snake_highscore') || 0);
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const spawnFood = useCallback((currentSnake: Position[]) => {
    let newPos: Position;
    let collision: boolean;
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision = currentSnake.some((s) => s.x === newPos.x && s.y === newPos.y);
    } while (collision);

    const randomItem = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
    return { pos: newPos, item: randomItem };
  }, []);

  const resetGame = () => {
    sound.playStartup();
    setSnake(INITIAL_SNAKE);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(spawnFood(INITIAL_SNAKE));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        setIsPaused((prev) => !prev);
        return;
      }

      const curr = directionRef.current;
      if (e.key === 'ArrowUp' && curr.y === 0) {
        sound.playClick();
        setDirection({ x: 0, y: -1 });
      } else if (e.key === 'ArrowDown' && curr.y === 0) {
        sound.playClick();
        setDirection({ x: 0, y: 1 });
      } else if (e.key === 'ArrowLeft' && curr.x === 0) {
        sound.playClick();
        setDirection({ x: -1, y: 0 });
      } else if (e.key === 'ArrowRight' && curr.x === 0) {
        sound.playClick();
        setDirection({ x: 1, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game tick
  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const dir = directionRef.current;
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall collision check
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          sound.playAlert();
          setGameOver(true);
          return prevSnake;
        }

        // Self collision check
        if (prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
          sound.playAlert();
          setGameOver(true);
          return prevSnake;
        }

        // Check food eaten
        const ateFood = newHead.x === food.pos.x && newHead.y === food.pos.y;
        if (ateFood) {
          sound.playWindowOpen();
          const newScore = score + food.item.points;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('anes_snake_highscore', String(newScore));
          }
          const nextSnake = [newHead, ...prevSnake];
          setFood(spawnFood(nextSnake));
          return nextSnake;
        }

        // Regular move
        return [newHead, ...prevSnake.slice(0, -1)];
      });
    }, 130);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, food, score, highScore, spawnFood]);

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] select-none font-sans text-xs p-3 items-center justify-between gap-2 overflow-y-auto">
      {/* Big Red Error / Warning Banner requested by user */}
      <div className="w-full bg-[#d32f2f] text-white px-3 py-2.5 rounded border-2 border-[#b71c1c] shadow-md flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-lg shrink-0 shadow-inner">
          🛑
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-xs sm:text-[13px] tracking-wide text-white drop-shadow-sm leading-tight">
            You cannot run Adobe Premiere on a browser, but you can play this game!
          </div>
          <div className="text-[10.5px] text-amber-200 font-medium mt-0.5 leading-tight">
            System Notice: Full Premiere Pro requires high-end GPU & RAM. Enjoy the Pr Timeline Snake instead!
          </div>
        </div>
      </div>

      {/* Game Info Bar */}
      <div className="w-full flex items-center justify-between bg-white px-3 py-1.5 rounded border border-[#7f9db9] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#300059] flex items-center gap-1.5">
            <span className="w-4 h-4 bg-[#300059] border border-[#ea77ff] text-[#ea77ff] rounded-[2px] font-black text-[9px] flex items-center justify-center">
              Pr
            </span>
            <span>Adobe Premiere Snake</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
            Eats: [Ae] [Da] [Ps] [Ai]
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono font-bold text-xs">
          <span className="text-blue-800">Score: {score}</span>
          <span className="text-amber-700">Best: {highScore}</span>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="relative my-2 w-[288px] h-[288px] sm:w-[324px] sm:h-[324px] bg-[#1a1a24] rounded border-2 border-[#003c74] xp-bevel-inset overflow-hidden shadow-inner">
        {/* Grid Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);

          const isHead = snake[0].x === x && snake[0].y === y;
          const bodyIndex = snake.findIndex((s, i) => i > 0 && s.x === x && s.y === y);
          const isFood = food.pos.x === x && food.pos.y === y;

          return (
            <div
              key={idx}
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(x * 100) / GRID_SIZE}%`,
                top: `${(y * 100) / GRID_SIZE}%`,
              }}
              className="absolute flex items-center justify-center p-[1px]"
            >
              {isHead ? (
                /* Snake Head: Adobe Premiere Pro Icon [Pr] */
                <div className="w-full h-full rounded-[2px] bg-[#300059] border border-[#ea77ff] text-[#ea77ff] font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-md animate-pulse">
                  Pr
                </div>
              ) : bodyIndex > 0 ? (
                /* Snake Body Segments */
                <div
                  className="w-full h-full rounded-[2px] bg-gradient-to-br from-[#7e57c2] to-[#512da8] border border-[#ea77ff]/40 shadow-xs"
                  style={{ opacity: Math.max(0.4, 1 - bodyIndex * 0.04) }}
                />
              ) : isFood ? (
                /* Food: The tool to eat! (Ae, Da, Ps, Ai) */
                <div
                  className="w-full h-full rounded-[2px] flex items-center justify-center font-black text-[8px] sm:text-[9px] shadow-lg animate-bounce"
                  style={{
                    backgroundColor: food.item.bg,
                    color: food.item.text,
                    border: `1px solid ${food.item.text}`,
                  }}
                  title={food.item.name}
                >
                  {food.item.short}
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white z-20">
            <h3 className="font-black text-base text-red-500 mb-1">GAME OVER!</h3>
            <p className="text-xs text-neutral-300 mb-1">
              Final Score: <strong className="text-[#ffe09e]">{score}</strong>
            </p>
            <p className="text-[11px] text-neutral-400 mb-3">
              {score >= 100 ? '🔥 Certified Video Editor Level!' : 'Keep editing and collecting software!'}
            </p>
            <button
              onClick={resetGame}
              className="px-4 py-1.5 bg-[#0058e6] hover:bg-[#1a6cf0] text-white font-bold rounded text-xs shadow-md cursor-pointer"
            >
              Play Again 🔄
            </button>
          </div>
        )}
      </div>

      {/* On-screen Controls (for touch & quick click) */}
      <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-neutral-300">
        <div className="text-[11px] text-neutral-600">
          Controls: Arrow Keys | Space = Pause
        </div>

        {/* Virtual D-pad */}
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button
            onClick={() => {
              if (directionRef.current.y === 0) setDirection({ x: 0, y: -1 });
            }}
            className="w-7 h-7 bg-white hover:bg-neutral-100 rounded border border-neutral-400 font-bold flex items-center justify-center text-xs cursor-pointer shadow-xs"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => {
              if (directionRef.current.x === 0) setDirection({ x: -1, y: 0 });
            }}
            className="w-7 h-7 bg-white hover:bg-neutral-100 rounded border border-neutral-400 font-bold flex items-center justify-center text-xs cursor-pointer shadow-xs"
          >
            ◀
          </button>
          <button
            onClick={() => {
              if (directionRef.current.y === 0) setDirection({ x: 0, y: 1 });
            }}
            className="w-7 h-7 bg-white hover:bg-neutral-100 rounded border border-neutral-400 font-bold flex items-center justify-center text-xs cursor-pointer shadow-xs"
          >
            ▼
          </button>
          <button
            onClick={() => {
              if (directionRef.current.x === 0) setDirection({ x: 1, y: 0 });
            }}
            className="w-7 h-7 bg-white hover:bg-neutral-100 rounded border border-neutral-400 font-bold flex items-center justify-center text-xs cursor-pointer shadow-xs"
          >
            ▶
          </button>
        </div>

        <button
          onClick={resetGame}
          className="px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-400 rounded text-xs font-semibold cursor-pointer shadow-xs"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
