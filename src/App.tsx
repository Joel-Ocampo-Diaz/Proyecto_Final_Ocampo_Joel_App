import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Inicio } from './components/Inicio';
import { ListaProducto } from './components/ListaProducto';
import { ListaCategoria } from './components/ListaCategoria';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<ListaProducto />} />
        <Route path="/categorias" element={<ListaCategoria />} />
      </Routes>
    </Router>
  );
}

export default App;

