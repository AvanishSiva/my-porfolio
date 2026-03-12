import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPortfolio from "./MainPortfolio";
import RecapSection from "./components/sections/Recap/RecapSection";
import V2Portfolio from "./v2/V2Portfolio";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<V2Portfolio />} />
      <Route path="/v1" element={<MainPortfolio />} />
      <Route path="/2025-recap" element={<RecapSection />} />
    </Routes>
  );
}