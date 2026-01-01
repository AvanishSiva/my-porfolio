import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { recapData } from './recapData';
import IntroSlide from './Slides/IntroSlide';
import MonthlyRecap from './Slides/MonthlyRecap';
import ProjectsSlide from './Slides/ProjectsSlide';
import StatsSlide from './Slides/StatsSlide';
import SummarySlide from './Slides/SummarySlide';
import './Recap.css';
import { FaTimes } from 'react-icons/fa';

export default function RecapSection() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1);
    const slides = [
        { type: 'intro', data: recapData.intro },
        ...recapData.months.map(m => ({ type: 'month', data: m })),
        { type: 'projects', data: recapData.projects },
        { type: 'stats', data: recapData.stats },
        { type: 'summary', data: recapData.summary }
    ];

    const totalSlides = slides.length;

    const handleNext = () => {
        if (currentSlide < totalSlides - 1) {
            setDirection(1);
            setCurrentSlide(prev => prev + 1);
        } else {
            setDirection(1);
            setCurrentSlide(0);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(prev => prev - 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') navigate('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, navigate, totalSlides]); // Added dependencies

    const renderSlideContent = (slide) => {
        switch (slide.type) {
            case 'intro': return <IntroSlide data={slide.data} />;
            case 'month': return <MonthlyRecap data={slide.data} />;
            case 'projects': return <ProjectsSlide data={slide.data} />;
            case 'stats': return <StatsSlide data={slide.data} />;
            case 'summary': return <SummarySlide data={slide.data} />;
            default: return null;
        }
    };

    const currentSlideData = slides[currentSlide];

    return (
        <div className="recap-container">
            <div className="progress-container">
                {slides.map((_, index) => (
                    <div key={index} className="progress-bar">
                        <div
                            className={`progress-fill ${index <= currentSlide ? 'active' : ''}`}
                            style={{ width: index < currentSlide ? '100%' : (index === currentSlide ? '100%' : '0%') }}
                        />
                    </div>
                ))}
            </div>

            <button className="close-button" onClick={() => navigate('/')}>
                <FaTimes />
            </button>

            <div className="recap-nav">
                <div className="nav-area left" onClick={handlePrev}></div>
                <div className="nav-area right" onClick={handleNext}></div>
            </div>

            <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? -1000 : 1000, opacity: 0 }}
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                >
                    {renderSlideContent(currentSlideData)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
