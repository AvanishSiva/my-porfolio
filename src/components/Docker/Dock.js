import React, { useRef, useState, useEffect } from 'react'
import { FaHome, FaUser, FaUserGraduate, FaBriefcase, FaFolderOpen, FaEnvelope } from 'react-icons/fa';
import './Dock.css';

const dockItems = [
  { id: 1, name: 'Home', icon: <FaHome /> },
  { id: 2, name: 'About Me', icon: <FaUser /> },
  { id: 3, name: 'Education', icon: <FaUserGraduate /> },
  { id: 4, name: 'Experience', icon: <FaBriefcase /> },
  { id: 5, name: 'Projects', icon: <FaFolderOpen /> },
  { id: 6, name: 'Contact Me', icon: <FaEnvelope /> },
]

function DockItem({ item, mouseX, mouseY, dockBounds, onClick }) {
  const [scale, setScale] = useState(1)
  const [showTooltip, setShowTooltip] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!ref.current || !dockBounds || mouseX === null) {
      setScale(1)
      return
    }

    const itemBounds = ref.current.getBoundingClientRect()
    const itemCenterX = itemBounds.left + itemBounds.width / 2
    const itemCenterY = itemBounds.top + itemBounds.height / 2

    const distanceX = Math.abs(mouseX - itemCenterX)
    const distanceY = Math.abs(mouseY - itemCenterY)
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

    const maxDistance = 100
    const maxScale = 1.6

    if (distance < maxDistance) {
      const proximity = 1 - (distance / maxDistance)
      const newScale = 1 + (proximity * (maxScale - 1))
      setScale(newScale)
    } else {
      setScale(1)
    }
  }, [mouseX, mouseY, dockBounds])

  const handleMouseEnter = () => {
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  const dynamicStyle = {
    transform: `scale(${scale})`,
  }

  return (
    <div
      ref={ref}
      className="dock-item"
      style={dynamicStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="dock-icon">
        {item.icon}
      </div>

      <div className={`dock-tooltip ${showTooltip ? 'visible' : 'hidden'}`}>
        {item.name}
        <div className="tooltip-arrow"></div>
      </div>
    </div>
  )
}

export default function Dock({ onNavigate, currentSection }) {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null })
  const [dockBounds, setDockBounds] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const dockRef = useRef()

  useEffect(() => {
    if (dockRef.current) {
      const bounds = dockRef.current.getBoundingClientRect()
      setDockBounds(bounds)
    }
  }, [])

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY })

    if (dockRef.current) {
      const bounds = dockRef.current.getBoundingClientRect()
      setDockBounds(bounds)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: null, y: null })
  }

  return (
    <div className="dock-container">
      <div
        ref={dockRef}
        className={`dock ${isHovered ? 'hovered' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="dock-items">
          {dockItems.map((item) => (
            <DockItem
              key={item.id}
              item={item}
              mouseX={mousePosition.x}
              mouseY={mousePosition.y}
              dockBounds={dockBounds}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}