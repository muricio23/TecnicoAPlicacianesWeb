// ----------------------------------------------------------------------
// 1. Referencias del DOM
// ----------------------------------------------------------------------
const inputTarea = document.getElementById('input-tarea');
const inputFechaLimite = document.getElementById('input-fecha-limite');
const inputImportancia = document.getElementById('input-importancia');
const btnAñadir = document.getElementById('btn-añadir');
const listaTareas = document.getElementById('lista-tareas');

// Array para guardar los objetos de las tareas
let tareas = [];

// ----------------------------------------------------------------------
// 2. Funciones de Persistencia (Guardar y Cargar el Array de Objetos)
// ----------------------------------------------------------------------

function guardarTareas() {
    // Convierte el array de JavaScript a una cadena JSON para guardarlo
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
        // Convierte la cadena JSON de vuelta a un array de JavaScript
        tareas = JSON.parse(tareasGuardadas);
        renderizarTareas();
    }
}

// ----------------------------------------------------------------------
// 3. Lógica de Fecha (Restricción de fecha mínima)
// ----------------------------------------------------------------------

/**
 * Configura el atributo 'min' del input de fecha para que no se puedan seleccionar fechas pasadas.
 */
function configurarMinFecha() {
    const hoy = new Date();
    
    // Formatear la fecha a YYYY-MM-DD
    const año = hoy.getFullYear();
    // Sumar 1 al mes (es base 0) y usar padStart para asegurar 2 dígitos ('01', '12', etc.)
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); 
    const dia = String(hoy.getDate()).padStart(2, '0');

    const fechaMinima = `${año}-${mes}-${dia}`;
    
    // Aplicar la fecha mínima al input HTML
    inputFechaLimite.min = fechaMinima;
}


// ----------------------------------------------------------------------
// 4. Renderizado y Lógica de Interacción
// ----------------------------------------------------------------------

// Dibuja todas las tareas en el DOM basándose en el array 'tareas'
function renderizarTareas() {
    listaTareas.innerHTML = ''; // Limpiar lista actual

    // Ordenar las tareas: podrías ordenar por importancia, por ejemplo:
    // tareas.sort((a, b) => a.importancia === 'alta' ? -1 : 1); 

    tareas.forEach(tarea => {
        const nuevaTareaLi = document.createElement('li');
        nuevaTareaLi.dataset.id = tarea.id;

        if (tarea.completada) {
            nuevaTareaLi.classList.add('completada');
        }

        nuevaTareaLi.classList.add(tarea.importancia); // Estilo según importancia

        // Contenido de la tarea: texto + fecha límite
        nuevaTareaLi.innerHTML = `
            <div>
                <span class="tarea-texto">${tarea.texto}</span>
                <span class="tarea-fecha-limite">(${tarea.fechaLimite || 'Sin fecha'})</span>
            </div>
        `;

        // Botón de eliminar
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'X';
        botonEliminar.classList.add('btn-eliminar');

        // Evento eliminar
        botonEliminar.addEventListener('click', function(e) {
            e.stopPropagation();
            eliminarTarea(tarea.id);
        });

        // Evento marcar como completada
        nuevaTareaLi.addEventListener('click', function() {
            alternarCompletada(tarea.id);
        });

        nuevaTareaLi.appendChild(botonEliminar);
        listaTareas.appendChild(nuevaTareaLi);
    });
}

// Añade una nueva tarea al array y la dibuja
function añadirTarea() {
    const textoTarea = inputTarea.value.trim();
    const fechaLimite = inputFechaLimite.value; // Obtener el valor de la fecha

    // VALIDACIÓN 1: Campo de texto vacío
    if (textoTarea === '') {
        alert('Por favor, escribe una tarea antes de añadirla.');
        return;
    }

    // VALIDACIÓN 2: Fecha en el pasado (Validación de respaldo en JS)
    if (fechaLimite) { 
        const hoy = new Date();
        // Limpiar la hora de 'hoy' para comparar solo el día
        hoy.setHours(0, 0, 0, 0); 
        
        // La fecha seleccionada
        const fechaSeleccionada = new Date(fechaLimite);
        
        if (fechaSeleccionada < hoy) {
            alert('¡Error! La fecha límite no puede ser anterior al día de hoy.');
            return; // Detiene la ejecución
        }
    }

    // Creación del objeto tarea si las validaciones pasan
    const nuevaTarea = {
        id: Date.now(),
        texto: textoTarea,
        completada: false,
        fechaLimite: fechaLimite || 'N/A', // Usar el valor validado o 'N/A'
        importancia: inputImportancia.value
    };

    tareas.push(nuevaTarea);
    guardarTareas();
    renderizarTareas();

    // Limpiar campos
    inputTarea.value = '';
    inputFechaLimite.value = '';
    inputImportancia.value = 'normal';
}

// Alterna el estado de completada de una tarea
function alternarCompletada(id) {
    const tareaIndex = tareas.findIndex(t => t.id === id);
    if (tareaIndex !== -1) {
        tareas[tareaIndex].completada = !tareas[tareaIndex].completada;
        guardarTareas();
        renderizarTareas();
    }
}

// Elimina una tarea del array
function eliminarTarea(id) {
    // Filtra el array, manteniendo solo las tareas cuyo ID no coincida con el que se quiere eliminar
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas();
    renderizarTareas();
}

// ----------------------------------------------------------------------
// 5. Inicialización y Eventos
// ----------------------------------------------------------------------

// 1. Configurar la fecha mínima permitida al cargar
configurarMinFecha();

// 2. Asignar eventos de usuario
btnAñadir.addEventListener('click', añadirTarea);
inputTarea.addEventListener('keypress', function(evento) {
    if (evento.key === 'Enter') {
        añadirTarea();
    }
});

// 3. Cargar tareas guardadas
cargarTareas();