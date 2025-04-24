// Obtener datos del alumno y clase
const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");

// Mostrar en pantalla el nombre del alumno y la clase
document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

// Cargar los estudios de la semana desde la hoja de Google
function cargarEstudios() {
  fetch(`${API_URL}?accion=getEstudios&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("semana-estudios");
      contenedor.innerHTML = "";

      if (data.length === 0) {
        contenedor.innerHTML = "<p>No hay estudios disponibles para esta clase.</p>";
        return;
      }

      // Crear los botones para cada día de la semana
      data.forEach(estudio => {
        const btn = document.createElement("button");
        btn.className = `dia-btn`;
        btn.textContent = estudio.dia; // Usar el día del estudio (por ejemplo: "Domingo")
        btn.onclick = () => cargarEstudioPorDia(estudio.dia); // Cargar estudio según el día
        contenedor.appendChild(btn);
      });
    })
    .catch(() => {
      mostrarToast("❌ Error al cargar los estudios.", "error");
    });
}

// Cargar el estudio según el día
function cargarEstudioPorDia(dia) {
  fetch(`${API_URL}?accion=getEstudioPorDia&clase=${idClase}&dia=${dia}`)
    .then(res => res.json())
    .then(data => {
      const card = document.querySelector('.study-card');
      card.innerHTML = `<h2>Estudio para el día ${dia}</h2>`;

      if (!data || data.error) {
        card.innerHTML += `<p>${data.error || "No se encontró ningún estudio disponible."}</p>`;
        return;
      }

      // Mostrar las preguntas del estudio
      data.preguntas.forEach((item, index) => {
        card.innerHTML += `
          <div class="bloque-pregunta">
            <p><strong>${item.Pregunta}</strong></p>
            <p><strong>Respuesta:</strong></p>
            ${item.Respuesta.split('<br>').map(r => `
              <label><input type="radio" name="respuesta${index}" value="${r.charAt(0)}" onclick="guardarRespuesta('${index}', '${r.charAt(0)}')"> ${r}</label><br>
            `).join("")}
          </div>
        `;
      });

      // Agregar nota personal
      card.innerHTML += `
        <div class="nota-personal">
          <label><strong>✍️ Mis notas personales:</strong></label><br>
          <textarea id="notaPersonal" placeholder="Escribe aquí tu reflexión..."></textarea>
        </div>
      `;
    })
    .catch(() => {
      mostrarToast("❌ Error al cargar el estudio de este día.", "error");
    });
}

// Función para guardar las respuestas seleccionadas
function guardarRespuesta(index, valor) {
  localStorage.setItem(`respuesta_${index}`, valor);
}

// Función para mostrar toast flotante
function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toast-container");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Llamar a la función para cargar los estudios cuando se cargue la página
window.onload = function() {
  cargarEstudios(); // Llamar la función para cargar los estudios desde la hoja de Google
};
