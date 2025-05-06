// ===================
// DATOS DEL ALUMNO
// ===================
const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");
document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

// ==========================
// VARIABLES GLOBALES
let yaRespondioHoy = false; // ✅ NUEVO: guarda si el alumno ya respondió hoy para evitar mostrar el botón
// ==========================
const container = document.getElementById("preguntasContainer");
let preguntasDelDia = [];
const fecha = new Date();
const diaSemana = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(fecha);
const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

// ========================================
// FUNCIÓN PARA CARGAR PREGUNTAS SEGÚN DÍA
// ========================================
function cargarPreguntasPorDia(dia) {
  document.getElementById("loader").classList.remove("oculto");
  container.classList.add("oculto");

  // Corrección en la construcción de la URL
  const url = dia.toLowerCase() === "sábado"
    ? `${URL}?accion=getPreguntasSemana`
    : `${URL}?accion=getPreguntasPorDia&dia=${dia}`;

  fetch(url)
    .then(res => res.json())
    .then(async data => {
      // ✅ NUEVO: Guardamos si ya respondió hoy para el día seleccionado
      const hoy = new Date();
      const nombreDiaActual = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(hoy);
      const diaActual = nombreDiaActual.charAt(0).toUpperCase() + nombreDiaActual.slice(1);
      yaRespondioHoy = (dia === diaActual) ? await verificarSiYaRespondio(dia) : true;
      if (dia.toLowerCase() === "sábado") {
        mostrarRepasoSemanal(data);
      } else {
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
          TextoExtra: p.TextoExtra || ""
        }));
        mostrarPreguntas();
      }

      document.getElementById("loader").classList.add("oculto");
      container.classList.remove("oculto");

      document.querySelectorAll(".btn-dia").forEach(btn => {
        btn.classList.remove("activo");
        if (btn.textContent.trim().toLowerCase() === dia.toLowerCase()) {
          btn.classList.add("activo");
        }
      });
    })
    .catch(err => {
      console.error("Error cargando preguntas:", err);
      mostrarToast("❌ Error al cargar preguntas", "error");
      document.getElementById("loader").classList.add("oculto");
    });
}

// ===============================
// CARGAR AL INICIAR LA PÁGINA
// ===============================
window.onload = async () => {
  await cargarPreguntasPorDia(diaCapitalizado); // ✅ Espera a que termine
  verificarRespuestasCompletas();               // ✅ Ahora ya sabe si ya respondió

  document.querySelectorAll(".btn-dia").forEach(btn => {
    btn.addEventListener("click", async () => {
      const diaSeleccionado = btn.textContent.trim();
      await cargarPreguntasPorDia(diaSeleccionado); // ✅ Espera para evitar error
      verificarRespuestasCompletas();               // ✅ Solo después de cargar preguntas
    });
  });
};


