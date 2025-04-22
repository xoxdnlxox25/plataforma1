
// Cargar clases automáticamente
window.onload = () => {
  fetch(\`\${URL}?accion=getClases\`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("claseAlumno");
      data.forEach(clase => {
        const option = document.createElement("option");
        option.value = clase.ID_CLASE;
        option.textContent = clase.NombreClase;
        select.appendChild(option);
      });
    });
};

// Cargar alumnos según clase
function cargarAlumnos() {
  const clase = document.getElementById("claseAlumno").value;
  fetch(\`\${URL}?accion=getAlumnos&clase=\${clase}\`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("alumno");
      select.innerHTML = \`<option value="">Selecciona tu nombre</option>\`;
      data.forEach(alumno => {
        const option = document.createElement("option");
        option.value = alumno.ID_ALUMNO;
        option.textContent = alumno.NombreAlumno;
        select.appendChild(option);
      });
    });
}

// Login Maestro
function loginMaestro() {
  const clase = document.getElementById("claseMaestro").value;
  const clave = document.getElementById("claveMaestro").value;

  fetch(\`\${URL}?accion=loginMaestro&clase=\${clase}&clave=\${clave}\`)
    .then(res => res.text())
    .then(data => {
      if (data === "ok") {
        localStorage.setItem("tipo", "maestro");
        localStorage.setItem("clase", clase);
        window.location.href = "panel-maestro.html";
      } else {
        alert("Contraseña incorrecta");
      }
    });
}

// Login Alumno
function loginAlumno() {
  const clase = document.getElementById("claseAlumno").value;
  const alumno = document.getElementById("alumno").value;

  if (clase && alumno) {
    localStorage.setItem("tipo", "alumno");
    localStorage.setItem("clase", clase);
    localStorage.setItem("alumno", alumno);
    window.location.href = "panel-alumno.html";
  } else {
    alert("Selecciona clase y alumno");
  }
}
