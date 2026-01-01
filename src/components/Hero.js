import React from "react";
import { useNavigate } from "react-router-dom";
import NameRow from "./NameRow";
import InfoBlock from "./InfoBlock";
import RoleRotator from "./RoleRotator";
import ScrollDown from "./ScrollDown";
import "./Hero.css";

export default function Hero() {
  const name = "Sivaavanish";
  const navigate = useNavigate();

  return (
    <div className="hero">
      <NameRow name={name} />

      <div className="hero-info">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <InfoBlock
            text="I write code, break it, fix it, and repeat — been doing it for 3 years, and wouldn't have it any other way."
            align="left"
          />
          <button className="recap-button" onClick={() => navigate('/2025-recap')}>
            Check out my 2025 Wrapped ✨
          </button>
        </div>
        <InfoBlock text={<RoleRotator />} align="right" />
      </div>
      <ScrollDown />
    </div>
  );
}