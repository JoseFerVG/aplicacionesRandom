/* ==========================================================================
   JAVASCRIPT: Willy Wonka Love Tickets Creator (Static Edition)
   ========================================================================== */

// --- Global Application State ---
let catalog = []; // Categories and tickets from JSON
let selectedTickets = {}; // Format: { ticketId: quantity }
let currentPreviewTicket = null; // The ticket currently displayed in the preview panel
let currentPreviewSide = 'front'; // 'front' or 'back'
let activeCategory = 'all'; // Current category filter tab

// --- DOM Elements ---
const catalogContainer = document.getElementById('tickets-catalog-container');
const categoryTabsContainer = document.getElementById('category-tabs');
const ticketCard3d = document.getElementById('ticket-card-3d');
const previewFrontSide = document.getElementById('preview-front-side');
const previewBackSide = document.getElementById('preview-back-side');
const ticketClickFlip = document.getElementById('ticket-click-flip');
const previewBtnFront = document.getElementById('btn-preview-front');
const previewBtnBack = document.getElementById('btn-preview-back');
const summaryUniqueCount = document.getElementById('summary-unique-count');
const summaryTotalCount = document.getElementById('summary-total-count');
const selectedItemsPreview = document.getElementById('selected-items-preview');
const btnGenerate = document.getElementById('btn-generate-pdf');
const layoutSelect = document.getElementById('print-layout-select');
const toast = document.getElementById('toast-notification');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    loadLocalStorageData();
    fetchCatalogAndInit();
    setupEventListeners();
});

// --- Floating Hearts Background ---
function createFloatingHearts() {
    const container = document.getElementById('hearts-container');
    const heartSymbols = ['💖', '💕', '💗', '❤️', '♥', '🌸'];
    
    // Create initially some hearts, then spawn more
    for (let i = 0; i < 15; i++) {
        spawnHeart(container, heartSymbols, true);
    }
    
    setInterval(() => {
        spawnHeart(container, heartSymbols, false);
    }, 1200);
}

function spawnHeart(container, symbols, initial = false) {
    if (!container) return;
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    
    const left = Math.random() * 100;
    const size = Math.random() * 20 + 12; // 12px to 32px
    const duration = Math.random() * 10 + 10; // 10s to 20s
    const delay = initial ? -Math.random() * duration : 0;
    
    heart.style.left = `${left}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${delay}s`;
    
    container.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, (duration + (initial ? 0 : delay)) * 1000);
}

// --- Local Storage Management ---
function loadLocalStorageData() {
    try {
        const storedSelected = localStorage.getItem('love_tickets_selected');
        if (storedSelected) {
            selectedTickets = JSON.parse(storedSelected);
        }
        
        const storedLayout = localStorage.getItem('love_tickets_layout');
        if (storedLayout && layoutSelect) {
            layoutSelect.value = storedLayout;
        }
    } catch (e) {
        console.error("Error reading localStorage:", e);
    }
}

function saveLocalStorageData() {
    try {
        localStorage.setItem('love_tickets_selected', JSON.stringify(selectedTickets));
        localStorage.setItem('love_tickets_layout', layoutSelect.value);
    } catch (e) {
        console.error("Error writing localStorage:", e);
    }
}

