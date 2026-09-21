// Este script asume dos elementos en index.html:
// <ul id="lista-reportes"></ul>
// <form id="form-reporte"> con inputs name="nombre", "ubicacion", "tipo", "descripcion"

const API_URL = '/api/reportes';

async function cargarReportes() {
  const lista = document.getElementById('lista-reportes');
  if (!lista) return;

  try {
    const res = await fetch(API_URL);
    const reportes = await res.json();

    lista.innerHTML = '';
    reportes.forEach((r) => {
      const fecha = new Date(r.ts).toLocaleDateString('es-CO');
      const li = document.createElement('li');
      li.className = 'reporte-item';
      li.innerHTML = `
        <strong>${r.tipo}</strong> — ${r.ubicacion} (${fecha})<br>
        <span>${r.descripcion || ''}</span><br>
        <small>Reportado por: ${r.nombre}</small>
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Error al cargar reportes:', err);
    lista.innerHTML = '<li>No se pudieron cargar los reportes.</li>';
  }
}

function initFormularioReporte() {
  const form = document.getElementById('form-reporte');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (!res.ok) throw new Error('Error en el envío');

      form.reset();
      cargarReportes();
    } catch (err) {
      console.error('Error al enviar el reporte:', err);
      alert('No se pudo enviar el reporte, intenta de nuevo.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarReportes();
  initFormularioReporte();
});