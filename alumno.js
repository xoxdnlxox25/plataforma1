const nombreAlumno = localStorage.getItem("alumno");
const idClase = localStorage.getItem("clase");

document.getElementById("nombreAlumno").textContent = nombreAlumno;
document.getElementById("nombreClase").textContent = idClase;

const preguntasDelDia = [
  { numero: 1, pregunta: "¿Cuál es el primer mandamiento?", opciones: ["A. Amarás a Dios", "B. No robarás", "C. Honra a tu padre"] },
  { numero: 2, pregunta: "¿Quién escribió el libro de Juan?", opciones: ["A. Pablo", "B. Juan", "C. Pedro"] }
];

const container = document.getElementById("preguntasContainer");

preguntasDelDia.forEach(p => {
  const div = document.createElement("div");
  div.className = "pregunta";
  div.innerHTML = `
    <p><strong>Pregunta ${p.numero}:</strong> ${p.pregunta}</p>
    ${p.opciones.map(op => `
      <label>
        <input type="radio" name="preg${p.numero}" value="${op[0]}"> ${op}
      </label><br>
    `).join("")}
  `;
  container.appendChild(div);
});

function enviarRespuestas() {
  const fecha = new Date().toISOString().split("T")[0];
  const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date());
  let completas = true;

  preguntasDelDia.forEach(p => {
    const seleccionada = document.querySelector(`input[name="preg${p.numero}"]:checked`);
    if (!seleccionada) {
      alert(`Por favor responde la pregunta ${p.numero}`);
      completas = false;
      return;
    }

    const datos = {
      accion: "guardarRespuesta",
      clase: idClase,
      alumno: nombreAlumno,
      dia: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
      numero: p.numero,
      respuesta: seleccionada.value,
      fecha: fecha
    };

    fetch(URL, {
      method: "POST",
      body: JSON.stringify(datos),
      headers: { "Content-Type": "application/json" }
    })
    .then(res => res.text())
    .then(resp => {
      console.log("Guardado:", resp);
    });
  });

  if (completas) {
    alert("✅ ¡Respuestas enviadas correctamente!");
  }
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

