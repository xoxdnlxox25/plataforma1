// Mostrar datos del alumno
const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");

document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

// 🔄 Simulación: preguntas del día
const preguntasDelDia = [
  { numero: 1, pregunta: "¿Cuál es el primer mandamiento?", opciones: ["A. Amarás a Dios", "B. No robarás", "C. Honra a tu padre"] },
  { numero: 2, pregunta: "¿Quién escribió el libro de Juan?", opciones: ["A. Pablo", "B. Juan", "C. Pedro"] }
];

// Mostrar preguntas en pantalla
const container = document.getElementById("preguntasContainer");

preguntasDelDia.forEach(p => {
  const div = document.createElement("div");
  div.className = "pregunta";
  div.innerHTML = `
    <p><strong>Pregunta ${p.numero}:</strong> ${p.pregunta}</p>
    ${p.opciones.map((op, i) => `
      <label>
        <input type="radio" name="preg${p.numero}" value="${op[0]}" onchange="guardarRespuesta(${p.numero}, '${op[0]}')">
        ${op}
      </label><br>
    `).join("")}
  `;
  container.appendChild(div);
});

// Guardar respuesta automáticamente
function guardarRespuesta(numero, respuesta) {
  const fecha = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date());

  const datos = {
    accion: "guardarRespuesta",
    clase: idClase,
    alumno: nombreAlumno,
    dia: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1), // Capitaliza
    numero: numero,
    respuesta: respuesta,
    fecha: fecha
  };

  fetch(URL, {
    method: "POST",
    body: JSON.stringify(datos),
    headers: { "Content-Type": "application/json" }
  }).then(res => res.text())
    .then(respuesta => {
      console.log("Guardado:", respuesta);
    });
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}
