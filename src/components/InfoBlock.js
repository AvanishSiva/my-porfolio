import React from "react";
import "./Hero.css";

export default function InfoBlock({ text, align }) {
  return (
    <p className={`info-block ${align === "right" ? "align-right" : "align-left"}`}>
      {text}
    </p>
  );
}
