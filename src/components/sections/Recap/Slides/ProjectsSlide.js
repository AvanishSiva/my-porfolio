import React from 'react';
import { motion } from 'framer-motion';
import { recapData } from '../recapData';

export default function ProjectsSlide({ data }) {
    const bgImage = recapData.backgrounds.projects;

    return (
        <div className="slide projects-slide" style={{
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
                transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
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

            <div style={{ zIndex: 1, width: '100%', textAlign: 'center' }}>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3rem', fontSize: '2.5rem', fontWeight: 700 }}
                >
                    Projects Shipped
                </motion.h2>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {data.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 + 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                padding: '2rem',
                                borderRadius: '20px',
                                textAlign: 'center',
                                minWidth: '220px',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{project.name}</h3>
                            <span style={{ color: '#ccc', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{project.type}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
