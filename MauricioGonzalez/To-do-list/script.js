// 1. Referencias a elementos clave del DOM
const inputTarea = document.getElementById('input-tarea');
const btnAñadir = document.getElementById('btn-añadir');
const listaTareas = document.getElementById('lista-tareas');

// 2. Función para guardar el estado actual de las tareas en localStorage
function guardarTareas() {
    localStorage.setItem('tareasHTML', listaTareas.innerHTML);
}

// 3. Función para cargar las tareas guardadas al iniciar la página
function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareasHTML');
    if (tareasGuardadas) {
        listaTareas.innerHTML = tareasGuardadas;
        asignarEventosATareasExistentes(); // Re-asignar eventos
    }
}

// 4. Re-asignar eventos a tareas cargadas desde localStorage
function asignarEventosATareasExistentes() {
    const elementosLi = listaTareas.querySelectorAll('li');
    elementosLi.forEach(tareaLi => {
        tareaLi.addEventListener('click', function() {
            tareaLi.classList.toggle('completada');
            guardarTareas();
        });

        const botonEliminar = tareaLi.querySelector('.btn-eliminar');
        if (botonEliminar) {
            botonEliminar.addEventListener('click', function(evento) {
                evento.stopPropagation();
                listaTareas.removeChild(tareaLi);
                guardarTareas();
            });
        }
    });
}

// 5. Función principal para añadir una nueva tarea
function añadirTarea() {
    const textoTarea = inputTarea.value.trim();
    if (textoTarea === '') {
        alert('Por favor, escribe una tarea antes de añadirla.');
        return;
    }

    const nuevaTarea = document.createElement('li');
    nuevaTarea.textContent = textoTarea;

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'X';
    botonEliminar.classList.add('btn-eliminar');

    nuevaTarea.addEventListener('click', function() {
        nuevaTarea.classList.toggle('completada');
        guardarTareas();
    });

    botonEliminar.addEventListener('click', function(evento) {
        evento.stopPropagation();
        listaTareas.removeChild(nuevaTarea);
        guardarTareas();
    });

    nuevaTarea.appendChild(botonEliminar);
    listaTareas.appendChild(nuevaTarea);
    inputTarea.value = '';
    guardarTareas();
}

// 6. Asignar eventos iniciales
btnAñadir.addEventListener('click', añadirTarea);
inputTarea.addEventListener('keypress', function(evento) {
    if (evento.key === 'Enter') {
        añadirTarea();
    }
});

// 7. Cargar tareas al iniciar la página
cargarTareas();