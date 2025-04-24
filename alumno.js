// Obtener datos del alumno
const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");

// Mostrar en pantalla
document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

const container = document.getElementById("preguntasContainer");
let preguntasDelDia = [];

// Cargar preguntas desde Google Sheets según el día actual
window.onload = () => {
  const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date());
  const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  fetch(`${URL}?accion=getPreguntasPorDia&dia=${diaCapitalizado}`)
    .then(res => res.json())
    .then(data => {
      preguntasDelDia = data.map((p, index) => ({
        numero: index + 1,
        pregunta: p.Pregunta,
        versiculo: p.Versiculo,
        nota: p.Nota,
        opciones: p.Respuesta.split("\n").filter(op => op.trim() !== ""),
        correcta: p.Correcta
      }));

      mostrarPreguntas();
    })
    .catch(() => {
      mostrarToast("❌ Error al cargar preguntas del día", "error");
    });
};

// Mostrar preguntas en pantalla
function mostrarPreguntas() {
  container.innerHTML = "";

  preguntasDelDia.forEach(p => {
    const div = document.createElement("div");
    div.className = "pregunta";
    div.innerHTML = `
      <p><strong>Pregunta ${p.numero}:</strong> ${p.pregunta}</p>
      <p><strong>Versículo:</strong> ${p.versiculo || "(sin versículo)"}</p>
      <p><strong>Nota:</strong> ${p.nota || "(sin nota)"}</p>
      ${p.opciones.map(op => `
        <label>
          <input type="radio" name="preg${p.numero}" value="${op[0]}"> ${op}
        </label><br>
      `).join("")}
    `;
    container.appendChild(div);
  });
}

// Función para guardar respuestas
function enviarRespuestas() {
  const fecha = new Date().toISOString().split("T")[0];
  const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date());
  const dia = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
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
    datos.append("dia", dia);
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

// Cerrar sesión
function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Toast flotante
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
