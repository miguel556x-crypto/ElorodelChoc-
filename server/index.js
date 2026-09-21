const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Sirve el frontend (index.html, css/, js/) directamente desde este servidor,
// reemplazando el uso de json-server / db.json para esta funcionalidad.
app.use(express.static(path.join(__dirname, '..')));

// GET /api/reportes -> lista todos los reportes, más recientes primero
app.get('/api/reportes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reportes ORDER BY ts DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener los reportes' });
  }
});

// POST /api/reportes -> crea un nuevo reporte
app.post('/api/reportes', async (req, res) => {
  const { nombre, ubicacion, tipo, descripcion } = req.body;

  if (!ubicacion || !tipo) {
    return res.status(400).json({ error: 'ubicacion y tipo son obligatorios' });
  }

  try {
    const ts = Date.now();
    const [result] = await pool.query(
      'INSERT INTO reportes (nombre, ubicacion, tipo, descripcion, ts) VALUES (?, ?, ?, ?, ?)',
      [nombre || 'Anónimo', ubicacion, tipo, descripcion || '', ts]
    );
    res.status(201).json({ id: result.insertId, nombre, ubicacion, tipo, descripcion, ts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar el reporte' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de Oro Chocó escuchando en http://localhost:${PORT}`);
});