// 1. Elementos del DOM
const inputTarea = document.getElementById('input-tarea');
const listaTareas = document.getElementById('lista-tareas');
const fechaActualElemento = document.getElementById('fecha-actual');

// 2. Mostrar Fecha Actual
function mostrarFecha() {
    const opciones = { weekday: 'long', month: 'long', day: 'numeric' };
    const fecha = new Date();
    // Capitalizar la primera letra
    let fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
    fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
    fechaActualElemento.textContent = fechaTexto;
}

// 3. Cargar y Guardar Tareas
function guardarTareas() {
    localStorage.setItem('msTodoTasks', listaTareas.innerHTML);
}

function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('msTodoTasks');
    if (tareasGuardadas) {
        listaTareas.innerHTML = tareasGuardadas;
        asignarEventosATareasExistentes();
    }
}

// 4. Crear HTML de una Tarea
function crearElementoTarea(texto) {
    const li = document.createElement('li');
    li.classList.add('task-item');

    // Estructura: Checkbox + Texto + Botón Eliminar
    li.innerHTML = `
        <div class="task-checkbox-container">
            <div class="custom-checkbox"></div>
        </div>
        <span class="task-text">${texto}</span>
        <button class="btn-eliminar">×</button>
    `;

    asignarEventosTarea(li);
    return li;
}

// 5. Asignar Eventos a una Tarea (Nueva o Existente)
function asignarEventosTarea(li) {
    // Al hacer click en todo el item (o específicamente en el checkbox)
    li.addEventListener('click', function(e) {
        // Si el click fue en el botón de eliminar, no hacemos toggle
        if (e.target.classList.contains('btn-eliminar')) return;

        li.classList.toggle('completada');
        
        // Reproducir sonido opcional aquí
        // playSound(); 
        
        guardarTareas();
    });

    const btnEliminar = li.querySelector('.btn-eliminar');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', function() {
            // Animación de salida podría ir aquí
            listaTareas.removeChild(li);
            guardarTareas();
        });
    }
}

function asignarEventosATareasExistentes() {
    const tareas = listaTareas.querySelectorAll('.task-item');
    tareas.forEach(tarea => asignarEventosTarea(tarea));
}

// 6. Añadir Nueva Tarea
function añadirTarea() {
    const texto = inputTarea.value.trim();
    if (texto === '') return; // No hacer nada si está vacío

    const nuevaTarea = crearElementoTarea(texto);
    listaTareas.appendChild(nuevaTarea);
    
    // Scroll al final
    listaTareas.scrollTop = listaTareas.scrollHeight;
    
    inputTarea.value = '';
    guardarTareas();
}

// 7. Event Listener para el Input
inputTarea.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        añadirTarea();
    }
});

// Inicialización
mostrarFecha();
cargarTareas();