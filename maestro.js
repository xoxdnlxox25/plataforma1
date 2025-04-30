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
  fetch(`${URL}?accion=getAlumnos&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaAlumnos");
      const selector = document.getElementById("selectAlumno");
      lista.innerHTML = "";
      selector.innerHTML = '<option value="">Selecciona un alumno</option>';

      data.forEach(alumno => {
        const item = document.createElement("li");
        item.textContent = `${alumno.NombreAlumno} (${alumno.ID_ALUMNO})`;

        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = () => eliminarAlumno(alumno.ID_ALUMNO);
        item.appendChild(btn);

        lista.appendChild(item);

        const option = document.createElement("option");
        option.value = alumno.ID_ALUMNO;
        option.textContent = alumno.NombreAlumno;
        selector.appendChild(option);
      });
    });
}

// Agregar nuevo alumno
function agregarNuevoAlumno() {
  const nombre = document.getElementById("nuevoNombre").value.trim();
  const id = document.getElementById("nuevoID").value.trim();

  if (!nombre || !id) {
    mostrarToast("⚠️ Ingresa nombre e ID", "error");
    return;
  }

  const datos = new URLSearchParams();
  datos.append("accion", "agregarAlumno");
  datos.append("clase", idClase);
  datos.append("nombre", nombre);
  datos.append("id", id);

  fetch(URL, {
    method: "POST",
    body: datos
  })
    .then(res => res.text())
    .then(() => {
      mostrarToast("✅ Alumno agregado", "success");
      document.getElementById("nuevoNombre").value = "";
      document.getElementById("nuevoID").value = "";
      cargarAlumnos();
    });
}

// Eliminar alumno
function eliminarAlumno(id) {
  if (!confirm("¿Eliminar este alumno?")) return;

  const datos = new URLSearchParams();
  datos.append("accion", "eliminarAlumno");
  datos.append("clase", idClase);
  datos.append("id", id);

  fetch(URL, {
    method: "POST",
    body: datos
  })
    .then(res => res.text())
    .then(resp => {
      mostrarToast(resp.includes("✅") ? resp : "❌ No encontrado", resp.includes("✅") ? "success" : "error");
      cargarAlumnos();
    });
}

// Ver respuestas por alumno
function verRespuestasAlumno() {
  const idAlumno = document.getElementById("selectAlumno").value;
  if (!idAlumno) return;

  fetch(`${URL}?accion=getRespuestasAlumno&clase=${idClase}&alumno=${idAlumno}`)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("respuestasAlumno");
      contenedor.innerHTML = "";

      if (data.length === 0) {
        contenedor.innerHTML = "<p>No hay respuestas registradas.</p>";
        return;
      }

      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Día</th>
            <th>N°</th>
            <th>Respuesta</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td>${r.Dia}</td>
              <td>${r.PreguntaN}</td>
              <td>${r.Respuesta}</td>
              <td>${r.Fecha}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      contenedor.appendChild(tabla);
    });
}

// Ver resumen por clase con ✔️ ❌ ⏳
function verResumen() {
  fetch(`${URL}?accion=getResumenClase&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("resumenTabla");
      tbody.innerHTML = "";

      data.forEach(r => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td style="font-size: 12px;">${r.ID_ALUMNO}</td>
          <td>${r.Domingo === "✔️" ? "✔️" : r.Domingo === "❌" ? "❌" : "⏳"}</td>
          <td>${r.Lunes === "✔️" ? "✔️" : r.Lunes === "❌" ? "❌" : "⏳"}</td>
          <td>${r.Martes === "✔️" ? "✔️" : r.Martes === "❌" ? "❌" : "⏳"}</td>
          <td>${r.Miércoles === "✔️" ? "✔️" : r.Miércoles === "❌" ? "❌" : "⏳"}</td>
          <td>${r.Jueves === "✔️" ? "✔️" : r.Jueves === "❌" ? "❌" : "⏳"}</td>
          <td>${r.Viernes === "✔️" ? "✔️" : r.Viernes === "❌" ? "❌" : "⏳"}</td>
        `;
        tbody.appendChild(fila);
      });
    });
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

  contenedor.innerHTML = "";

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// --------------------------- INICIALIZACIÓN ---------------------------
cargarAlumnos();
