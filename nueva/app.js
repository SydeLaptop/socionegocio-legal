/* SocioNegocio · web de descarga.
   1) Los datos de la versión salen de version.json. Si no se pueden leer, la página funciona igual:
      los botones de descarga ya apuntan a la última versión publicada.
   2) Aparición suave de los bloques al desplazarse (respeta "reducir movimiento").
   3) Pepito: se cierra la burbuja al tocar. Su versión animada (250 a 370 KB) NO se descarga sola, para no gastar
      los datos de nadie: solo si la persona toca a Pepito (y no tiene activado "reducir movimiento"). */
(function () {
  'use strict';

  function cada(lista, fn) { Array.prototype.forEach.call(lista, fn); }

  var botones = document.querySelectorAll('.js-descargar');

  function texto(id, valor) {
    var e = document.getElementById(id);
    if (e) { e.textContent = valor; }
  }

  function conEnlace(url) {
    cada(botones, function (b) { b.setAttribute('href', url); });
  }

  function mostrarProximamente() {
    cada(botones, function (b) {
      b.textContent = 'Próximamente';
      b.classList.add('apagado');
      b.removeAttribute('href');
      b.setAttribute('aria-disabled', 'true');
    });
    texto('datos-version', 'Estamos terminando la primera versión. Vuelve pronto.');
  }

  fetch('version.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) { throw new Error('HTTP ' + r.status); }
      return r.json();
    })
    .then(function (v) {
      if (v.url_descarga) { conEnlace(v.url_descarga); }

      if (v.disponible === false) {
        mostrarProximamente();
        return;
      }

      var partes = [];
      if (v.version) { partes.push('Versión ' + v.version); }
      if (v.fecha) { partes.push(v.fecha); }
      if (v.tamano_mb) { partes.push(v.tamano_mb + ' MB'); }
      partes.push('Android ' + (v.android_minimo || '7.0') + ' o superior');
      texto('datos-version', partes.join(' · '));

      if (!v.version) { return; }

      texto('v-numero', v.version);
      texto('v-info', v.fecha ? 'Publicada el ' + v.fecha + '.' : '');

      if (v.notas && v.notas.length) {
        var lista = document.getElementById('v-notas');
        lista.textContent = '';
        v.notas.forEach(function (nota) {
          var li = document.createElement('li');
          li.textContent = nota;
          lista.appendChild(li);
        });
        lista.hidden = false;
      }

      if (v.sha256) {
        texto('v-huella', v.sha256);
        document.getElementById('v-huella-bloque').hidden = false;
      }

      document.getElementById('detalle-version').hidden = false;
    })
    .catch(function () { /* sin datos de versión: se queda la página básica */ });

  /* ---- Aparición suave ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    cada(document.querySelectorAll('.reveal'), function (e) { io.observe(e); });
  } else {
    cada(document.querySelectorAll('.reveal'), function (e) { e.classList.add('visible'); });
  }

  /* ---- Cerrar la burbuja de Pepito, y animarlo solo si lo tocan ---- */
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var x = t.closest ? t.closest('.pepito__x') : null;
    if (x && x.parentNode) { x.parentNode.hidden = true; return; }

    if (!reducido && t.tagName === 'IMG' && t.getAttribute('data-anim')) {
      t.src = t.getAttribute('data-anim');
      t.removeAttribute('data-anim');
    }
  });
})();
