// --------------------------- VARIABLES ---------------------------
const idClase = localStorage.getItem("clase");
const tipoUsuario = localStorage.getItem("tipo");
const nombreMaestro = localStorage.getItem("maestro") || "Maestro";

// Redirigir si no es maestro
if (tipoUsuario !== "maestro" || !idClase) {
  window.location.href = "index.html";
}

// Mostrar datos en pantalla
document.getElementById("nombreClase").textContent = idClase;
document.getElementById("nombreMaestro").textContent = nombreMaestro;

let modalActivo = false;

// --------------------------- FUNCIONES ---------------------------

// Cargar alumnos de la clase
function cargarAlumnos() {
  mostrarSpinner("⏳ Cargando alumnos...");
  fetch(`${URL}?accion=getAlumnos&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaAlumnos");
      const selector = document.getElementById("selectAlumno");
      lista.innerHTML = "";
      selector.innerHTML = '<option value="">Selecciona un alumno</option>';

      data.forEach(alumno => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${alumno.NombreAlumno} (${alumno.ID_ALUMNO})
          <button onclick="confirmarEliminarAlumno('${alumno.ID_ALUMNO}', '${alumno.NombreAlumno}')">❌ Eliminar</button>
        `;
        lista.appendChild(li);

        const option = document.createElement("option");
        option.value = alumno.ID_ALUMNO;
        option.textContent = alumno.NombreAlumno;
        selector.appendChild(option);
      });
    })
    .catch(() => {
      mostrarToast("❌ Error al cargar alumnos", "error");
    })
    .finally(() => {
      ocultarSpinner();
    });
}

// Confirmar eliminación de alumno
function confirmarEliminarAlumno(idAlumno, nombreAlumno) {
  if (modalActivo) return;
  modalActivo = true;

  const contenedor = document.getElementById("toast-container");
  contenedor.innerHTML = "";

  const confirmBox = document.createElement("div");
  confirmBox.className = "toast confirm-box";
  confirmBox.innerHTML = `
    <div style="font-size: 1.1rem; margin-bottom: 8px;">❓ ¿Eliminar a <strong>${nombreAlumno}</strong>?</div>
    <div style="text-align: right;">
      <button class="btn-confirm" style="margin-right: 10px;">Sí</button>
      <button class="btn-cancel">Cancelar</button>
    </div>
  `;

  contenedor.appendChild(confirmBox);

  confirmBox.querySelector(".btn-cancel").onclick = () => {
    confirmBox.remove();
    modalActivo = false;
  };

  confirmBox.querySelector(".btn-confirm").onclick = () => {
    confirmBox.remove();
    modalActivo = false;
    eliminarAlumno(idAlumno);
  };
}

// Eliminar alumno de la base
function eliminarAlumno(idAlumno) {
  const datos = new URLSearchParams();
  datos.append("accion", "eliminarAlumno");
  datos.append("clase", idClase);
  datos.append("id", idAlumno);

  mostrarSpinner("⏳ Eliminando alumno...");
  fetch(URL, { method: "POST", body: datos })
    .then(res => res.text())
    .then(resp => {
      mostrarToast(resp.includes('✅') ? "✅ Alumno eliminado." : "⚠ No se pudo eliminar.", resp.includes('✅') ? "success" : "error");
      cargarAlumnos();
    })
    .catch(() => {
      mostrarToast("❌ Error al eliminar", "error");
    })
    .finally(() => {
      ocultarSpinner();
    });
}

// Agregar nuevo alumno
function agregarAlumno() {
  const nombre = document.getElementById("nuevoAlumno").value.trim();
  const id = document.getElementById("nuevoID").value.trim();

  if (!nombre || !id) {
    mostrarToast("⚠ Por favor completa todos los campos.", "error");
    return;
  }

  const datos = new URLSearchParams();
  datos.append("accion", "agregarAlumno");
  datos.append("clase", idClase);
  datos.append("nombre", nombre);
  datos.append("id", id);

  mostrarSpinner("⏳ Agregando alumno...");
  fetch(URL, { method: "POST", body: datos })
    .then(res => res.text())
    .then(resp => {
      mostrarToast(resp, "success");
      cargarAlumnos();
      document.getElementById("nuevoAlumno").value = "";
      document.getElementById("nuevoID").value = "";
    })
    .finally(() => {
      ocultarSpinner();
    });
}

