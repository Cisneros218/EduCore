/* =========================
   ESTADO GLOBAL
========================= */

const STORAGE_KEY = "mathmentor_data";
const CHAT_DOCENTE_KEY = "mathmentor_chat_docente";

let state = { alumnos: [] };
let alumnoIAActual = null;
let chatDocente = [];

/* =========================
   INICIALIZACIÓN
========================= */

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    cargarChatDocente();
    inicializarEventos();
    renderApp();
});

/* =========================
   PERSISTENCIA
========================= */

function cargarDatos() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data) state = data;
}

function guardarDatos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cargarChatDocente() {
    const data = JSON.parse(localStorage.getItem(CHAT_DOCENTE_KEY));
    if (data) chatDocente = data;
}

function guardarChatDocente() {
    localStorage.setItem(CHAT_DOCENTE_KEY, JSON.stringify(chatDocente));
}

/* =========================
   UTILIDADES
========================= */

function generarID() {
    return crypto.randomUUID();
}

function fechaHoyISO() {
    return new Date().toISOString().split("T")[0];
}

function obtenerAlumno(id) {
    return state.alumnos.find(a => a.id === id);
}

/* =========================
   EVENTOS
========================= */

function inicializarEventos() {

    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            cambiarSeccion(btn.dataset.seccion);
        });
    });

    const formAlumno = document.getElementById("formAlumno");
    if (formAlumno) {
        formAlumno.addEventListener("submit", e => {
            e.preventDefault();
            agregarAlumno();
        });
    }
}

/* =========================
   NAVEGACIÓN
========================= */

function cambiarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
    const sec = document.getElementById(id);
    if (sec) sec.classList.remove("oculto");

    document.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("active"));
    const btn = document.querySelector(`[data-seccion="${id}"]`);
    if (btn) btn.classList.add("active");

    if (id === "iaDocente") renderChatDocente();
}

/* =========================
   ALUMNOS
========================= */

function agregarAlumno() {
    const nombre = document.getElementById("nombreAlumno").value.trim();
    const edad = document.getElementById("edadAlumno").value.trim();
    const nivel = document.getElementById("nivelAlumno").value;

    if (!nombre || !edad) {
        alert("Complete los campos obligatorios");
        return;
    }

    const nuevo = {
        id: generarID(),
        nombre,
        edad,
        nivel,
        fechaRegistro: fechaHoyISO(),
        asistencia: [],
        progreso: [],
        historialIA: []
    };

    state.alumnos.push(nuevo);
    guardarDatos();
    renderApp();

    document.getElementById("formAlumno").reset();
}

function eliminarAlumno(id) {
    state.alumnos = state.alumnos.filter(a => a.id !== id);
    guardarDatos();
    renderApp();
}

/* =========================
   IA POR ALUMNO (modal básico)
========================= */

function abrirPanelIA(id) {
    alumnoIAActual = obtenerAlumno(id);
    document.getElementById("modalIAAlumno").classList.remove("oculto");
}

function cerrarModalIA() {
    document.getElementById("modalIAAlumno").classList.add("oculto");
}

function generarIAAlumno() {
    const tipo = document.getElementById("tipoIAAlumno").value;
    const tema = document.getElementById("temaIAAlumno").value.trim();
    const resultadoDiv = document.getElementById("resultadoIAAlumno");

    if (!tema) {
        alert("Especifica un tema");
        return;
    }

    const contenido = `Simulación IA: Generando ${tipo} sobre "${tema}" para ${alumnoIAActual.nombre}`;
    resultadoDiv.innerHTML = contenido;

    alumnoIAActual.historialIA.push({
        fecha: fechaHoyISO(),
        tipo,
        tema,
        contenido
    });

    guardarDatos();
}

/* =========================
   ASISTENCIA
========================= */

function registrarAsistencia(id, estado) {
    const alumno = obtenerAlumno(id);
    const hoy = fechaHoyISO();

    if (alumno.asistencia.find(a => a.fecha === hoy)) {
        alert("Ya se registró asistencia hoy");
        return;
    }

    alumno.asistencia.push({ fecha: hoy, estado });
    guardarDatos();
    renderAsistencia();
}

/* =========================
   PROGRESO
========================= */

