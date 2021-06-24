import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Button = ({ icon, enabled, callback, color }) => {
  return (
    <button onClick={() => callback()} className={enabled ? "on" : ""}>
      <FontAwesomeIcon icon={icon} className="icon" style={{ color: color }} />
    </button>
  );
};

export default Button;
