// Obtener datos del alumno
const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");

// Mostrar en pantalla
document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

// Preguntas simuladas (puedes luego cargarlas desde la hoja si deseas)
const preguntasDelDia = [
  { numero: 1, pregunta: "¿Cuál es el primer mandamiento?", opciones: ["A. Amarás a Dios", "B. No robarás", "C. Honra a tu padre"] },
  { numero: 2, pregunta: "¿Quién escribió el libro de Juan?", opciones: ["A. Pablo", "B. Juan", "C. Pedro"] }
];

// Mostrar preguntas
const container = document.getElementById("preguntasContainer");

preguntasDelDia.forEach(p => {
  const div = document.createElement("div");
  div.className = "pregunta";
  div.innerHTML = `
    <p><strong>Pregunta ${p.numero}:</strong> ${p.pregunta}</p>
    ${p.opciones.map(op => `
      <label>
        <input type="radio" name="preg${p.numero}" value="${op[0]}"> ${op}
      </label><br>
    `).join("")}
  `;
  container.appendChild(div);
});

// Función para guardar todas las respuestas al hacer clic
function enviarRespuestas() {
  const fecha = new Date().toISOString().split("T")[0];
  const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date());
  let completas = true;

  preguntasDelDia.forEach(p => {
    const seleccionada = document.querySelector(`input[name="preg${p.numero}"]:checked`);
    if (!seleccionada) {
      mostrarToast(`⚠ Por favor responde la pregunta ${p.numero}`, "error");
      completas = false;
      return;
    }

    const datos = new URLSearchParams();
    datos.append("accion", "guardarRespuesta");
    datos.append("clase", idClase);
    datos.append("alumno", nombreAlumno);
    datos.append("dia", diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1));
    datos.append("numero", p.numero);
    datos.append("respuesta", seleccionada.value);
    datos.append("fecha", fecha);

    fetch(URL, {
      method: "POST",
      body: datos
    })
    .then(res => res.text())
    .then(resp => {
      console.log("Guardado:", resp);
    });
  });

  if (completas) {
    mostrarToast("✅ ¡Respuestas enviadas correctamente!", "success");
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
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

