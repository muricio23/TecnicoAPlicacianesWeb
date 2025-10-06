// ⭐ ¡IMPORTANTE! Reemplaza 'TU_API_KEY' con tu clave real de OpenWeatherMap.
const API_KEY = '70c8ce3c7c84819b03a84ba3a564753c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Referencias a los elementos del DOM (HTML)
const ciudadInput = document.getElementById('ciudad-input');
const buscarBtn = document.getElementById('buscar-btn');
const infoClimaDiv = document.getElementById('info-clima');
const ciudadNombre = document.getElementById('ciudad-nombre');
const temperaturaDisplay = document.getElementById('temperatura');
const descripcionDisplay = document.getElementById('descripcion');
const iconoClima = document.getElementById('icono-clima');
const mensajeError = document.getElementById('mensaje-error');

// Event Listener para el botón de búsqueda
buscarBtn.addEventListener('click', () => {
    const ciudad = ciudadInput.value.trim();
    if (ciudad) {
        obtenerClima(ciudad);
    } else {
        mostrarError('Por favor, ingresa el nombre de una ciudad.');
    }
});

// Función principal para obtener los datos del clima
async function obtenerClima(ciudad) {
    // 1. Ocultar la información anterior y el mensaje de error
    infoClimaDiv.style.display = 'none';
    mensajeError.style.display = 'none';

    // 2. Construir la URL de la API
    // Usamos 'units=metric' para obtener la temperatura en Celsius
    // Usamos 'lang=es' para obtener la descripción del clima en español
    const url = `${BASE_URL}?q=${ciudad}&units=metric&lang=es&appid=${API_KEY}`;

    try {
        // 3. Hacer la solicitud a la API
        const respuesta = await fetch(url);
        
        // 4. Verificar si la respuesta fue exitosa (código 200)
        if (!respuesta.ok) {
            // Si la respuesta no es OK (ej. 404 Not Found), lanzamos un error
            throw new Error('Ciudad no encontrada.');
        }

        // 5. Convertir la respuesta a formato JSON
        const datos = await respuesta.json();

        // 6. Actualizar la interfaz de usuario con los datos
        actualizarUI(datos);

    } catch (error) {
        // 7. Manejar errores (ej. fallo de red o ciudad no encontrada)
        console.error('Error al obtener el clima:', error);
        mostrarError(error.message === 'Ciudad no encontrada.' ? 'No se pudo encontrar esa ciudad. Intenta de nuevo.' : 'Error de conexión. Intenta más tarde.');
    }
}

// Función para actualizar los elementos HTML con los datos obtenidos
function actualizarUI(datos) {
    // Extraer datos relevantes
    const temp = Math.round(datos.main.temp); // Redondeamos la temperatura
    const descripcion = datos.weather[0].description;
    const icono = datos.weather[0].icon;
    const nombre = datos.name;

    // Actualizar el contenido de los elementos
    ciudadNombre.textContent = nombre;
    temperaturaDisplay.textContent = `${temp}°C`;
    descripcionDisplay.textContent = descripcion;
    
    // Construir la URL del ícono del clima
    iconoClima.src = `http://openweathermap.org/img/wn/${icono}@2x.png`;
    iconoClima.alt = descripcion;

    // Mostrar el contenedor de información
    infoClimaDiv.style.display = 'block';
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
    // Aseguramos que la info del clima esté oculta si hay un error
    infoClimaDiv.style.display = 'none'; 
}