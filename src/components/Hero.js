import React from "react";
import NameRow from "./NameRow";
import InfoBlock from "./InfoBlock";
import RoleRotator from "./RoleRotator";
import ScrollDown from "./ScrollDown";
import "./Hero.css";

export default function Hero() {
  const name = "Sivaavanish";

  return (
    // Remove the section wrapper - it's now handled by App.jsx
    <div className="hero">
      {/* Giant Name */}
      <NameRow name={name} />

      {/* Info + Role */}
      <div className="hero-info">
        <InfoBlock
          text="I write code, break it, fix it, and repeat — been doing it for 3 years, and wouldn't have it any other way."
          align="left"
        />
        <InfoBlock text={<RoleRotator />} align="right" />
      </div>
      <ScrollDown />
    </div>
  );
}