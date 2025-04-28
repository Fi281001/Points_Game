import "./App.css";
import { useState, useEffect, ChangeEvent, useRef } from "react";

interface Point {
  id: number;
  x: number;
  y: number;
  visible: boolean;
  clicked?: boolean;
}

function App() {
  const [time, setTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [pendingValue, setPendingValue] = useState<number | string>(0);
  const [click, setClick] = useState<number>(1);
  const [status, setStatus] = useState<
    "LET'S PLAY" | "ALL CLEARED" | "GAME OVER"
  >("LET'S PLAY");
  const [isFirstPlay, setIsFirstPlay] = useState<boolean>(true);

  const timeoutIds = useRef<number[]>([]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseInt(inputValue.replace(/[^0-9]/g, ""), 10); // Chuyển đổi sang số
    setPendingValue(numericValue || 0);
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setTime((prevTime) => parseFloat((prevTime + 0.1).toFixed(1)));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  const handleRestart = () => {
    if (pendingValue === 0) {
      return;
    }

    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];

    setClick(1);
    setStatus("LET'S PLAY");
    setTime(0);
    setPoints([]);
    setIsPlaying(true);
    setHasStarted(true);
    setIsFirstPlay(false);
    generatePoints();
  };

  const generatePoints = () => {
    const numPoints = Number(pendingValue);
    if (numPoints <= 0) {
      setPoints([]);
      return;
    }

    const newPoints = Array.from({ length: numPoints }, (_, index) => ({
      id: index + 1,
      x: Math.random() * 80,
      y: Math.random() * 80,
      visible: true,
      clicked: false,
    }));

    setPoints(newPoints);
  };

  const handleClick = (id: number) => {
    const clickedPoint = points.find((point) => point.id === id);
    if (!clickedPoint || clickedPoint.clicked) return;

    if (id === click) {
      setPoints((prevPoints) =>
        prevPoints.map((point) =>
          point.id === id ? { ...point, clicked: true } : point
        )
      );

      setClick((prevClick) => prevClick + 1);

      const timeoutId = setTimeout(() => {
        setPoints((prevPoints) => {
          const newPoints = prevPoints.filter((point) => point.id !== id);
          if (newPoints.length === 0) {
            // Chỉ khi tất cả điểm đã biến mất thì mới ALL CLEARED
            setStatus("ALL CLEARED");
            setIsPlaying(false);
          }
          return newPoints;
        });
      }, 3000);

      timeoutIds.current.push(timeoutId);
    } else {
      // Nếu click sai
      setPoints((prevPoints) =>
        prevPoints.map((point) =>
          point.id === id ? { ...point, clicked: true } : point
        )
      );
      setStatus("GAME OVER");
      setIsPlaying(false);
      setClick(1);
    }
  };

  return (
    <div className="App">
      <div>
        {status === "LET'S PLAY" && (
          <h4 style={{ color: "black" }}>LET'S PLAY</h4>
        )}
        {status === "ALL CLEARED" && (
          <h4 style={{ color: "green" }}>ALL CLEARED</h4>
        )}
        {status === "GAME OVER" && <h4 style={{ color: "red" }}>GAME OVER!</h4>}

        <label>Points: </label>
        <input value={pendingValue} onChange={handleInput} />
        <br />
        <label>Time: </label>
        <span>{time.toFixed(1)}s</span>
        <br />
        <button onClick={handleRestart}>
          {isFirstPlay ? "Play" : "Restart"}
        </button>
      </div>

      <div className="display">
        {hasStarted &&
          points.map((point) => (
            <button
              key={point.id}
              className="point-button"
              style={{
                position: "absolute",
                top: `${point.y}%`,
                left: `${point.x}%`,
                zIndex: 10000 - point.id,
                backgroundColor: point.clicked ? "#ff0000" : "",
                opacity: point.clicked ? 0.3 : 1,
                transition: "all 0.5s ease",
                padding: "10px",
                borderRadius: "50%",
                border: "none",
                cursor: point.clicked ? "default" : "pointer",
              }}
              onClick={() => handleClick(point.id)}
              disabled={point.clicked}
            >
              {point.id}
            </button>
          ))}
      </div>
    </div>
  );
}

export default App;
