// ===============================================
// CONFIGURACIÓN DE LA API
// ===============================================

// ⭐ ¡IMPORTANTE! OpenWeatherMap requiere unos minutos para activar tu clave.
// Clave API de OpenWeatherMap (mantener esta línea con tu clave real)
const API_KEY = '70c8ce3c7c84819b03a84ba3a564753c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';


// ===============================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ===============================================

const ciudadInput = document.getElementById('ciudad-input');
const buscarBtn = document.getElementById('buscar-btn');
const infoClimaDiv = document.getElementById('info-clima');
const mensajeError = document.getElementById('mensaje-error');

// Elementos de información principal
const ciudadNombre = document.getElementById('ciudad-nombre');
const temperaturaDisplay = document.getElementById('temperatura');
const descripcionDisplay = document.getElementById('descripcion');
const iconoClima = document.getElementById('icono-clima');

// ⭐ NUEVOS ELEMENTOS: Detalles adicionales
const humedadValor = document.getElementById('humedad-valor');
const vientoValor = document.getElementById('viento-valor');


// ===============================================
// MANEJO DE EVENTOS
// ===============================================

// 1. Evento para el botón de búsqueda (Click)
buscarBtn.addEventListener('click', () => {
    iniciarBusqueda();
});

// ⭐ NUEVO 1: Evento para buscar al presionar la tecla 'Enter'
ciudadInput.addEventListener('keypress', (e) => {
    // e.key === 'Enter' detecta si la tecla presionada es Enter
    if (e.key === 'Enter') {
        iniciarBusqueda();
    }
});

// Función auxiliar para iniciar la búsqueda
function iniciarBusqueda() {
    const ciudad = ciudadInput.value.trim();
    if (ciudad) {
        obtenerClima(ciudad);
    } else {
        mostrarError('Por favor, ingresa el nombre de una ciudad.');
    }
}


// ===============================================
// LÓGICA DE LA APLICACIÓN (API FETCH)
// ===============================================

async function obtenerClima(ciudad) {
    // Limpieza: Ocultar información anterior y errores
    infoClimaDiv.style.display = 'none';
    mensajeError.style.display = 'none';
    
    // ⭐ NUEVO 2 (Carga - Inicio): Deshabilitar el botón y mostrar 'Cargando...'
    buscarBtn.disabled = true;
    buscarBtn.textContent = 'Cargando...';

    // Construir la URL de la API: 
    // - q=${ciudad}: Nombre de la ciudad
    // - units=metric: Temperatura en Celsius
    // - lang=es: Descripción del clima en español
    const url = `${BASE_URL}?q=${ciudad}&units=metric&lang=es&appid=${API_KEY}`;

    try {
        // Realizar la solicitud a la API
        const respuesta = await fetch(url);
        
        // Verificar el estado de la respuesta
        if (!respuesta.ok) {
            // Si el código es 404 u otro error HTTP
            throw new Error('Ciudad no encontrada.');
        }

        // Convertir la respuesta a formato JSON
        const datos = await respuesta.json();

        // Llamar a la función para pintar los datos en la interfaz
        actualizarUI(datos);

    } catch (error) {
        // Manejo de errores (fallo de red, clave API incorrecta o ciudad no encontrada)
        console.error('Error al obtener el clima:', error);
        mostrarError(error.message === 'Ciudad no encontrada.' 
            ? 'No se pudo encontrar esa ciudad. Intenta de nuevo.' 
            : 'Error de conexión. Intenta más tarde.'
        );
    } finally {
        // ⭐ NUEVO 2 (Carga - Fin): Restablecer el botón SÍ o SÍ (se ejecuta siempre)
        buscarBtn.disabled = false;
        buscarBtn.textContent = 'Buscar';
    }
}


// ===============================================
// MANEJO DE INTERFAZ (UI)
// ===============================================

// Función para actualizar los elementos HTML con los datos obtenidos
function actualizarUI(datos) {
    // 1. Extraer datos relevantes
    const temp = Math.round(datos.main.temp);           // Temperatura redondeada
    const descripcion = datos.weather[0].description;
    const icono = datos.weather[0].icon;
    const nombre = datos.name;

    // ⭐ NUEVOS DATOS
    const humedad = datos.main.humidity;                // Humedad en porcentaje (%)
    const viento_ms = datos.wind.speed;                 // Viento en metros/segundo (m/s)
    const viento_kmh = (viento_ms * 3.6).toFixed(1);    // Conversión a km/h y redondeo

    // 2. Actualizar el contenido de los elementos principales
    ciudadNombre.textContent = nombre;
    temperaturaDisplay.textContent = `${temp}°C`;
    descripcionDisplay.textContent = descripcion;
    
    // Construir la URL del ícono (formato estándar de OpenWeatherMap)
    iconoClima.src = `http://openweathermap.org/img/wn/${icono}@2x.png`;
    iconoClima.alt = descripcion;

    // ⭐ 3. Actualizar los detalles adicionales
    humedadValor.textContent = `${humedad}%`;
    vientoValor.textContent = `${viento_kmh} km/h`;

    // 4. Mostrar el contenedor de información
    infoClimaDiv.style.display = 'block';
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
    // Aseguramos que la info del clima esté oculta si hay un error
    infoClimaDiv.style.display = 'none'; 
}