// --- Fallback Catalog for CORS / file:// compatibility ---
const DEFAULT_CATALOG_FALLBACK = {
  "categories": [
    {
      "id": "romance",
      "name": "💖 Romance y Conexión",
      "description": "Tickets para fortalecer la conexión emocional y momentos románticos.",
      "items": [
        {
          "id": "cena_romantica",
          "title": "Cena Romántica Exclusiva",
          "description": "Válido por una cena preparada por tu persona favorita, con velas, música suave y tu postre preferido.",
          "terms": "Válido para canjear cualquier fin de semana con 24h de aviso previo."
        },
        {
          "id": "noche_peliculas",
          "title": "Noche de Cine a tu Medida",
          "description": "Tú eliges la película, la serie y las palomitas. Sin quejas ni interrupciones del portador.",
          "terms": "No acumulable con llamadas del trabajo. Incluye mimos ilimitados."
        },
        {
          "id": "paseo_estrellas",
          "title": "Paseo Bajo las Estrellas",
          "description": "Una caminata nocturna de la mano, conversando y disfrutando de la noche y el aire libre.",
          "terms": "Requiere cielo despejado y calzado cómodo."
        },
        {
          "id": "declaracion_amor",
          "title": "Carta de Amor Escrita a Mano",
          "description": "Una carta personalizada donde te recuerdo todas las razones por las que te amo.",
          "terms": "Entregado en un plazo máximo de 3 días desde su canje."
        },
        {
          "id": "sesion_fotos",
          "title": "Sesión de Fotos Divertida",
          "description": "Una sesión improvisada de fotos con ropa bonita o divertida. Guardaremos los mejores recuerdos.",
          "terms": "El fotógrafo promete sacar tu mejor perfil."
        },
        {
          "id": "primera_cita",
          "title": "Recrear Nuestra Primera Cita",
          "description": "Volveremos al lugar donde todo empezó (o lo recrearemos) para recordar por qué nos enamoramos.",
          "terms": "Se requiere vestir elegante y actuar como si nos conociéramos hoy."
        },
        {
          "id": "preguntas_profundas",
          "title": "Noche de Preguntas Íntimas",
          "description": "Una velada de conversación profunda utilizando juegos de preguntas para conocernos aún más.",
          "terms": "Acompañado de una copa de vino o chocolate caliente."
        },
        {
          "id": "picnic_salon",
          "title": "Pícnic Romántico en el Salón",
          "description": "Cojines en el suelo, luces de hadas y una tabla de quesos y frutas en medio de la sala.",
          "terms": "Vale para días lluviosos o simplemente porque sí."
        },
        {
          "id": "playlist_amor",
          "title": "Playlist Curada de Amor",
          "description": "Crearé una lista de canciones seleccionadas a mano que me recuerdan a ti y a nuestra historia.",
          "terms": "Disponible para escuchar en cualquier viaje de carretera juntos."
        },
        {
          "id": "baile_casa",
          "title": "Noche de Baile en el Salón",
          "description": "Bailar de cerca, lentos o movidos, en medio del salón con tu música preferida de fondo.",
          "terms": "No importa el ritmo, solo abrazarse fuerte."
        },
        {
          "id": "beso_lluvia",
          "title": "Beso Bajo la Lluvia",
          "description": "Recrearemos la escena más romántica del cine dándonos un beso apasionado bajo la lluvia (o la ducha si hace sol).",
          "terms": "Válido para canjear en cualquier momento húmedo."
        },
        {
          "id": "cucharita_demanda",
          "title": "Cucharita Nocturna a Demanda",
          "description": "Derecho a exigir dormir abrazados en cucharita todo el tiempo que quieras, sin quejas por el calor.",
          "terms": "Válido para cualquier noche fría."
        }
      ]
    },
    {
      "id": "relax",
      "name": "💆 Relax y Bienestar",
      "description": "Momento de desconexión y mimos especiales.",
      "items": [
        {
          "id": "masaje_espalda",
          "title": "Masaje de Espalda Premium",
          "description": "Un masaje de 20 minutos con aceites aromáticos, música relajante y toallas tibias.",
          "terms": "El masajista no puede quejarse de cansancio en las manos."
        },
        {
          "id": "bano_burbujas",
          "title": "Baño de Burbujas Relajante",
          "description": "Un baño preparado con espuma, sales aromáticas, velas y tu bebida favorita esperándote.",
          "terms": "Válido para un momento de paz absoluta sin interrupciones."
        },
        {
          "id": "desayuno_cama",
          "title": "Desayuno en la Cama",
          "description": "Tu desayuno favorito servido directamente en la cama, recién preparado y caliente.",
          "terms": "El portador se compromete a limpiar la cocina después."
        },
        {
          "id": "siesta_interrupcion",
          "title": "Siesta Sagrada Sin Interrupciones",
          "description": "Derecho a una siesta de hasta 2 horas con silencio absoluto en el hogar.",
          "terms": "Válido cualquier tarde de fin de semana."
        },
        {
          "id": "masaje_cabeza",
          "title": "Masaje de Cabeza y Capilares",
          "description": "Una sesión súper relajante de caricias en el cabello y masaje capilar suave.",
          "terms": "Peligro inminente de quedarse dormido/a."
        },
        {
          "id": "spa_casa",
          "title": "Día de Spa en Pareja",
          "description": "Mascarillas faciales, rodajas de pepino, música zen y un ambiente de spa completo en el hogar.",
          "terms": "Batas de baño obligatorias."
        },
        {
          "id": "mimos_hora",
          "title": "1 Hora de Mimos Continuos",
          "description": "Mimos, caricias y abrazos ilimitados sin que el portador se pueda mover de tu lado.",
          "terms": "Puedes elegir la posición más cómoda del sofá."
        },
        {
          "id": "dia_sin_estres",
          "title": "Día Absolutamente Libre de Estrés",
          "description": "Tus deseos son órdenes. Me encargaré de tomar todas las pequeñas decisiones molestas hoy.",
          "terms": "El portador promete no protestar."
        },
        {
          "id": "estiramientos_guiados",
          "title": "Sesión de Estiramientos Relajantes",
          "description": "Te ayudaré a hacer estiramientos suaves para relajar la espalda y las piernas.",
          "terms": "Acompañado de música de meditación."
        },
        {
          "id": "masaje_manos",
          "title": "Masaje Hidratante de Manos y Brazos",
          "description": "Un masaje de manos cansadas utilizando crema hidratante aromática de tu preferencia.",
          "terms": "Ideal después de un largo día de oficina o escritura."
        },
        {
          "id": "spa_casero_lujo",
          "title": "Spa Casero de Lujo",
          "description": "Un tratamiento relajante completo que incluye exfoliación de pies, mascarilla facial y té herbal servido por mí.",
          "terms": "Música de meditación de fondo obligatoria."
        },
        {
          "id": "sin_telefono_24h",
          "title": "24 Horas Sin Teléfono",
          "description": "Guardaré mi teléfono en un cajón durante un día entero para estar 100% presente y enfocado en ti.",
          "terms": "Solo se permiten llamadas de emergencia."
        }
      ]
    },
    {
      "id": "ayuda",
      "name": "🧹 Tareas y Favores",
      "description": "Para esos días en los que necesitas un respiro de las tareas cotidianas.",
      "items": [
        {
          "id": "lavar_platos",
          "title": "Pase Libre: Lavar los Platos",
          "description": "Hoy no te toca fregar. Entrega este ticket y tu pareja se encargará de toda la vajilla.",
          "terms": "Válido inmediatamente después de cualquier comida."
        },
        {
          "id": "limpieza_general",
          "title": "Limpieza Express del Hogar",
          "description": "Tu pareja limpiará la zona de la casa que elijas mientras tú te relajas.",
          "terms": "Límite de 45 minutos de limpieza intensiva."
        },
        {
          "id": "cocina_favorita",
          "title": "Cocinero Personal por un Día",
          "description": "El portador cocinará tu plato favorito para el almuerzo o la cena.",
          "terms": "Tú solo tienes que disfrutar del plato."
        },
        {
          "id": "hacer_compras",
          "title": "Encargo de Compras y Mandados",
          "description": "Tu pareja irá al supermercado o hará ese recado molesto que tú no quieres hacer hoy.",
          "terms": "Requiere una lista detallada para evitar confusiones."
        },
        {
          "id": "lavar_coche",
          "title": "Lavado de Coche Completo",
          "description": "Me encargaré de lavar y aspirar el coche para dejarlo como nuevo y reluciente.",
          "terms": "Por dentro y por fuera."
        },
        {
          "id": "hacer_cama",
          "title": "Hacer la Cama por una Semana",
          "description": "Libérate de la tarea diaria de estirar las sábanas por 7 días seguidos.",
          "terms": "Incluye sacudir las almohadas a la perfección."
        },
        {
          "id": "pase_basura",
          "title": "Pase Libre de Basura por 3 Días",
          "description": "El portador se encargará de sacar la basura y el reciclaje sin que tengas que decírselo.",
          "terms": "Válido por tres noches consecutivas."
        },
        {
          "id": "ordenar_cajon",
          "title": "Ordenar el Espacio que Desees",
          "description": "Me encargaré de clasificar, tirar y ordenar ese cajón o armario que lleva tiempo desorganizado.",
          "terms": "Se consultará antes de tirar pertenencias."
        },
        {
          "id": "doblar_ropa",
          "title": "Servicio Exclusivo de Doblado",
          "description": "Doblaré y guardaré toda la colada limpia que esté acumulada esperando.",
          "terms": "No incluye el planchado de camisas difíciles."
        },
        {
          "id": "regar_plantas",
          "title": "Cuidado Completo de Plantas",
          "description": "Me encargaré de regar todas las plantas de la casa y retirar las hojas secas hoy.",
          "terms": "Sin encharcamientos."
        },
        {
          "id": "planchar_ropa",
          "title": "Pase Libre: Planchar Ropa",
          "description": "Hoy me encargo yo de planchar toda la colada de camisas, pantalones o vestidos que tengas pendientes.",
          "terms": "Entregado en perchas y sin una sola arruga."
        }
      ]
    },
    {
      "id": "aventura",
      "name": "🚗 Aventura y Salidas",
      "description": "Planes divertidos y fuera de la rutina para disfrutar juntos.",
      "items": [
        {
          "id": "viaje_sorpresa",
          "title": "Escapada de Fin de Semana",
          "description": "Planificación completa de un viaje o excursión de un día a un lugar sorpresa.",
          "terms": "Los gastos se planifican en pareja, pero la organización corre por mi cuenta."
        },
        {
          "id": "picnic_parque",
          "title": "Picnic Romántico al Aire Libre",
          "description": "Una tarde de picnic en el parque con cesta, manta, aperitivos ricos y buena conversación.",
          "terms": "Sujeto a condiciones climáticas favorables."
        },
        {
          "id": "cita_sorpresa",
          "title": "Cita Nocturna Misteriosa",
          "description": "Una cita planeada de principio a fin en secreto. Solo se te dará el código de vestimenta.",
          "terms": "¡Prohibido hacer preguntas sobre el destino!"
        },
        {
          "id": "tarde_juegos",
          "title": "Tarde de Juegos de Mesa / Consola",
          "description": "Una sesión competitiva o cooperativa del juego que prefieras, con snacks incluidos.",
          "terms": "Ganar o perder con deportividad."
        },
        {
          "id": "visita_museo",
          "title": "Tarde Cultural: Museos",
          "description": "Visitaremos un museo, galería de arte o monumento de tu elección hoy.",
          "terms": "Incluye café y tarta en la cafetería del museo al terminar."
        },
        {
          "id": "ruta_senderismo",
          "title": "Ruta de Senderismo Natural",
          "description": "Una salida para respirar aire puro, caminar por la montaña y conectar con la naturaleza.",
          "terms": "El portador prepara los sándwiches para el camino."
        },
        {
          "id": "helado_paseo",
          "title": "Tarde de Helado Gigante y Paseo",
          "description": "Vamos a por tu helado favorito y caminaremos sin prisa por tu barrio o parque predilecto.",
          "terms": "Vale por dos bolas de helado con extras."
        },
        {
          "id": "cocina_juntos",
          "title": "Clase de Cocina Casera en Pareja",
          "description": "Prepararemos una receta compleja e internacional que nunca hayamos probado antes.",
          "terms": "Aprender y divertirse sin miedo a quemar nada."
        },
        {
          "id": "karaoke_casa",
          "title": "Concierto de Karaoke en Pareja",
          "description": "Cantaremos a todo pulmón nuestros temas favoritos utilizando micrófonos (o cepillos del pelo).",
          "terms": "Prohibido juzgar la afinación."
        },
        {
          "id": "ver_atardecer",
          "title": "Cita Exclusiva al Atardecer",
          "description": "Iremos a un punto elevado o mirador de la ciudad para ver la puesta de sol tomados de la mano.",
          "terms": "Requiere buena música de fondo."
        },
        {
          "id": "dia_de_pollo",
          "title": "Día del Pollo",
          "description": "Válido por un día completo dedicado a comer tu tipo de pollo favorito (frito, asado o a la brasa) en tu restaurante predilecto.",
          "terms": "No se permiten contar las calorías hoy. Acompañado de patatas fritas."
        },
        {
          "id": "dj_coche_viaje",
          "title": "DJ del Coche por un Viaje",
          "description": "Control absoluto de la música y la playlist del coche durante todo el trayecto de un viaje de carretera.",
          "terms": "Prohibido quejarse del género musical seleccionado."
        }
      ]
    },
    {
      "id": "comodines",
      "name": "🎟️ Comodines de Amor",
      "description": "Favores rápidos y directos para usar en cualquier momento.",
      "items": [
        {
          "id": "abrazo_infinito",
          "title": "Abrazo Infinito y Apapacho",
          "description": "Válido por un abrazo largo, cálido y reconfortante hasta que te sientas mejor.",
          "terms": "Se puede canjear en momentos de estrés o simplemente porque sí."
        },
        {
          "id": "perdon_discusion",
          "title": "Pase de Paz: Terminar Discusión",
          "description": "Un boleto para detener cualquier discusión menor de inmediato, darnos un beso y empezar de nuevo.",
          "terms": "No aplicable a discusiones serias de pareja. Úsese con amor y humor."
        },
        {
          "id": "si_a_todo",
          "title": "Día del 'Sí a Todo'",
          "description": "Durante 3 horas, el portador dirá que sí a todos tus caprichos y peticiones razonables.",
          "terms": "Sujeto al sentido común y al respeto mutuo."
        },
        {
          "id": "masaje_pies",
          "title": "Masaje de Pies Relajante",
          "description": "Un masaje reconfortante de pies cansados al final del día.",
          "terms": "Válido frente a la televisión o en la cama."
        },
        {
          "id": "postre_sorpresa",
          "title": "Vale por un Postre Sorpresa",
          "description": "Tu dulce favorito hecho en casa o comprado en esa pastelería que tanto te gusta.",
          "terms": "Entregado en un plazo de 24 horas."
        },
        {
          "id": "beso_largo",
          "title": "Beso Apasionado de 10 Segundos",
          "description": "Un pase para solicitar un beso largo, tierno y de película en cualquier momento y lugar.",
          "terms": "Incluso delante de la gente si te atreves."
        },
        {
          "id": "pedir_delivery",
          "title": "Pase Libre: Pedir a Domicilio",
          "description": "Hoy nadie cocina. Entrega este ticket y elegiremos tu comida favorita para pedir a domicilio.",
          "terms": "Gastos a cuenta de mi cartera."
        },
        {
          "id": "descuento_tarea",
          "title": "Reducir Tarea a la Mitad",
          "description": "Usa este cupón para dividir a la mitad cualquier tarea doméstica que tengas asignada hoy.",
          "terms": "Tu pareja completará la otra mitad."
        },
        {
          "id": "vestir_outfit",
          "title": "Elegir mi Vestuario por un Día",
          "description": "Diseña y elige el outfit completo que debo usar hoy. Prometo llevarlo con orgullo.",
          "terms": "Sujeto al clima y a la decencia pública."
        },
        {
          "id": "disculpa_abrazo",
          "title": "Disculpa Sincera + Abrazo Fuerte",
          "description": "Un boleto para romper el orgullo, pedir disculpas con amor y sellarlo con un abrazo de reconciliación.",
          "terms": "Ideal para curar pequeñas heridas rápidamente."
        },
        {
          "id": "elegir_vacaciones",
          "title": "Decisión del Siguiente Destino",
          "description": "Tú tienes el voto definitivo para decidir el destino de nuestras próximas vacaciones o escapada.",
          "terms": "Sujeto a presupuestos acordados."
        },
        {
          "id": "halago_diario",
          "title": "Un Halago Diario por una Semana",
          "description": "Durante 7 días, recibirás un mensaje o nota escrita con algo hermoso que amo de ti.",
          "terms": "Todos los días al despertar."
        },
        {
          "id": "dia_cheesecake",
          "title": "Día del Cheesecake",
          "description": "Derecho a ir a buscar o preparar el mejor cheesecake de la ciudad y devorarlo juntos sin remordimientos.",
          "terms": "El portador paga la cuenta. Válido para cualquier sabor: fresa, oreo o clásico."
        }
      ]
    }
  ]
};

