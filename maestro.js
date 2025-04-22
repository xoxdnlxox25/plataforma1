const idClase = localStorage.getItem("clase");
document.getElementById("nombreClase").textContent = idClase;

// Cargar alumnos al iniciar
function cargarAlumnos() {
  fetch(`${URL}?accion=getAlumnos&clase=${idClase}`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaAlumnos");
      lista.innerHTML = "";

      data.forEach(alumno => {
        const li = document.createElement("li");
        li.innerHTML = `
          ${alumno.NombreAlumno} (${alumno.ID_ALUMNO})
          <button onclick="eliminarAlumno('${alumno.ID_ALUMNO}')">❌ Eliminar</button>
        `;
        lista.appendChild(li);
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

// Ver respuestas de todos los alumnos de la clase
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

// Cargar todo al iniciar
window.onload = cargarAlumnos;

