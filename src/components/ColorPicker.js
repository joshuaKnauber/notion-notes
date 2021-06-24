import React, { useState, useEffect, useRef } from "react";

const ColorPicker = ({
  color,
  activeColor,
  backgroundColor,
  darkMode,
  callback,
}) => {
  return (
    <div
      onClick={() => callback(color)}
      className={"color"}
      style={{
        backgroundColor: color,
        boxShadow:
          activeColor === color
            ? `0 0 0 3px ${backgroundColor}, 0 0 0 4.5px ${
                darkMode ? "white" : "black"
              }`
            : "none",
      }}
    ></div>
  );
};

export default ColorPicker;
