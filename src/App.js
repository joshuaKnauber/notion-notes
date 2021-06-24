import React, { useState, useEffect, useRef } from "react";
import {
  faEraser,
  faSun,
  faTrash,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import Canvas from "./Canvas";
import Button from "./components/Button";
import ColorPicker from "./components/ColorPicker";
import "./App.css";

const App = () => {
  // APP SETTINGS
  const [darkMode, setDarkMode] = useState(false);
  const canvas = useRef();

  // PEN SETTINGS
  const [erasing, setErasing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(10);

  // CANVAS PROPS
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);

  const updateCanvas = (strokes = null) => {
    if (!strokes) {
      strokes = sessionStorage.getItem("strokes");
      if (strokes) {
        strokes = JSON.parse(strokes);
      }
    }

    if (!strokes || strokes.length === 0) return;

    let maxX = window.innerWidth;
    let maxY = window.innerHeight;
    strokes.forEach((stroke) => {
      stroke.path.forEach((point) => {
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    const increase = 250;
    setCanvasWidth(maxX + increase);
    setCanvasHeight(maxY + increase);
  };

  const resize = () => {
    setCanvasWidth(window.innerWidth);
    setCanvasHeight(window.innerHeight);
    updateCanvas();
  };

  useEffect(() => {
    resize();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const clearCanvas = () => {
    sessionStorage.removeItem("strokes");
    window.location.reload();
  };

  const iconColor = darkMode ? "white" : "black";
  const darkToolbar = "#373b3e";
  const lightToolbar = "#eff1f5";
  const background = darkMode ? darkToolbar : lightToolbar;

  return (
    <div
      className="App"
      style={{ backgroundColor: darkMode ? "white" : "black" }}
    >
      <Canvas
        innerRef={canvas}
        strokeWidth={strokeWidth}
        width={canvasWidth}
        height={canvasHeight}
        canvasColor={darkMode ? "black" : "white"}
        strokeColor={strokeColor}
        acceptPointerTypes={["pen", "mouse"]} // in pen, mouse, touch
        callback={updateCanvas}
        erasing={erasing}
      />

      <div className="toolbar" style={{ backgroundColor: background }}>
        <Button
          icon={faSun}
          color={iconColor}
          enabled={!darkMode}
          callback={() => setDarkMode(!darkMode)}
        />
        <Button
          icon={faEraser}
          color={iconColor}
          enabled={erasing}
          callback={() => setErasing(!erasing)}
        />
        <Button
          icon={faTrash}
          color={iconColor}
          enabled={true}
          callback={() => clearCanvas()}
        />
        {["black", "white", "red", "blue"].map((value) => (
          <ColorPicker
            key={value}
            color={value}
            backgroundColor={background}
            callback={setStrokeColor}
            activeColor={strokeColor}
            darkMode={darkMode}
          />
        ))}
        <Button
          icon={faPlus}
          color={iconColor}
          enabled={true}
          callback={() => setStrokeWidth(Math.min(40, strokeWidth + 1))}
        />
        <div className="brushSize">
          <div
            style={{
              width: strokeWidth,
              height: strokeWidth,
              backgroundColor: strokeColor,
              borderRadius: "50%",
            }}
          ></div>
        </div>
        <Button
          icon={faMinus}
          color={iconColor}
          enabled={true}
          callback={() => setStrokeWidth(Math.max(1, strokeWidth - 1))}
        />
      </div>
    </div>
  );
};

export default App;
