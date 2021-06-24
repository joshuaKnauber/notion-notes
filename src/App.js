import React, { useState, useEffect, useRef } from "react";
import { faEraser, faSun, faTrash } from "@fortawesome/free-solid-svg-icons";
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
        {["black", "white", "red", "aqua", "lime", "yellow"].map((value) => (
          <ColorPicker
            key={value}
            color={value}
            backgroundColor={background}
            callback={setStrokeColor}
            activeColor={strokeColor}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
