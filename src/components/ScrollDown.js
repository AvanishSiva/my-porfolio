import React from "react";
import "./Hero.css";

export default function ScrollDown() {
  return (
    <div className="scroll-down">
      {/* Icon (chevron) */}
      <div className="scroll-icon">⌄</div>
      {/* Text */}
      <div className="scroll-text">Scroll Down</div>
    </div>
  );
}
