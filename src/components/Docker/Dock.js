import React, { useRef, useState, useEffect } from 'react'
import { FaHome, FaUser, FaUserGraduate, FaBriefcase, FaFolderOpen, FaEnvelope } from 'react-icons/fa';

const dockItems = [
  { id: 1, name: 'Home', icon: <FaHome /> },
  { id: 2, name: 'About Me', icon: <FaUser /> },
  { id: 3, name: 'Education', icon: <FaUserGraduate /> },
  { id: 4, name: 'Experience', icon: <FaBriefcase /> },
  { id: 5, name: 'Projects', icon: <FaFolderOpen /> },
  { id: 6, name: 'Contact Me', icon: <FaEnvelope /> },
]

function DockItem({ item, mouseX, mouseY, dockBounds }) {
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

  const itemStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'bottom center',
    width: '60px',
    height: '60px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    cursor: 'pointer',
    transition: 'all 0.2s ease-out',
  }

  const iconStyle = {
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 4px 12px #6B645C',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'box-shadow 0.2s ease',
  }

  const tooltipStyle = {
    position: 'absolute',
    top: '-48px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#6B645C',
    color: 'white',
    fontSize: '12px',
    padding: '6px 12px',
    borderRadius: '6px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    opacity: showTooltip ? 1 : 0,
    transform: showTooltip 
      ? 'translateX(-50%) translateY(0)' 
      : 'translateX(-50%) translateY(8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  }

  const arrowStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '4px solid #6B645C',
  }

  return (
    <div
      ref={ref}
      style={itemStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={iconStyle}>
        {item.icon}
      </div>
      
      <div style={tooltipStyle}>
        {item.name}
        <div style={arrowStyle}></div>
      </div>
    </div>
  )
}

export default function Dock() {
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

  const dockContainerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    pointerEvents: 'none', // Allow clicks to pass through the container
  }

  const dockStyle = {
    background: isHovered 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: isHovered 
      ? '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
      : '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.3s ease-out',
    pointerEvents: 'auto', // Re-enable pointer events for the dock itself
  }

  const itemsContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1.5em',
  }

  return (
    <div style={dockContainerStyle}>
      <div
        ref={dockRef}
        style={dockStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={itemsContainerStyle}>
          {dockItems.map((item) => (
            <DockItem
              key={item.id}
              item={item}
              mouseX={mousePosition.x}
              mouseY={mousePosition.y}
              dockBounds={dockBounds}
            />
          ))}
        </div>
      </div>
    </div>
  )
}