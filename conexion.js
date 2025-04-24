// URL de la API de Google Apps Script
const URL = 'https://script.google.com/macros/s/AKfycbxrr6_ltShilEONiAKsKEP0O250b4sU5s7Va-9TxZhNDmV3iaTCTrr8Se5A8Vw9TB8A/exec';

// URL para la API de los estudios (para ser usada si la necesitas)
const API_URL = 'https://script.google.com/macros/s/AKfycbxbDKjQn51qF-Tc8j8uaplSctI1UT9Wzfo-PEDwnk8Y0YEI2RrS2F7hyyjT4g2PcL1KGQ/exec';

// Función para obtener los estudios de la semana desde la hoja de Google
function obtenerEstudios(clase) {
  return fetch(`${API_URL}?accion=getEstudios&clase=${clase}`)
    .then(res => res.json())
    .then(data => {
      return data; // Retorna los estudios para su posterior procesamiento
    })
    .catch(() => {
      mostrarToast("❌ Error al cargar los estudios.", "error");
    });
}

// Función para obtener un estudio según el día
function obtenerEstudioPorDia(clase, dia) {
  return fetch(`${API_URL}?accion=getEstudioPorDia&clase=${clase}&dia=${dia}`)
    .then(res => res.json())
    .then(data => {
      return data; // Retorna el estudio del día para su posterior procesamiento
    })
    .catch(() => {
      mostrarToast("❌ Error al cargar el estudio de este día.", "error");
    });
}

// Función para mostrar toast flotante (reutilizable en todo el proyecto)
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
