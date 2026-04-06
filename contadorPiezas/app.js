document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración del Menú de Buffet Libre (Datos Maestros)
    const MENU_ITEMS = [
        { id: 'nigiri', name: 'Nigiris', emoji: '🍣', colorVar: 'var(--color-nigiri)' },
        { id: 'maki', name: 'Makis', emoji: '🍱', colorVar: 'var(--color-maki)' },
        { id: 'uramaki', name: 'Uramakis', emoji: '🍙', colorVar: 'var(--color-uramaki)' },
        { id: 'temaki', name: 'Temakis', emoji: '🌯', colorVar: 'var(--color-temaki)' }, // 🌯 se parece mucho a un temaki envuelto
        { id: 'gyoza', name: 'Gyozas', emoji: '🥟', colorVar: 'var(--color-gyoza)' },
        { id: 'sashimi', name: 'Sashimi', emoji: '🐟', colorVar: 'var(--color-sashimi)' },
        { id: 'tempura', name: 'Tempura', emoji: '🍤', colorVar: 'var(--color-tempura)' },
        { id: 'panbao', name: 'Pan Bao', emoji: '🥙', colorVar: 'var(--color-panbao)' } // 🥙 simula un bao relleno
    ];

    // 2. Elementos del DOM Globales
    const menuGrid = document.getElementById('menu-grid');
    const totalCounterEl = document.getElementById('total-counter');
    const btnResetAll = document.getElementById('btn-reset-all');
    const btnSaveImage = document.getElementById('btn-save-image');

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

    btnSaveImage.addEventListener('click', async () => {
        if (getTotal() === 0) {
            alert("¡No has comido nada todavía! El ticket está vacío.");
            return;
        }

        const originalText = btnSaveImage.textContent;
        btnSaveImage.textContent = '⏳ GENERANDO...';
        btnSaveImage.disabled = true;

        const ticket = document.createElement('div');
        // Force evaluating the CSS variables inside the ticket so html2canvas renders them correctly
        const styles = getComputedStyle(document.body);
        const colorNigiri = styles.getPropertyValue('--color-nigiri').trim() || '#FF2A54';
        const colorMaki = styles.getPropertyValue('--color-maki').trim() || '#00E5FF';
        const colorUramaki = styles.getPropertyValue('--color-uramaki').trim() || '#FFD500';
        const colorTemaki = styles.getPropertyValue('--color-temaki').trim() || '#FF99CC';
        const colorGyoza = styles.getPropertyValue('--color-gyoza').trim() || '#C94BFF';
        const colorSashimi = styles.getPropertyValue('--color-sashimi').trim() || '#FF6B00';
        const colorTempura = styles.getPropertyValue('--color-tempura').trim() || '#00FF66';
        const colorPanbao = styles.getPropertyValue('--color-panbao').trim() || '#FFFFFF';
        
        const getColor = (id) => {
            const map = {
                nigiri: colorNigiri, maki: colorMaki, uramaki: colorUramaki,
                temaki: colorTemaki, gyoza: colorGyoza, sashimi: colorSashimi,
                tempura: colorTempura, panbao: colorPanbao
            };
            return map[id] || '#fff';
        };

        ticket.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 450px;
            padding: 40px;
            background-color: #f4f4f0;
            background-image: radial-gradient(#000000 0.8px, transparent 0.8px), radial-gradient(#000000 0.8px, #f4f4f0 0.8px);
            background-size: 32px 32px;
            background-position: 0 0, 16px 16px;
            border: 8px solid #000;
            font-family: 'Space Grotesk', sans-serif;
            color: #000;
            box-sizing: border-box;
        `;

        let html = `
            <div style="background-color: #fff; border: 4px solid #000; box-shadow: 6px 6px 0 #000; padding: 20px; border-radius: 16px; margin-bottom: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 2.5rem; font-weight: 900; text-transform: uppercase;">Bunker Sushi</h1>
                <p style="margin: 5px 0 0; font-weight: 700; font-size: 1.2rem;">RESUMEN DE BATALLA</p>
            </div>
            <div style="background-color: #fff; border: 4px solid #000; padding: 30px 20px; box-shadow: 6px 6px 0 #000; border-radius: 16px;">
                <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
        `;

        MENU_ITEMS.forEach(item => {
            if (state[item.id] > 0) {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.8rem; font-weight: 700; border-bottom: 4px dashed #000; padding-bottom: 10px;">
                        <span style="display: flex; align-items: center; gap: 10px;">
                            <span>${item.emoji}</span>
                            <span>${item.name}</span>
                        </span>
                        <span style="background: ${getColor(item.id)}; padding: 2px 10px; border-radius: 10px; border: 3px solid #000; font-variant-numeric: tabular-nums;">
                            x${state[item.id]}
                        </span>
                    </div>
                `;
            }
        });

        html += `
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; background-color: ${colorUramaki}; padding: 15px 20px; border: 4px solid #000; border-radius: 12px; box-shadow: 4px 4px 0 #000; font-size: 2.2rem; font-weight: 900;">
                    <span>TOTAL:</span>
                    <span>${getTotal()}</span>
                </div>
            </div>
        `;

        ticket.innerHTML = html;
        document.body.appendChild(ticket);

        // Wait slightly for DOM to update
        await new Promise(r => setTimeout(r, 150));

        try {
            const canvas = await html2canvas(ticket, {
                scale: 2, // High resolution
                backgroundColor: null,
                useCORS: true
            });

            const imageStr = canvas.toDataURL("image/png");
            
            // Trigger download
            const link = document.createElement('a');
            link.download = 'ticket-sushi.png';
            link.href = imageStr;
            link.click();
        } catch (e) {
            console.error("Error generando imagen", e);
            alert("Hubo un error al generar la imagen.");
        } finally {
            // Clean up
            ticket.remove();
            btnSaveImage.textContent = originalText;
            btnSaveImage.disabled = false;
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
