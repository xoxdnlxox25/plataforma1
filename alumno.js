const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");

document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

const container = document.getElementById("preguntasContainer");
let preguntasDelDia = [];

// Día actual formateado
const fecha = new Date();
const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(fecha);
const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

// Cargar preguntas desde la hoja
window.onload = () => {
  fetch(`${URL}?accion=getPreguntasPorDia&dia=${diaCapitalizado}`)
    .then(res => res.json())
    .then(data => {
      preguntasDelDia = data.map((p, index) => ({
        numero: index + 1,
        dia: p.Día,
        subtitulo: p.Subtitulos,
        pregunta: p.Pregunta,
        versiculo: p.Versiculo,
        nota: p.Nota,
        opciones: (p.Respuesta || "")
          .split(/\n|(?=[A-Z]\))/)
          .map(op => op.trim())
          .filter(op => op !== ""),
        correcta: p.Correcta
      }));

      mostrarPreguntas();
    })
    .catch(err => {
      console.error("Error cargando preguntas:", err);
      mostrarToast("❌ Error al cargar preguntas", "error");
    });
};

function mostrarPreguntas() {
  container.innerHTML = "";

  if (preguntasDelDia.length > 0) {
    const encabezado = document.createElement("div");
    encabezado.innerHTML = `
      <h3 style="text-align:center">${preguntasDelDia[0].dia}</h3>
      <p style="font-style:italic; text-align:center;">${preguntasDelDia[0].subtitulo}</p>
    `;
    container.appendChild(encabezado);
  }

  preguntasDelDia.forEach(p => {
    const div = document.createElement("div");
    div.className = "pregunta";
    div.style.marginBottom = "20px";

    // Versículo oculto por defecto
    const idVers = `vers${p.numero}`;
    const idNota = `nota${p.numero}`;

    div.innerHTML = `
      <p><strong>Pregunta ${p.numero}:</strong> ${p.pregunta}</p>

      <button class="toggle-btn" onclick="document.getElementById('${idVers}').classList.toggle('hidden')">📖 Mostrar/Ocultar versículo</button>
      <div id="${idVers}" class="bloque-versiculo hidden"><strong>Versículo:</strong> ${p.versiculo}</div>

      <button class="toggle-btn" onclick="document.getElementById('${idNota}').classList.toggle('hidden')">📜 Mostrar/Ocultar nota</button>
      <div id="${idNota}" class="bloque-nota hidden"><strong>Nota:</strong> ${p.nota}</div>

      <div class="opciones">
  <p><strong>Respuestas:</strong></p>
  ${p.opciones.map(op => `
    <label class="opcion-label">
      <input type="radio" name="preg${p.numero}" value="${op[0]}">
      <span>${op}</span>
    </label>
  `).join("")}
</div>
    `;

    container.appendChild(div);
  });
}

function enviarRespuestas() {
  const fecha = new Date().toISOString().split("T")[0];
  let completas = true;

  preguntasDelDia.forEach(p => {
    const seleccionada = document.querySelector(`input[name="preg${p.numero}"]:checked`);
    if (!seleccionada) {
      mostrarToast(`⚠ Responde la pregunta ${p.numero}`, "error");
      completas = false;
      return;
    }

    const datos = new URLSearchParams();
    datos.append("accion", "guardarRespuesta");
    datos.append("clase", idClase);
    datos.append("alumno", nombreAlumno);
    datos.append("dia", p.dia);
    datos.append("numero", p.numero);
    datos.append("respuesta", seleccionada.value);
    datos.append("fecha", fecha);

    fetch(URL, {
      method: "POST",
      body: datos
    }).then(res => res.text())
      .then(resp => {
        console.log("Guardado:", resp);
      });
  });

  if (completas) {
    mostrarToast("✅ ¡Respuestas enviadas correctamente!", "success");
  }
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toast-container");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  contenedor.innerHTML = "";
  contenedor.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