function registrarProgreso(id, estado) {
    if (!estado) return;

    const alumno = obtenerAlumno(id);
    alumno.progreso.push({ fecha: fechaHoyISO(), estado });
    guardarDatos();
    renderProgreso();
}

/* =========================
   IA DOCENTE (chat simulado)
========================= */

function renderChatDocente() {
    const chatBox = document.getElementById("chatDocente");
    chatBox.innerHTML = "";

    chatDocente.forEach(msg => {
        const div = document.createElement("div");
        div.className = "chat-message " + msg.role;
        div.innerHTML = `<strong>${msg.role === "user" ? "Tú" : "IA"}:</strong><br>${msg.content}`;
        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function enviarMensajeDocente() {
    const input = document.getElementById("inputDocente");
    const mensaje = input.value.trim();
    if (!mensaje) return;

    chatDocente.push({ role: "user", content: mensaje });
    renderChatDocente();
    input.value = "";

    // Simulación de IA
    chatDocente.push({
        role: "assistant",
        content: "Simulación IA: Recibido tu mensaje -> " + mensaje
    });

    renderChatDocente();
    guardarChatDocente();
}

function limpiarChatDocente() {
    chatDocente = [];
    guardarChatDocente();
    renderChatDocente();
}

/* =========================
   RENDERS
========================= */

function renderApp() {
    renderAlumnos();
    renderAsistencia();
    renderProgreso();
    renderResumen();
    renderPlanificador();
}

function renderAlumnos() {
    const cont = document.getElementById("listaAlumnos");
    cont.innerHTML = "";

    state.alumnos.forEach(alumno => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${alumno.nombre}</strong><br>
            ${alumno.edad} años<br>
            ${alumno.nivel}<br><br>
            <button class="btn-primary eliminar">Eliminar</button>
            <button class="btn-secondary ia-btn">🤖 IA</button>
        `;

        card.querySelector(".eliminar").addEventListener("click", () => eliminarAlumno(alumno.id));
        card.querySelector(".ia-btn").addEventListener("click", () => abrirPanelIA(alumno.id));
        cont.appendChild(card);
    });
}

function renderAsistencia() {
    const cont = document.getElementById("listaAsistencia");
    cont.innerHTML = "";

    state.alumnos.forEach(alumno => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <strong>${alumno.nombre}</strong><br><br>
            <button class="btn-primary presente">✔ Presente</button>
            <button class="btn-primary ausente">✘ Ausente</button>
        `;

        card.querySelector(".presente").addEventListener("click", () => registrarAsistencia(alumno.id, "Presente"));
        card.querySelector(".ausente").addEventListener("click", () => registrarAsistencia(alumno.id, "Ausente"));
        cont.appendChild(card);
    });
}

function renderProgreso() {
    const cont = document.getElementById("listaProgreso");
    cont.innerHTML = "";

    state.alumnos.forEach(alumno => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<strong>${alumno.nombre}</strong><br><br>`;

        const select = document.createElement("select");
        select.innerHTML = `
            <option value="">Estado académico</option>
            <option value="Dominado">Dominado</option>
            <option value="En proceso">En proceso</option>
            <option value="Reforzar">Reforzar</option>
        `;
        select.addEventListener("change", e => registrarProgreso(alumno.id, e.target.value));

        card.appendChild(select);
        cont.appendChild(card);
    });
}

function renderResumen() {
    const totalAlumnos = state.alumnos.length;
    const totalAsistencias = state.alumnos.reduce((acc, a) => acc + a.asistencia.length, 0);
    const totalProgreso = state.alumnos.reduce((acc, a) => acc + a.progreso.length, 0);

    document.getElementById("resumen").innerHTML = `
        <div class="card">Total alumnos: ${totalAlumnos}</div>
        <div class="card">Registros asistencia: ${totalAsistencias}</div>
        <div class="card">Registros progreso: ${totalProgreso}</div>
    `;
}

function renderPlanificador() {
    document.getElementById("contenidoPlanificador").innerHTML = `
        <div class="card"><h3>Nivel 1</h3>Operaciones, fracciones, porcentajes</div>
        <div class="card"><h3>Nivel 2</h3>Ecuaciones, expresiones, problemas</div>
        <div class="card"><h3>Nivel 3</h3>Sistemas, factorización, Pitágoras</div>
    `;
}
