import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/productos">Gestión de productos</Link></li>
        <li><Link to="/categorias">Gestión de Categorias</Link></li>
      </ul>
    </nav>
  );
};