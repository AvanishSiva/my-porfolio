import React from "react";

export default function AboutSection() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#d9f99d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#181818', marginBottom: '2rem' }}>
        About Me
      </h1>
      <p style={{ fontSize: '1.5rem', maxWidth: '800px', textAlign: 'center', color: '#181818' }}>
        Add your about me content here!
      </p>
    </div>
  );
}