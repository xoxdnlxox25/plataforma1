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

// Login Alumno con verificación desde hoja "Alumnos"
function loginAlumno() {
  const claseInput = document.getElementById("claseAlumno");
  const alumnoInput = document.getElementById("alumno");

  const clase = claseInput.value.trim();
  const alumno = alumnoInput.value.trim();

  if (!clase || !alumno) {
    mostrarToast("⚠ Por favor ingresa tu clase y tu nombre", "error");
    return;
  }

  fetch(`${URL}?accion=getAlumnos&clase=${clase}`)
    .then(res => res.json())
    .then(data => {
      const encontrado = data.find(a => a.NombreAlumno.toLowerCase() === alumno.toLowerCase());

      if (encontrado) {
        localStorage.setItem("tipo", "alumno");
        localStorage.setItem("clase", clase);
        localStorage.setItem("alumno", encontrado.NombreAlumno); // Guarda el nombre exacto
        window.location.href = "panel-alumno.html";
      } else {
        mostrarToast("❌ No se encontró el alumno en esa clase", "error");
        claseInput.value = "";
        alumnoInput.value = "";
      }
    })
    .catch(() => {
      mostrarToast("❌ Error al conectar con el servidor", "error");
      claseInput.value = "";
      alumnoInput.value = "";
    });
}

// ✅ Toast flotante moderno (reutilizable en todas partes)
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

