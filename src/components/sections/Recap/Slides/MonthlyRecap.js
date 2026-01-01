import React from 'react';
import { motion } from 'framer-motion';

export default function MonthlyRecap({ data }) {
    return (
        <div className="slide month-slide" style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '2rem 2rem 6rem 2rem',
            textAlign: 'left'
        }}>
            <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${data.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}
            />

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
                zIndex: 1
            }} />

            <div style={{ zIndex: 2, maxWidth: '800px' }}>
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontSize: '1.5rem',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        opacity: 0.8
                    }}
                >
                    {data.month}
                </motion.h2>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="month-title"
                >
                    {data.title}
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="month-highlight"
                >
                    {data.highlight}
                </motion.p>
            </div>
        </div>
    );
}
