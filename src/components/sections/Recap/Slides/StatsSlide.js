import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { recapData } from '../recapData';

function Counter({ value, label }) {
    const spring = useSpring(0, { duration: 2000 });
    const display = useTransform(spring, (current) => Math.round(current));
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        spring.set(value);
        const unsubscribe = display.on("change", (v) => setCurrentValue(v));
        return unsubscribe;
    }, [value, spring, display]);

    return (
        <div style={{ textAlign: 'center', margin: '20px', zIndex: 2 }}>
            <motion.div className="stats-number">
                {currentValue}
            </motion.div>
            <div className="stats-label">{label}</div>
        </div>
    );
}

export default function StatsSlide({ data }) {
    const bgImage = recapData.backgrounds.stats;

    return (
        <div className="slide stats-slide" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            color: 'white'
        }}>
            <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0,
                    filter: 'brightness(0.3)'
                }}
            />

            <div style={{ zIndex: 1, textAlign: 'center' }}>
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="stats-title"
                >
                    By the numbers
                </motion.h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Counter value={data.commits} label="Commits" />
                    <Counter value={data.hours} label="Hours Coding" />
                    <Counter value={data.coffee} label="Coffees" />
                </div>
            </div>
        </div>
    );
}
