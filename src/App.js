import React, { useEffect, useState } from "react";
import Hero from "./components/Hero";
import "./App.css";
import Dock from "./components/Docker/Dock";

export default function App() {

  return (
    <div className="app">
      {/* Hero section - always visible */}
      <Dock />
      <div >
        <Hero />
      </div>

      <div >
        <h1>About Me</h1>
      </div>

      <div >
        <h1>Education</h1>
      </div>

      <div >
        <h1>Projects</h1>
      </div>

      <div >
        <h1>Projects</h1>
      </div>
        <Dock />
    </div>
  );
}