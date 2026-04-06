document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración del Menú de Buffet Libre (Datos Maestros)
    const MENU_ITEMS = [
        { id: 'nigiri', name: 'Nigiris', emoji: '🍣', colorVar: 'var(--color-nigiri)' },
        { id: 'maki', name: 'Makis', emoji: '🍱', colorVar: 'var(--color-maki)' },
        { id: 'uramaki', name: 'Uramakis', emoji: '🍙', colorVar: 'var(--color-uramaki)' },
        { id: 'temaki', name: 'Temakis', emoji: '🌯', colorVar: 'var(--color-temaki)' }, // 🌯 se parece mucho a un temaki envuelto
        { id: 'gyoza', name: 'Gyozas', emoji: '🥟', colorVar: 'var(--color-gyoza)' },
        { id: 'sashimi', name: 'Sashimi', emoji: '🐟', colorVar: 'var(--color-sashimi)' },
        { id: 'yakitori', name: 'Tempura', emoji: '🍢', colorVar: 'var(--color-yakitori)' },
        { id: 'panbao', name: 'Pan Bao', emoji: '🥙', colorVar: 'var(--color-panbao)' } // 🥙 simula un bao relleno
    ];

    // 2. Elementos del DOM Globales
    const menuGrid = document.getElementById('menu-grid');
    const totalCounterEl = document.getElementById('total-counter');
    const btnResetAll = document.getElementById('btn-reset-all');

    // 3. Inicialización del Estado (Store)
    let state = loadState();

    function loadState() {
        const stored = localStorage.getItem('sushiBuffetState');
        let parsed = null;
        if (stored) {
            try {
                parsed = JSON.parse(stored);
            } catch (e) {
                console.error("Error leyendo LocalStorage", e);
            }
        }
        
        // Estado por defecto
        const defaultState = {};
        MENU_ITEMS.forEach(item => defaultState[item.id] = 0);

        // Mezclar por si añadimos nuevos items en el código y el usuario tenía info antigua
        if (parsed && typeof parsed === 'object') {
            return { ...defaultState, ...parsed };
        }
        return defaultState;
    }

    function saveState() {
        localStorage.setItem('sushiBuffetState', JSON.stringify(state));
    }

    function getTotal() {
        return Object.values(state).reduce((acc, val) => acc + val, 0);
    }

    // 4. Renderizado Automático de la Interfaz
    function renderGrid() {
        menuGrid.innerHTML = ''; // Limpiamos preventivamente
        
        MENU_ITEMS.forEach(item => {
            // Creamos la tarjeta dinámicamente
            const card = document.createElement('article');
            card.className = 'piece-card';
            card.style.setProperty('--card-bg', item.colorVar);
            
            // Estructura HTML pura dentro de la tarjeta
            card.innerHTML = `
                <header class="piece-header">
                    <h2 class="piece-title">${item.name}</h2>
                    <span class="piece-emoji" aria-hidden="true">${item.emoji}</span>
                </header>
                
                <output id="counter-${item.id}" class="piece-counter" aria-live="polite">
                    ${state[item.id]}
                </output>

                <div class="controls">
                    <button class="btn-ctrl sub" data-action="sub" data-id="${item.id}" aria-label="Restar un ${item.name}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>
                    </button>
                    <button class="btn-ctrl add" data-action="add" data-id="${item.id}" aria-label="Añadir un ${item.name}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                </div>
            `;
            menuGrid.appendChild(card);
        });

        updateTotalUI();
        updateAllDisabledStates();
    }

    // 5. Delegación de Eventos (Event Delegation) 
    // Capturamos los clics de botones dinámicos de forma eficiente
    menuGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ctrl');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'add') {
            state[id]++;
            saveState();
            updateItemUI(id);
            createFloatingAnimation(btn);
            popAnimation(document.getElementById(`counter-${id}`));
            updateTotalUI();
        } else if (action === 'sub') {
            if (state[id] > 0) {
                state[id]--;
                saveState();
                updateItemUI(id);
                popAnimation(document.getElementById(`counter-${id}`));
                updateTotalUI();
            }
        }
    });

    btnResetAll.addEventListener('click', () => {
        // Confirmación nativa rápida o reinicio directo
        if(confirm("¿Seguro que quieres borrar todo tu progreso del buffet?")) {
            MENU_ITEMS.forEach(item => state[item.id] = 0);
            saveState();
            
            // Actualizar todos los nodos del DOM
            MENU_ITEMS.forEach(item => updateItemUI(item.id));
            updateTotalUI();
            
            // Pop de todos
            popAnimation(totalCounterEl);
        }
    });

    // 6. Funciones de Actualización UI
    function updateItemUI(id) {
        const outputEl = document.getElementById(`counter-${id}`);
        if(outputEl) outputEl.textContent = state[id];

        // Actualizar botón de restar
        const subBtn = document.querySelector(`.btn-ctrl.sub[data-id="${id}"]`);
        if (subBtn) {
            if (state[id] <= 0) {
                subBtn.setAttribute('disabled', 'true');
                subBtn.setAttribute('aria-disabled', 'true');
            } else {
                subBtn.removeAttribute('disabled');
                subBtn.setAttribute('aria-disabled', 'false');
            }
        }
    }

    function updateAllDisabledStates() {
        MENU_ITEMS.forEach(item => updateItemUI(item.id));
    }

    function updateTotalUI() {
        const prevTotal = Number(totalCounterEl.textContent);
        const newTotal = getTotal();
        
        totalCounterEl.textContent = newTotal;
        
        // Animación solo si el total subió o bajó
        if(prevTotal !== newTotal) {
            popAnimation(totalCounterEl);
        }
    }

    // 7. Animaciones Hardware Accelerated
    function popAnimation(element) {
        if(!element) return;
        element.style.transform = 'none';
        void element.offsetWidth; // Force Reflow
        element.style.transform = 'scale(1.15)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    // Estilo Cómic Pop-Art (Pow!)
    function createFloatingAnimation(buttonEl) {
        const controlsContainer = buttonEl.parentElement;
        const floatEl = document.createElement('span');
        floatEl.textContent = '+1!';
        floatEl.classList.add('float-pow');
        floatEl.setAttribute('aria-hidden', 'true');
        
        // Animación CSS pura definida en style.css (@keyframes popPow)
        floatEl.style.animation = 'popPow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

        controlsContainer.appendChild(floatEl);

        // Optimización agresiva GC (Garbage Collection)
        floatEl.addEventListener('animationend', () => {
            floatEl.remove();
        }, { once: true });
    }

    // Inicializar Motor
    renderGrid();
});
