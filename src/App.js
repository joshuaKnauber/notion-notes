import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faSun } from "@fortawesome/free-solid-svg-icons";
import Canvas from "./Canvas";
import "./App.css";

const App = () => {
  // APP SETTINGS
  const [darkMode, setDarkMode] = useState(false);
  const canvas = useRef();

  // PEN SETTINGS
  const [erasing, setErasing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(10);
  const [eraserWidth, setEraserWidth] = useState(8);

  // CANVAS PROPS
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);

  const updateCanvas = (strokes) => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    const lastPathPoint = lastStroke.path[lastStroke.path.length - 1];

    const increaseSize = 150;
    const increaseThreshold = 50;

    if (lastPathPoint.x > canvasWidth - increaseThreshold) {
      setCanvasWidth(canvasWidth + increaseSize);
    }
    if (lastPathPoint.y > canvasHeight - increaseThreshold) {
      setCanvasHeight(canvasHeight + increaseSize);
    }
  };

  useEffect(() => {
    setCanvasWidth(window.innerWidth);
    setCanvasHeight(window.innerHeight);
  }, []);

  let iconColor = darkMode ? "white" : "black";
  let darkToolbar = "#373b3e";
  let lightToolbar = "#edf1f7";

  const drawColor = (value) => {
    return (
      <div
        onClick={() => setStrokeColor(value)}
        className={"color"}
        style={{
          backgroundColor: value,
          boxShadow:
            strokeColor === value
              ? `0 0 0 3px ${
                  darkMode ? darkToolbar : lightToolbar
                }, 0 0 0 4.5px ${darkMode ? "white" : "black"}`
              : "none",
        }}
      ></div>
    );
  };

  return (
    <div
      className="App"
      style={{ backgroundColor: darkMode ? "white" : "black" }}
    >
      <Canvas
        strokeWidth={strokeWidth}
        width={canvasWidth}
        height={canvasHeight}
        canvasColor={darkMode ? "black" : "white"}
        strokeColor={strokeColor}
        acceptPointerTypes={["pen", "mouse"]} // in pen, mouse, touch
        callback={updateCanvas}
        erasing={erasing}
      />

      <div
        className="toolbar"
        style={{ backgroundColor: darkMode ? darkToolbar : lightToolbar }}
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={!darkMode ? "on" : ""}
        >
          <FontAwesomeIcon
            icon={faSun}
            className="icon"
            style={{ color: iconColor }}
          />
        </button>
        <button
          onClick={() => setErasing(!erasing)}
          className={erasing ? "on" : ""}
        >
          <FontAwesomeIcon
            icon={faEraser}
            className="icon"
            style={{ color: iconColor }}
          />
        </button>
        {drawColor("black")}
        {drawColor("white")}
        {drawColor("red")}
        {drawColor("aqua")}
        {drawColor("lime")}
        {drawColor("yellow")}
      </div>
    </div>
  );
};

export default App;