// --- Fetch Catalog & Initialize ---
function fetchCatalogAndInit() {
    fetch('tickets_catalog.json')
        .then(response => {
            if (!response.ok) throw new Error("Could not load catalog JSON");
            return response.json();
        })
        .then(data => {
            initializeCatalog(data.categories);
        })
        .catch(err => {
            console.warn("Using fallback catalog due to CORS restriction or offline loading:", err);
            initializeCatalog(DEFAULT_CATALOG_FALLBACK.categories);
        });
}

function initializeCatalog(categories) {
    catalog = categories;
    renderCategoryTabs();
    renderCatalog();
    
    // Set default preview ticket
    if (catalog.length > 0 && catalog[0].items.length > 0) {
        setPreviewTicket(catalog[0].items[0]);
    }
    
    updateSummary();
}

// --- Rendering functions ---

function renderCategoryTabs() {
    if (!categoryTabsContainer) return;
    
    const allTab = categoryTabsContainer.firstElementChild;
    categoryTabsContainer.innerHTML = '';
    categoryTabsContainer.appendChild(allTab);
    
    catalog.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${activeCategory === cat.id ? 'active' : ''}`;
        btn.setAttribute('data-category', cat.id);
        btn.textContent = cat.name.split(' ').slice(1).join(' ') || cat.name;
        btn.prepend(cat.name.split(' ')[0] + ' ');
        
        categoryTabsContainer.appendChild(btn);
    });
}

function renderCatalog() {
    if (!catalogContainer) return;
    catalogContainer.innerHTML = '';
    
    let renderedCount = 0;
    
    catalog.forEach(cat => {
        if (activeCategory !== 'all' && activeCategory !== cat.id) return;
        
        cat.items.forEach(item => {
            renderedCount++;
            const qty = selectedTickets[item.id] || 0;
            
            const card = document.createElement('article');
            card.className = `catalog-ticket-card ${qty > 0 ? 'selected-active' : ''}`;
            card.setAttribute('data-id', item.id);
            
            card.innerHTML = `
                <div class="ticket-card-header">
                    <span class="ticket-card-category">${cat.name.split(' ')[0]} ${getCategoryLabel(cat.id)}</span>
                </div>
                <h3 class="ticket-card-title">${escapeHTML(item.title)}</h3>
                <p class="ticket-card-desc">${escapeHTML(item.description)}</p>
                <div class="ticket-card-footer">
                    <button class="btn-preview-card">👁️ Previsualizar</button>
                    <div class="quantity-control">
                        <button class="qty-btn btn-qty-minus">-</button>
                        <span class="qty-val">${qty}</span>
                        <button class="qty-btn btn-qty-plus">+</button>
                    </div>
                </div>
            `;
            
            // Events
            card.querySelector('.btn-preview-card').addEventListener('click', () => {
                setPreviewTicket(item, cat.id);
            });
            
            card.querySelector('.btn-qty-minus').addEventListener('click', () => {
                updateTicketQuantity(item.id, -1);
            });
            card.querySelector('.btn-qty-plus').addEventListener('click', () => {
                updateTicketQuantity(item.id, 1);
            });
            
            catalogContainer.appendChild(card);
        });
    });
    
    if (renderedCount === 0) {
        catalogContainer.innerHTML = `
            <div class="empty-list-msg" style="grid-column: 1/-1; padding: 3rem;">
                No hay tickets en esta categoría.
            </div>
        `;
    }
}

function getCategoryLabel(catId) {
    switch(catId) {
        case 'romance': return 'Romance';
        case 'relax': return 'Relax';
        case 'ayuda': return 'Tareas';
        case 'aventura': return 'Aventura';
        case 'comodines': return 'Comodín';
        default: return 'Favor';
    }
}

function generateSerial(ticketId, categoryId) {
    const prefix = "LOVE";
    let catCode = "GEN";
    switch(categoryId) {
        case 'romance': catCode = "ROM"; break;
        case 'relax': catCode = "RLX"; break;
        case 'ayuda': catCode = "HEL"; break;
        case 'aventura': catCode = "ADV"; break;
        case 'comodines': catCode = "WLD"; break;
    }
    
    let hash = 0;
    for (let i = 0; i < ticketId.length; i++) {
        hash += ticketId.charCodeAt(i);
    }
    const num = (hash % 90) + 10;
    
    return `${prefix}-${catCode}-${num}`;
}

function updateTicketQuantity(ticketId, delta) {
    const currentQty = selectedTickets[ticketId] || 0;
    let newQty = currentQty + delta;
    if (newQty < 0) newQty = 0;
    
    if (newQty === 0) {
        delete selectedTickets[ticketId];
    } else {
        selectedTickets[ticketId] = newQty;
    }
    
    saveLocalStorageData();
    
    const card = catalogContainer.querySelector(`[data-id="${ticketId}"]`);
    if (card) {
        const qtyVal = card.querySelector('.qty-val');
        if (qtyVal) qtyVal.textContent = newQty;
        
        if (newQty > 0) {
            card.classList.add('selected-active');
        } else {
            card.classList.remove('selected-active');
        }
    }
    
    updateSummary();
}

function updateSummary() {
    let uniqueCount = 0;
    let totalCount = 0;
    
    selectedItemsPreview.innerHTML = '';
    
    const selectedKeys = Object.keys(selectedTickets);
    uniqueCount = selectedKeys.length;
    
    if (uniqueCount === 0) {
        selectedItemsPreview.innerHTML = `
            <p class="empty-list-msg">No has seleccionado ningún favor. ¡Elige del catálogo de la izquierda!</p>
        `;
        btnGenerate.disabled = true;
    } else {
        btnGenerate.disabled = false;
        
        selectedKeys.forEach(ticketId => {
            const qty = selectedTickets[ticketId];
            totalCount += qty;
            
            let foundItem = null;
            catalog.forEach(cat => {
                const item = cat.items.find(i => i.id === ticketId);
                if (item) foundItem = item;
            });
            
            if (foundItem) {
                const row = document.createElement('div');
                row.className = 'selected-item-row';
                row.innerHTML = `
                    <span class="selected-item-title" title="${escapeHTML(foundItem.title)}">${escapeHTML(foundItem.title)}</span>
                    <div>
                        <span class="selected-item-qty">x${qty}</span>
                    </div>
                `;
                selectedItemsPreview.appendChild(row);
            }
        });
    }
    
    summaryUniqueCount.textContent = uniqueCount;
    summaryTotalCount.textContent = totalCount;
}

// --- Live Preview Renderer ---
function setPreviewTicket(ticket, catId = null) {
    if (!ticket) return;
    currentPreviewTicket = ticket;
    if (!catId) {
        catalog.forEach(cat => {
            if (cat.items.find(i => i.id === ticket.id)) {
                catId = cat.id;
            }
        });
    }
    currentPreviewTicket.catId = catId || 'romance';
    renderPreview();
}

function renderPreview() {
    if (!currentPreviewTicket) return;
    
    const t = currentPreviewTicket;
    const serial = generateSerial(t.id, t.catId);
    
    // Render FRONT side
    previewFrontSide.innerHTML = `
        <div class="ticket-border-outer">
            <div class="ticket-border-inner">
                <div class="ticket-star gold-star top-left">★</div>
                <div class="ticket-star gold-star top-right">★</div>
                <div class="ticket-star gold-star bottom-left">★</div>
                <div class="ticket-star gold-star bottom-right">★</div>
                
                <div class="ticket-header">
                    <div class="ticket-brand">WONKA'S LOVE TICKET</div>
                    <div class="ticket-main-title">VALE DE AMOR</div>
                </div>
                
                <div class="ticket-body">
                    <div class="ticket-salutation">FELICIDADES AL AFORTUNADO PORTADOR</div>
                    <div class="ticket-favor-title">${escapeHTML(t.title)}</div>
                    <div class="ticket-favor-desc">${escapeHTML(t.description)}</div>
                </div>
                
                <div class="ticket-footer">
                    <div class="ticket-serial">Nº <span>${escapeHTML(serial)}</span></div>
                    <div class="ticket-terms" title="${escapeHTML(t.terms)}">${escapeHTML(t.terms)}</div>
                </div>
            </div>
        </div>
    `;

    // Render BACK side
    previewBackSide.innerHTML = `
        <div class="ticket-border-outer">
            <div class="ticket-border-inner ticket-back-content">
                <div class="ticket-star gold-star top-left">★</div>
                <div class="ticket-star gold-star top-right">★</div>
                <div class="ticket-star gold-star bottom-left">★</div>
                <div class="ticket-star gold-star bottom-right">★</div>
                
                <div class="ticket-seal">L'Chocolaterie d'Amour</div>
                
                <p class="ticket-back-message">
                    Este ticket dorado certifica la entrega de amor incondicional y favores concedidos.
                </p>
                
                <ul class="ticket-rules-list">
                    <li>Canjeable con un abrazo largo.</li>
                    <li>Válido a cualquier hora.</li>
                    <li>Sonrisa obligatoria al cumplirlo.</li>
                </ul>
                
                <div class="ticket-barcode-area">
                    <div class="fake-barcode"></div>
                    <div class="barcode-text">${escapeHTML(serial)}</div>
                </div>
            </div>
        </div>
    `;
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Category tabs clicking
    categoryTabsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.tab-btn');
        if (!target) return;
        
        categoryTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        
        activeCategory = target.getAttribute('data-category');
        renderCatalog();
    });
    
    // Toggle 3D Card orientation with buttons
    previewBtnFront.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card double click trigger
        previewBtnFront.classList.add('active');
        previewBtnBack.classList.remove('active');
        ticketCard3d.classList.remove('flipped');
        currentPreviewSide = 'front';
    });
    
    previewBtnBack.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card double click trigger
        previewBtnBack.classList.add('active');
        previewBtnFront.classList.remove('active');
        ticketCard3d.classList.add('flipped');
        currentPreviewSide = 'back';
    });

    // Flip card by clicking on the ticket container directly
    ticketClickFlip.addEventListener('click', () => {
        const isFlipped = ticketCard3d.classList.toggle('flipped');
        if (isFlipped) {
            previewBtnBack.classList.add('active');
            previewBtnFront.classList.remove('active');
            currentPreviewSide = 'back';
        } else {
            previewBtnFront.classList.add('active');
            previewBtnBack.classList.remove('active');
            currentPreviewSide = 'front';
        }
    });
    
    // Print layout change
    layoutSelect.addEventListener('change', () => {
        saveLocalStorageData();
    });
    
    // Generate Button Click
    btnGenerate.addEventListener('click', () => {
        const ticketsToPrint = [];
        
        Object.keys(selectedTickets).forEach(id => {
            const qty = selectedTickets[id];
            
            let foundItem = null;
            let catId = '';
            catalog.forEach(cat => {
                const item = cat.items.find(i => i.id === id);
                if (item) {
                    foundItem = item;
                    catId = cat.id;
                }
            });
            
            if (foundItem) {
                ticketsToPrint.push({
                    id: foundItem.id,
                    title: foundItem.title,
                    description: foundItem.description,
                    terms: foundItem.terms,
                    category: catId,
                    quantity: qty,
                    serial: generateSerial(foundItem.id, catId)
                });
            }
        });
        
        localStorage.setItem('love_tickets_print_payload', JSON.stringify({
            tickets: ticketsToPrint,
            layout: layoutSelect.value
        }));
        
        window.location.href = 'print.html';
    });
    
    // Setup select all & add random buttons
    setupCatalogActions();
}

// --- Catalog Actions (Select All / Add Random) ---
function setupCatalogActions() {
    const btnSelectAll = document.getElementById('btn-select-all');
    const btnDeselectAll = document.getElementById('btn-deselect-all');
    const btnAddRandom = document.getElementById('btn-add-random');
    
    if (btnSelectAll) {
        btnSelectAll.addEventListener('click', () => {
            selectAllTickets();
        });
    }
    
    if (btnDeselectAll) {
        btnDeselectAll.addEventListener('click', () => {
            deselectAllTickets();
        });
    }
    
    if (btnAddRandom) {
        btnAddRandom.addEventListener('click', () => {
            addRandomTicket();
        });
    }
}

function selectAllTickets() {
    let ticketsToSelect = [];
    
    catalog.forEach(cat => {
        if (activeCategory === 'all' || activeCategory === cat.id) {
            cat.items.forEach(item => {
                ticketsToSelect.push(item.id);
            });
        }
    });
    
    if (ticketsToSelect.length === 0) return;
    
    let addedCount = 0;
    ticketsToSelect.forEach(id => {
        if (!selectedTickets[id] || selectedTickets[id] === 0) {
            selectedTickets[id] = 1;
            addedCount++;
        }
    });
    
    if (addedCount === 0) {
        // If all are already selected, increment them all by 1
        ticketsToSelect.forEach(id => {
            selectedTickets[id] = (selectedTickets[id] || 0) + 1;
        });
        showToast("¡Incrementada la cantidad de todos los tickets! 🎟️");
    } else {
        showToast("¡Todos los tickets seleccionados! 🎟️");
    }
    
    saveLocalStorageData();
    renderCatalog();
    updateSummary();
}

function deselectAllTickets() {
    let ticketsToDeselect = [];
    
    catalog.forEach(cat => {
        if (activeCategory === 'all' || activeCategory === cat.id) {
            cat.items.forEach(item => {
                ticketsToDeselect.push(item.id);
            });
        }
    });
    
    if (ticketsToDeselect.length === 0) return;
    
    let removedCount = 0;
    ticketsToDeselect.forEach(id => {
        if (selectedTickets[id] && selectedTickets[id] > 0) {
            delete selectedTickets[id];
            removedCount++;
        }
    });
    
    if (removedCount > 0) {
        showToast("¡Selección limpiada! 🧹");
    } else {
        showToast("No había ningún ticket seleccionado.", true);
    }
    
    saveLocalStorageData();
    renderCatalog();
    updateSummary();
}

function addRandomTicket() {
    let pool = [];
    catalog.forEach(cat => {
        if (activeCategory === 'all' || activeCategory === cat.id) {
            cat.items.forEach(item => {
                pool.push({ item, catId: cat.id });
            });
        }
    });
    
    if (pool.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    
    const currentQty = selectedTickets[selected.item.id] || 0;
    selectedTickets[selected.item.id] = currentQty + 1;
    
    setPreviewTicket(selected.item, selected.catId);
    
    saveLocalStorageData();
    renderCatalog();
    updateSummary();
    
    showToast(`¡Añadido: "${selected.item.title}"! 🎲`);
}

// --- Helper Utilities ---

function showToast(message, isError = false) {
    toast.textContent = message;
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
