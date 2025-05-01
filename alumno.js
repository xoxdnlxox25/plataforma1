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
        encabezado: p.Encabezado || `Pregunta ${index + 1}`,
        pregunta: p.Pregunta,
        versiculo: p.Versiculo,
        nota: p.Nota,
        opciones: (p.Respuesta || "")
          .split(/\n|(?=[A-Z]\))/)
          .map(op => op.trim())
          .filter(op => op !== ""),
        correcta: p.Correcta,
        TextoExtra: p.TextoExtra || "" // ✅ NUEVO: columna I (mensaje adicional del día)
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
    encabezado.classList.add("fade-in");
    encabezado.innerHTML = `
      <h3 style="text-align:center">${preguntasDelDia[0].dia}</h3>
    `;
    container.appendChild(encabezado);

    // ✅ NUEVO: Tarjeta extra desde columna I (con soporte para saltos de línea como párrafos)
const textoExtra = preguntasDelDia[0]?.TextoExtra?.trim();
if (textoExtra) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "bloque-nota fade-in";
  tarjeta.style.marginTop = "12px";

  // Convertir los saltos de línea en párrafos
  const contenidoFormateado = textoExtra
    .split('\n')
    .map(linea => `<p style="margin: 8px 0;">${linea.trim()}</p>`)
    .join("");

  tarjeta.innerHTML = contenidoFormateado;
  container.appendChild(tarjeta);
}


  }

  preguntasDelDia.forEach(p => {
    const div = document.createElement("div");
    div.className = "pregunta fade-in";
    div.style.marginBottom = "20px";

    const idVers = `vers${p.numero}`;
    const idNota = `nota${p.numero}`;

    let contenidoHTML = "";

    if (p.subtitulo && p.subtitulo.trim() !== "") {
      contenidoHTML += `
        <div class="subtitulo-tarjeta">${p.subtitulo}</div>
      `;
    }

    contenidoHTML += `<p><strong>${p.encabezado}:</strong> ${p.pregunta}</p>`;

    if (p.versiculo && p.versiculo.trim() !== "") {
      const versiculoParrafos = p.versiculo
        .split('\n')
        .map(linea => `<p style="margin: 8px 0;">${linea.trim()}</p>`)
        .join("");

      contenidoHTML += `
        <button class="toggle-btn" onclick="document.getElementById('${idVers}').classList.toggle('hidden')">📖 Mostrar/Ocultar versículo</button>
        <div id="${idVers}" class="bloque-versiculo hidden"><strong>Versículo:</strong>${versiculoParrafos}</div>
      `;
    }

    if (p.nota && p.nota.trim() !== "") {
      const notaParrafos = p.nota
        .split('\n')
        .map(linea => `<p style="margin: 8px 0;">${linea.trim()}</p>`)
        .join("");

      contenidoHTML += `
        <button class="toggle-btn" onclick="document.getElementById('${idNota}').classList.toggle('hidden')">📜 Mostrar/Ocultar nota</button>
        <div id="${idNota}" class="bloque-nota hidden"><strong>Nota:</strong>${notaParrafos}</div>
      `;
    }

    if (p.opciones.length > 0) {
      contenidoHTML += `
        <div class="opciones">
          <p><strong>Respuestas:</strong></p>
          ${p.opciones.map(op => `
            <label class="opcion-label">
              <input type="radio" name="preg${p.numero}" value="${op[0]}" onchange="verificarRespuestasCompletas()">
              <span>${op}</span>
            </label>
          `).join("")}
        </div>
      `;
    }

    div.innerHTML = contenidoHTML;
    container.appendChild(div);
  });

  const contenedorBoton = document.createElement("div");
  contenedorBoton.id = "botonEnviarContainer";
  container.appendChild(contenedorBoton);
}

function verificarRespuestasCompletas() {
  const totalPreguntas = preguntasDelDia.length;
  let totalRespondidas = 0;

  preguntasDelDia.forEach(p => {
    const seleccionada = document.querySelector(`input[name="preg${p.numero}"]:checked`);
    if (seleccionada) {
      totalRespondidas++;
    }
  });

  const contenedorBoton = document.getElementById("botonEnviarContainer");

  if (totalRespondidas === totalPreguntas) {
    if (!document.getElementById("btnEnviar")) {
      const btn = document.createElement("button");
      btn.id = "btnEnviar";
      btn.textContent = "✅ Enviar respuestas";
      btn.className = "toggle-btn fade-in";
      btn.onclick = enviarRespuestas;
      contenedorBoton.appendChild(btn);
    }
  } else {
    const boton = document.getElementById("btnEnviar");
    if (boton) {
      boton.remove();
    }
  }
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
    datos.append("id", localStorage.getItem("id")); // ✅ ID_ALUMNO agregado
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

