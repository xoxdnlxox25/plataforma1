const idClase = localStorage.getItem("clase");
const tipoUsuario = localStorage.getItem("tipo");

// Verifica que sea maestro, si no redirige
if (tipoUsuario !== "maestro" || !idClase) {
  window.location.href = "index.html";
}

document.getElementById("nombreClase").textContent = idClase;

// Cargar alumnos en la lista y en el selector
function cargarAlumnos() {
  fetch(`${URL}?accion=getAlumnos&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaAlumnos");
      const selector = document.getElementById("selectAlumno");
      lista.innerHTML = "";
      selector.innerHTML = '<option value="">Selecciona un alumno</option>';

      data.forEach(alumno => {
        // Lista
        const li = document.createElement("li");
        li.innerHTML = `
          ${alumno.NombreAlumno} (${alumno.ID_ALUMNO})
          <button onclick="eliminarAlumno('${alumno.ID_ALUMNO}')">❌ Eliminar</button>
        `;
        lista.appendChild(li);

        // Selector
        const option = document.createElement("option");
        option.value = alumno.ID_ALUMNO;
        option.textContent = alumno.NombreAlumno;
        selector.appendChild(option);
      });
    });
}

// Agregar nuevo alumno
function agregarAlumno() {
  const nombre = document.getElementById("nuevoAlumno").value;
  const id = document.getElementById("nuevoID").value;

  if (!nombre || !id) {
    alert("⚠ Por favor completa todos los campos.");
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
    .then(resp => {
      alert(resp);
      cargarAlumnos();
      document.getElementById("nuevoAlumno").value = "";
      document.getElementById("nuevoID").value = "";
    });
}

// Eliminar alumno
function eliminarAlumno(idAlumno) {
  const datos = new URLSearchParams();
  datos.append("accion", "eliminarAlumno");
  datos.append("clase", idClase);
  datos.append("id", idAlumno);

  fetch(URL, {
    method: "POST",
    body: datos
  })
    .then(res => res.text())
    .then(resp => {
      alert(resp);
      cargarAlumnos();
    });
}

// Ver respuestas de toda la clase
function verRespuestas() {
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
        li.innerHTML = `
          <strong>${r.ID_ALUMNO}</strong> — ${r.Dia} (P${r.PreguntaN}): <em>${r.Respuesta}</em> [${r.Fecha}]
        `;
        lista.appendChild(li);
      });
    });
}

// 🔍 Ver respuestas filtradas por alumno
function verRespuestasPorAlumno() {
  const idAlumno = document.getElementById("selectAlumno").value;

  if (!idAlumno) {
    alert("⚠ Por favor selecciona un alumno.");
    return;
  }

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
        li.innerHTML = `
          Día: <strong>${r.Dia}</strong> | Pregunta ${r.PreguntaN} → <em>${r.Respuesta}</em> [${r.Fecha}]
        `;
        lista.appendChild(li);
      });
    });
}

// 📊 Ver resumen de respuestas por alumno
function verResumen() {
  fetch(`${URL}?accion=getResumenClase&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#tablaResumen tbody");
      tbody.innerHTML = "";

      if (data.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="2">No hay datos para mostrar.</td>`;
        tbody.appendChild(fila);
        return;
      }

      data.forEach(r => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${r.ID_ALUMNO}</td>
          <td>${r.Total}</td>
        `;
        tbody.appendChild(fila);
      });
    });
}

// 🔒 Cerrar sesión
function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

window.onload = cargarAlumnos;
