import React from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

export default function SummarySlide({ data }) {

    const bgImage = "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=1920&auto=format&fit=crop"; // Fireworks

    return (
        <div className="slide summary-slide" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            color: 'white'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0,
                filter: 'brightness(0.5)'
            }} />

            <div style={{ position: 'absolute', zIndex: 1, width: '100%', height: '100%' }}>
                <Confetti recycle={true} numberOfPieces={200} />
            </div>

            <div style={{ zIndex: 2 }}>
                <motion.h1
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold' }}
                >
                    {data.title}
                </motion.h1>
                <motion.p
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '2rem' }}
                >
                    {data.message}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    style={{ marginTop: '3rem', fontSize: '1rem', opacity: 0.7 }}
                >
                    Tap to restart
                </motion.div>
            </div>
        </div>
    );
}
