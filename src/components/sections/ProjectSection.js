import React from "react";

export default function ProjectsSection() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#a78bfa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#181818', marginBottom: '2rem' }}>
        Projects
      </h1>
      <p style={{ fontSize: '1.5rem', maxWidth: '800px', textAlign: 'center', color: '#181818' }}>
        Add your projects here!
      </p>
    </div>
  );
}