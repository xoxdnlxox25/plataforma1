// Login Maestro
function loginMaestro() {
  const claseInput = document.getElementById("claseMaestro");
  const claveInput = document.getElementById("claveMaestro");

  const clase = claseInput.value.trim();
  const clave = claveInput.value.trim();

  fetch(`${URL}?accion=loginMaestro&clase=${clase}&clave=${clave}`)
    .then(res => res.text())
    .then(data => {
      if (data === "ok") {
        localStorage.setItem("tipo", "maestro");
        localStorage.setItem("clase", clase);
        window.location.href = "panel-maestro.html";
      } else {
        mostrarToast("❌ Contraseña incorrecta o clase no válida", "error");
        claseInput.value = "";
        claveInput.value = "";
      }
    })
    .catch(() => {
      mostrarToast("❌ Error al conectar con el servidor", "error");
      claseInput.value = "";
      claveInput.value = "";
    });
}

// Login Alumno (por ID_ALUMNO)
function loginAlumno() {
  const claseInput = document.getElementById("claseAlumno");
  const idInput = document.getElementById("alumno");

  const clase = claseInput.value.trim();
  const idAlumno = idInput.value.trim();

  if (!clase || !idAlumno) {
    mostrarToast("⚠ Por favor ingresa tu clase y tu ID de alumno", "error");
    return;
  }

  fetch(`${URL}?accion=getAlumnos&clase=${clase}`)
    .then(res => res.json())
    .then(data => {
      const alumnoEncontrado = data.find(a => a.ID_ALUMNO.toLowerCase() === idAlumno.toLowerCase());

      if (alumnoEncontrado) {
        localStorage.setItem("tipo", "alumno");
        localStorage.setItem("clase", clase);
        localStorage.setItem("alumno", alumnoEncontrado.NombreAlumno); // Guardamos el nombre exacto
        localStorage.setItem("idAlumno", alumnoEncontrado.ID_ALUMNO); // Guardamos el ID también
        window.location.href = "panel-alumno.html";
      } else {
        mostrarToast("❌ ID no encontrado en esa clase", "error");
        claseInput.value = "";
        idInput.value = "";
      }
    })
    .catch(() => {
      mostrarToast("❌ Error al conectar con el servidor", "error");
      claseInput.value = "";
      idInput.value = "";
    });
}

// ✅ Toast flotante
function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toast-container");
  if (!contenedor) return;

  // Eliminar toasts existentes antes de mostrar uno nuevo
  contenedor.innerHTML = "";

  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
