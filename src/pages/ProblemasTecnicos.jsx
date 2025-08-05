import React from 'react';

const ProblemasTecnicos = () => {
    const styles = {
        container: {
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#721c24',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            flexDirection: 'column',
            margin: '0 0',
        },
        box: {
            backgroundColor: '#f5c6cb',
            border: '1px solid #f1b0b7',
            borderRadius: '8px',
            padding: '2rem 3rem',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        },
        emoji: {
            fontSize: '3rem',
            marginBottom: '1rem'
        },
        texto: {
            fontSize: '1.5rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <div style={styles.emoji}>🚧</div>
                <div style={styles.texto}>Estamos experimentando problemas técnicos</div>
                <br />
                <div style={styles.texto}>Por favor, inténtalo de nuevo más tarde</div>
            </div>
        </div>
    );
};

export default ProblemasTecnicos;
