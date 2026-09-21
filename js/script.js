(function(){
  const form = document.getElementById('reportForm');
  const listEl = document.getElementById('reportList');
  const statusEl = document.getElementById('formStatus');
  const btn = document.getElementById('submitBtn');
  const API_URL = '/api/reportes';

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function formatDate(ts){
    try{
      const d = new Date(ts);
      return d.toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    }catch(e){ return ''; }
  }

  function renderReports(reports){
    if(!reports.length){
      listEl.innerHTML = '<div class="report-empty">Todavía no hay reportes. Sé la primera persona en contar lo que ves en tu zona.</div>';
      return;
    }
    listEl.innerHTML = reports.map(function(r){
      const nombre = r.nombre ? escapeHtml(r.nombre) : 'Anónimo';
      return '<div class="report-item">' +
        '<span class="report-tag">' + escapeHtml(r.tipo) + '</span>' +
        '<div class="report-desc">' + escapeHtml(r.descripcion) + '</div>' +
        '<div class="report-meta">' + escapeHtml(r.ubicacion) + ' · ' + nombre + ' · ' + formatDate(r.ts) + '</div>' +
        '</div>';
    }).join('');
  }

  // Antes usaba window.storage (solo existe dentro de artifacts de Claude).
  // Ahora pide los reportes al backend Express, que los lee de MySQL.
  async function loadReports(){
    try{
      const res = await fetch(API_URL);
      if(!res.ok) throw new Error('Respuesta no OK del servidor');
      const items = await res.json();
      items.sort(function(a,b){ return (b.ts||0) - (a.ts||0); });
      renderReports(items);
    }catch(e){
      listEl.innerHTML = '<div class="report-empty">No se pudieron cargar los reportes en este momento.</div>';
    }
  }

  if (form) {
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      const nombre = document.getElementById('rNombre').value.trim();
      const ubicacion = document.getElementById('rUbicacion').value.trim();
      const tipo = document.getElementById('rTipo').value;
      const descripcion = document.getElementById('rDescripcion').value.trim();

      if(!ubicacion || !tipo || !descripcion){
        statusEl.textContent = 'Completa ubicación, tipo y descripción.';
        statusEl.className = 'form-status err';
        return;
      }

      const report = {
        nombre: nombre || null,
        ubicacion: ubicacion,
        tipo: tipo,
        descripcion: descripcion
        // ts lo asigna el servidor al guardar en MySQL
      };

      btn.disabled = true;
      btn.textContent = 'Enviando…';

      try{
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
        if(!res.ok) throw new Error('No se pudo guardar');

        form.reset();
        statusEl.textContent = 'Reporte enviado. Gracias por contarlo.';
        statusEl.className = 'form-status ok';
        await loadReports();
      }catch(err){
        statusEl.textContent = 'Hubo un problema al enviar el reporte. Intenta de nuevo.';
        statusEl.className = 'form-status err';
      }finally{
        btn.disabled = false;
        btn.textContent = 'Enviar reporte';
      }
    });
  }

  loadReports();
})();