// ============================================
// FUNCIÓN PARA MOSTRAR LAS PREGUNTAS EN HTML
// ============================================
function mostrarPreguntas() {
  container.innerHTML = "";

  if (preguntasDelDia.length > 0) {
    const encabezado = document.createElement("div");
    encabezado.classList.add("subtitulo-tarjeta", "fade-in");
    encabezado.style.marginBottom = "16px";
    encabezado.textContent = preguntasDelDia[0].dia;
    container.appendChild(encabezado);

    const textoExtra = preguntasDelDia[0]?.TextoExtra?.trim();
    if (textoExtra) {
      const tarjeta = document.createElement("div");
      tarjeta.className = "pregunta fade-in";
      tarjeta.style.marginTop = "12px";
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

    let contenidoHTML = `<p><strong>${p.encabezado}:</strong> ${p.pregunta}</p>`;

    if (p.versiculo?.trim()) {
      const versiculoParrafos = p.versiculo.split('\n')
        .map(linea => `<p style="margin: 8px 0;">${linea.trim()}</p>`).join("");
      contenidoHTML += `
        <button class="toggle-btn" onclick="document.getElementById('${idVers}').classList.toggle('hidden')">📖 Mostrar/Ocultar versículo</button>
        <div id="${idVers}" class="bloque-versiculo hidden"><strong>Versículo:</strong>${versiculoParrafos}</div>
      `;
    }

    if (p.nota?.trim()) {
      const notaParrafos = p.nota.split('\n')
        .map(linea => `<p style="margin: 8px 0;">${linea.trim()}</p>`).join("");
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

    const clave = `reflexion_${idClase}_${localStorage.getItem("id")}_${p.dia}_${p.numero}`;
    const valorGuardado = localStorage.getItem(clave) || "";
    contenidoHTML += `
      <div class="campo-reflexion">
        <label><strong>✍️ Reflexión / Comentario:</strong></label>
        <textarea rows="3" style="width:100%;" placeholder="Escribe aquí..." oninput="guardarReflexion('${p.dia}', ${p.numero}, this.value)">${valorGuardado}</textarea>
      </div>
    `;

    div.innerHTML = contenidoHTML;
    container.appendChild(div);
  });

  const contenedorBoton = document.createElement("div");
  contenedorBoton.id = "botonEnviarContainer";
  container.appendChild(contenedorBoton);
}

// ===============================================
// VERIFICAR SI TODAS LAS RESPUESTAS FUERON DADAS
// ===============================================
async function verificarRespuestasCompletas() {
  const totalPreguntas = preguntasDelDia.length;
  let totalRespondidas = 0;

  preguntasDelDia.forEach(p => {
    const seleccionada = document.querySelector(`input[name="preg${p.numero}"]:checked`);
    if (seleccionada) totalRespondidas++;
  });

  const contenedorBoton = document.getElementById("botonEnviarContainer");
  const diaHoy = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(new Date());
  const diaActual = diaHoy.charAt(0).toUpperCase() + diaHoy.slice(1);
  const diaSeleccionado = preguntasDelDia[0]?.dia;

  // Limpiar cualquier contenido anterior (botón o mensaje)
  contenedorBoton.innerHTML = "";

  // ✅ Mostrar mensaje si ya envió
  if (yaRespondioHoy && diaSeleccionado === diaActual) {
    const mensaje = document.createElement("div");
    mensaje.textContent = "✅ Ya enviaste tus respuestas hoy";
    mensaje.className = "mensaje-confirmacion fade-in"; // puedes estilizar esto en CSS
    contenedorBoton.appendChild(mensaje);
    return;
  }

  // ✅ Mostrar botón solo si aún no ha enviado y todas están respondidas
  if (!yaRespondioHoy && totalRespondidas === totalPreguntas && diaSeleccionado === diaActual) {
    const btn = document.createElement("button");
    btn.id = "btnEnviar";
    btn.textContent = "✅ Enviar respuestas";
    btn.className = "toggle-btn fade-in";
    btn.onclick = () => {
      enviarRespuestas().then(() => {
        const b = document.getElementById("btnEnviar");
        if (b) b.remove();

        // ✅ Mostrar mensaje después de enviar
        yaRespondioHoy = true;
        const msg = document.createElement("div");
        msg.textContent = "✅ Ya enviaste tus respuestas hoy";
        msg.className = "mensaje-confirmacion fade-in";
        contenedorBoton.appendChild(msg);
      });
    };
    contenedorBoton.appendChild(btn);
  }
}


// ===============================================
// VERIFICAR SI EL ALUMNO YA ENVIÓ ESE DÍA
// ===============================================
async function verificarSiYaRespondio(dia) {
  const id = localStorage.getItem("id");
  const clase = localStorage.getItem("clase");
  const fecha = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(`${URL}?accion=verificarEnvioDelDia&clase=${clase}&id=${id}&fecha=${fecha}`);
    const texto = await res.text();
    return texto === "true";
  } catch (err) {
    console.error("Error al verificar si ya respondió:", err);
    return false;
  }
}

// ========================================
// GUARDAR LA REFLEXIÓN EN LOCALSTORAGE
// ========================================
function guardarReflexion(dia, numero, texto) {
  const clave = `reflexion_${idClase}_${localStorage.getItem("id")}_${dia}_${numero}`;
  localStorage.setItem(clave, texto);
}

// ===================================
// ENVÍO DE RESPUESTAS AL SERVIDOR
// ===================================
function enviarRespuestas() {
  return new Promise((resolve) => {
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
      datos.append("id", localStorage.getItem("id"));
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

    if (completas) mostrarToast("✅ ¡Respuestas enviadas correctamente!", "success");

    resolve();
  });
}

// ======================
// TOAST DE NOTIFICACIÓN
// ======================
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

function cerrarSesion() {
  localStorage.clear(); // Elimina todos los datos guardados
  window.location.href = "index.html"; // Redirige al login o página principal
}