// Ver respuestas de toda la clase
function verRespuestas() {
  mostrarSpinner("⏳ Cargando respuestas...");
  fetch(`${URL}?accion=getRespuestasClase&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaRespuestas");
      lista.innerHTML = "";

      if (data.length === 0) {
        lista.innerHTML = "<li>No hay respuestas registradas aún.</li>";
        return;
      }

      data.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${r.ID_ALUMNO}</strong> — ${r.Dia} (P${r.PreguntaN}): <em>${r.Respuesta}</em> [${r.Fecha}]`;
        lista.appendChild(li);
      });
    })
    .finally(() => {
      ocultarSpinner();
    });
}

// Ver respuestas específicas de un alumno
function verRespuestasPorAlumno() {
  const idAlumno = document.getElementById("selectAlumno").value;
  if (!idAlumno) {
    mostrarToast("⚠ Por favor selecciona un alumno.", "error");
    return;
  }

  mostrarSpinner("⏳ Cargando respuestas del alumno...");
  fetch(`${URL}?accion=getRespuestasAlumno&clase=${idClase}&alumno=${idAlumno}`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("respuestasAlumno");
      lista.innerHTML = "";

      if (data.length === 0) {
        lista.innerHTML = "<li>Este alumno aún no ha registrado respuestas.</li>";
        return;
      }

      data.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `Día: <strong>${r.Dia}</strong> | Pregunta ${r.PreguntaN} → <em>${r.Respuesta}</em> [${r.Fecha}]`;
        lista.appendChild(li);
      });
    })
    .finally(() => {
      ocultarSpinner();
    });
}

// ✅ Ver resumen general de respuestas (✔️ ❌ ⏳ dinámico)
function verResumen() {
  mostrarSpinner("⏳ Cargando resumen...");
  fetch(`${URL}?accion=getResumenClase&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#tablaResumen tbody");
      const thead = document.querySelector("#tablaResumen thead");
      tbody.innerHTML = "";

      thead.innerHTML = `
        <tr>
          <th>Alumno</th>
          <th>D</th>
          <th>L</th>
          <th>M</th>
          <th>Mi</th>
          <th>J</th>
          <th>V</th>
        </tr>
      `;

      if (data.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="7">No hay datos para mostrar.</td>`;
        tbody.appendChild(fila);
        return;
      }

      data.forEach(r => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td style="font-size: 12px;">${r.ID_ALUMNO}</td>
          <td>${r.Domingo || ""}</td>
          <td>${r.Lunes || ""}</td>
          <td>${r.Martes || ""}</td>
          <td>${r.Miércoles || ""}</td>
          <td>${r.Jueves || ""}</td>
          <td>${r.Viernes || ""}</td>
        `;
        tbody.appendChild(fila);
      });
    })
    .finally(() => {
      ocultarSpinner();
    });
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Mostrar toast de notificación
function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toast-container");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Spinner para cargar
function mostrarSpinner(mensaje = "⏳ Cargando...") {
  const contenedor = document.getElementById("toast-container");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  const spinner = document.createElement("div");
  spinner.className = "toast info";
  spinner.textContent = mensaje;
  contenedor.appendChild(spinner);
}

function ocultarSpinner() {
  const contenedor = document.getElementById("toast-container");
  if (!contenedor) return;
  contenedor.innerHTML = "";
}

// --------------------------- INICIO ---------------------------
window.onload = () => {
  cargarAlumnos();

  // 🔧 SOLUCIÓN: Ocultar todos los contenidos desplegables al cargar
  document.querySelectorAll(".bloque .contenido").forEach(div => {
    div.style.display = "none";
  });

  // Activar toggle al hacer clic
  document.querySelectorAll(".bloque h3").forEach(titulo => {
    titulo.addEventListener("click", () => {
      const contenido = titulo.nextElementSibling;
      contenido.style.display = contenido.style.display === "block" ? "none" : "block";
    });
  });
};
