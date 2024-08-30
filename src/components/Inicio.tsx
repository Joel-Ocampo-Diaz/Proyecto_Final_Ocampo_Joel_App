import React from 'react';
import './Inicio.css';

export const Inicio: React.FC = () => {
  return (
    <div className="inicio-container">
      <h1 className="inicio-title">¡Bienvenidos a Nuestra Aplicación!</h1>
      <p className="inicio-description">
        Explora nuestras funcionalidades, gestiona tus productos y categorías, y aprovecha todas las herramientas que ofrecemos.
      </p>
      <button className="inicio-button">Empezar</button>
    </div>
  );
};