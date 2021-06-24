import React, { useState, useEffect, useRef, useCallback } from "react";
import { CurveInterpolator } from "curve-interpolator";
import "./App.css";

const Canvas = ({
  strokeWidth = 4,
  erasing = false,
  width = 500,
  height = 500,
  canvasColor = "white",
  strokeColor = "black",
  acceptPointerTypes = ["pen", "mouse"],
  callback = null,
}) => {
  // CANVAS PROPS
  const canvas = useRef();
  const svgCanvas = useRef();

  let drawing = false;
  let prevPoint = null;
  let currentStroke = null;
  const [svgStrokes, setSvgStrokes] = useState([]);
  const [loadedStrokes, setLoadedStrokes] = useState(false);
  const [circles, setCircles] = useState([]);

  const cvs = () => {
    return canvas.current;
  };

  const ctx = () => {
    return cvs().getContext("2d");
  };

  const adjustPointDensity = (points) => {
    return points;
    const density = 5;
    let newPoints = [];
    let cs = [];
    points.forEach((point, index) => {
      if (index > 0 && index < points.length - 1) {
        const next = points[index + 1];
        const distNext = Math.sqrt(
          Math.pow(next.x - point.x, 2) + Math.pow(next.y - point.y, 2)
        );
        const pointAmount = Math.floor(distNext / density);
        if (pointAmount > 0) {
          console.log(pointAmount);
          for (let i = 1; i <= distNext / density; i++) {
            const newPoint = JSON.parse(JSON.stringify(point));
            newPoint.x = point.x + ((next.x - point.x) * i) / pointAmount;
            newPoint.y = point.y + ((next.y - point.y) * i) / pointAmount;
            newPoints.push(newPoint);
          }
        }
      }
      cs.push(<circle cx={point.x} cy={point.y} r="2" fill="red" />);
      newPoints.push(point);
    });
    // setCircles(cs);
    return newPoints;
  };

  const smoothPressure = (points) => {
    // get extreme points in pressure
    let extremesIndices = [0, points.length - 1];
    let lastValue = 0;
    let trendUp = true;
    points.forEach((point, index) => {
      if (point.pressure > lastValue && !trendUp) {
        extremesIndices.push(index);
        trendUp = true;
      } else if (point.pressure < lastValue && trendUp) {
        extremesIndices.push(index);
        trendUp = false;
      }
      lastValue = point.pressure;
    });
    extremesIndices = [...new Set(extremesIndices)];
    extremesIndices.sort((a, b) => a - b);

    // apply gradient to other points
    points.forEach((point, index) => {
      if (!extremesIndices.includes(index)) {
        let below = 0;
        let found = false;
        extremesIndices.forEach((extreme) => {
          if (extreme < index) {
            below = extreme;
          } else if (extreme > index && !found) {
            found = true;
            let factor = (index - below) / (extreme - below);
            if (points[extreme].pressure < points[below].pressure) {
              factor = 1 - factor;
            }
            point.pressure =
              Math.min(points[extreme].pressure, points[below].pressure) +
              Math.abs(points[extreme].pressure - points[below].pressure) *
                factor;
          }
        });
      }
    });

    return points;
  };

  const smoothStroke = (stroke) => {
    let newPoints = stroke.path.filter(
      (point) => point !== null && point.pressure > 0
    );
    if (stroke.path.length > 0) {
      stroke.path = smoothPressure(adjustPointDensity(newPoints));
    }
    return stroke;
  };

  useEffect(() => {
    if (callback) callback(svgStrokes);
    ctx().clearRect(0, 0, width, height);

    if (loadedStrokes) {
      sessionStorage.setItem("strokes", JSON.stringify(svgStrokes));
    }
  }, [svgStrokes]);

  const finishStroke = () => {
    if (currentStroke && !erasing) {
      currentStroke = smoothStroke(currentStroke);
      if (currentStroke.path.length > 0) {
        setSvgStrokes((strokes) => [...strokes, currentStroke]);
      }
    }
  };

  const makeStrokePoint = (e) => {
    if (!acceptPointerTypes.includes(e.pointerType)) return null;
    return {
      x: e.clientX,
      y: e.clientY,
      pressure: e.pressure,
      pointerType: e.pointerType,
      timeStamp: e.timeStamp,
    };
  };

  const erase = (point) => {
    if (!erasing) return;
    let elements = document.elementsFromPoint(point.x, point.y);
    let deleteIndex = null;
    elements.forEach((element) => {
      if (element && element.nodeName == "path") {
        Array.from(svgCanvas.current.children).forEach((container, index) => {
          Array.from(container.children).forEach((path) => {
            if (path.getAttribute("d") === element.getAttribute("d")) {
              deleteIndex = index;
            }
          });
        });
      }
    });
    if (deleteIndex !== null) {
      let newStrokes = Array.from(svgStrokes).filter(
        (item, index) => index !== deleteIndex
      );
      setSvgStrokes(newStrokes);
    }
  };

  const draw = (firstPoint, lastPoint) => {
    if (erasing) return;

    ctx().beginPath();
    ctx().strokeStyle = strokeColor;
    ctx().lineWidth = Math.floor(
      ((firstPoint.pressure + lastPoint.pressure) / 2) * strokeWidth
    );
    ctx().moveTo(firstPoint.x, firstPoint.y);
    ctx().lineTo(lastPoint.x, lastPoint.y);
    ctx().stroke();

    currentStroke.path.push(lastPoint);
  };

  const startDrawing = (strokePoint) => {
    if (!strokePoint) return;
    drawing = true;
    currentStroke = {
      color: strokeColor,
      strokeWidth: strokeWidth,
      path: [strokePoint],
    };
    prevPoint = strokePoint;
  };

  const keepDrawing = (strokePoint, evt) => {
    if (erasing && evt.buttons === 1) erase(strokePoint);

    if (!drawing || !strokePoint) return;
    draw(prevPoint, strokePoint);
    prevPoint = strokePoint;
  };

  const endDrawing = (strokePoint) => {
    if (!drawing || !strokePoint) return;
    draw(prevPoint, strokePoint);
    drawing = false;
    prevPoint = null;

    finishStroke();
  };

  const cancelDrawing = () => {
    drawing = false;

    finishStroke();
  };

  const [enableSmoothing, setEnableSmoothing] = useState(false);
  const [tension, setTension] = useState(0.1);
  const makePaths = () => {
    let strokes = [];
    svgStrokes.forEach((stroke, sI) => {
      const points = stroke.path.map((point) => [point.x, point.y]);
      const interp = new CurveInterpolator(points, { tension: tension });
      const allPts = interp.getPoints(points.length * 2);
      const paths = stroke.path.map((point, pI) => {
        if (pI > 0) {
          const prev = allPts[pI * 2 - 1];
          const curr = allPts[pI * 2];
          const next = allPts[pI * 2 + 1];
          let d = `M${prev[0]},${prev[1]} ${next[0]},${next[1]}`;
          if (enableSmoothing) {
            d = `M${prev[0]},${prev[1]} Q${curr[0]},${curr[1]} ${next[0]},${next[1]}`;
          }
          return (
            <path
              key={pI}
              strokeWidth={point.pressure * stroke.strokeWidth}
              strokeLinecap="round"
              d={d}
            />
          );
        }
      });
      strokes.push(
        <g key={sI} fill="none" stroke={stroke.color}>
          {paths}
        </g>
      );
    });
    return strokes;
  };

  useEffect(() => {
    ctx().lineJoin = "round";
    ctx().lineCap = "round";

    const storedStrokes = sessionStorage.getItem("strokes");
    if (storedStrokes) {
      setSvgStrokes(JSON.parse(storedStrokes));
    }
    setLoadedStrokes(true);
  }, []);

  return (
    <div
      className="canvasContainer"
      onPointerDown={(e) => startDrawing(makeStrokePoint(e))}
      onPointerMove={(e) => keepDrawing(makeStrokePoint(e), e)}
      onPointerUp={(e) => endDrawing(makeStrokePoint(e))}
      onPointerLeave={(e) => cancelDrawing()}
      onPointerCancel={(e) => cancelDrawing()}
    >
      <canvas
        width={width}
        height={height}
        style={{
          backgroundColor: canvasColor,
          zIndex: 2,
        }}
        ref={canvas}
      ></canvas>

      <svg
        ref={svgCanvas}
        className="svgCanvas"
        width={width}
        height={height}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        {makePaths()}
        {circles}
      </svg>

      <button
        onClick={() => setEnableSmoothing(!enableSmoothing)}
        style={{ position: "fixed", zIndex: 100, top: 0, left: 0 }}
      >
        smoothing: {JSON.stringify(enableSmoothing)}
      </button>
      <input
        type="number"
        onChange={(e) => setTension(parseFloat(e.target.value))}
        style={{ position: "fixed", zIndex: 100, top: 0, left: 150 }}
        value={tension}
      />
    </div>
  );
};

export default Canvas;
