        const canvas = document.getElementById('wheelCanvas');
        const ctx = canvas.getContext('2d');
        const spinButton = document.getElementById('spinButton');
        const updateButton = document.getElementById('updateButton');
        const itemsInput = document.getElementById('itemsInput');
        const resultDisplay = document.getElementById('resultDisplay');
        const wheelAreaContainer = document.getElementById('wheelAreaContainer');
        const wheelOverlay = document.querySelector('.wheel-overlay');
        const celebrationContainer = document.getElementById('celebrationContainer');
        const winnerModalOverlay = document.getElementById('winnerModalOverlay');
        const modalWinnerName = document.getElementById('modalWinnerName');
        const modalCloseButton = document.getElementById('modalCloseButton');
        const modalRemoveButton = document.getElementById('modalRemoveButton');

        const mainContentWrapper = document.getElementById('mainContentWrapper');
        const entriesTabButton = document.querySelector('.tab-button[data-tab="entries"]');
        const resultsTabButton = document.querySelector('.tab-button[data-tab="results"]');
        const entriesCountEl = document.getElementById('entriesCountEl');
        const resultsCountEl = document.getElementById('resultsCountEl');
        const hideControlsCheckbox = document.getElementById('hideControlsCheckbox');
        const shuffleButton = document.getElementById('shuffleButton');
        const sortButton = document.getElementById('sortButton');
        const resultsListArea = document.getElementById('resultsListArea');
        const showControlsButton = document.getElementById('showControlsButton');

        const importButton = document.getElementById('importButton');
        const exportButton = document.getElementById('exportButton');
        const fileInput = document.getElementById('fileInput');
        const colorThemeSelect = document.getElementById('colorThemeSelect');
        const advancedSettingsButton = document.getElementById('advancedSettingsButton');
        const advancedSettingsPanel = document.getElementById('advancedSettingsPanel');
        const soundToggleCheckbox = document.getElementById('soundToggleCheckbox');
        const spinDurationInput = document.getElementById('spinDurationInput');
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        const fontSizeInput = document.getElementById('fontSizeInput');
        const customColorPickersContainer = document.getElementById('customColorPickersContainer');
        const resetCustomColorsButton = document.getElementById('resetCustomColorsButton');


        const localStorageKey = 'luckyWheelItems';
        const localStorageThemeKey = 'luckyWheelColorTheme';
        const localStorageSettingsPanelKey = 'luckyWheelSettingsPanelOpen';
        const localStorageSoundEnabledKey = 'luckyWheelSoundsEnabled';
        const localStorageSpinDurationKey = 'luckyWheelSpinDuration';
        const localStorageFontFamilyKey = 'luckyWheelFontFamily';
        const localStorageFontSizeKey = 'luckyWheelFontSize';
        const localStorageCustomColorsKey = 'luckyWheelCustomColors';

        const NUM_CUSTOM_COLOR_PICKERS = 10;

        const predefinedColorThemes = {
            classic: [
                "#c0c0c0", "#a9a9a9", "#808080", "#b87333", "#d2691e",
                "#e67e22", "#f39c12", "#555555", "#424242", "#f1c40f",
            ],
            pastel: [
                "#A0E7E5", "#FBE7C6", "#FFBFB5", "#FFAEBC", "#B4F8C8",
                "#E2D2F8", "#D4F0F0", "#FFEBD6", "#FFD6D6", "#D6FFD6",
            ],
            vibrant: [
                "#FF1744", "#F50057", "#D500F9", "#651FFF", "#3D5AFE",
                "#2979FF", "#00B0FF", "#00E5FF", "#1DE9B6", "#00E676",
            ],
            earthy: [
                "#A0522D", "#CD853F", "#D2B48C", "#8B4513", "#F4A460",
                "#BC8F8F", "#BDB76B", "#deb887", "#DAA520", "#FFE4B5",
            ],
            ocean: [
                "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF",
                "#ADE8F4", "#CAF0F8", "#E0FCFF", "#B6E2D3", "#99D4C2"
            ]
        };
        const webSafeFonts = [
            "Roboto, sans-serif",
            "Arial, Helvetica, sans-serif",
            "'Arial Black', Gadget, sans-serif",
            "'Comic Sans MS', cursive, sans-serif",
            "'Courier New', Courier, monospace",
            "Georgia, serif",
            "Impact, Charcoal, sans-serif",
            "'Lucida Console', Monaco, monospace",
            "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
            "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
            "Tahoma, Geneva, sans-serif",
            "'Times New Roman', Times, serif",
            "'Trebuchet MS', Helvetica, sans-serif",
            "Verdana, Geneva, sans-serif"
        ];

        let currentThemeKey = 'classic';
        let colors = [];
        let soundsEnabled = true;
        let baseSpinDurationSeconds = 3;
        let wheelFontFamily = "Roboto, sans-serif";
        let wheelFontSize = 16;
        let customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);


        let spinSound, winSound, clickSound;
        try {
            spinSound = new Audio('./static/music/spin.mp3');
            spinSound.loop = true;
            winSound = new Audio('./static/music/win.mp3');
            clickSound = new Audio('./static/music/whoosh.mp3');
        } catch (e) {
            console.error("Error initializing audio elements. Ensure spin.mp3, win.mp3, whoosh.mp3 are present or provide valid paths.", e);
            const dummyAudio = { play: () => Promise.resolve(), pause: () => {}, currentTime: 0, loop: false };
            spinSound = spinSound || dummyAudio;
            winSound = winSound || dummyAudio;
            clickSound = clickSound || dummyAudio;
        }

        function playClickSound() {
            if (!soundsEnabled) return;
            if (clickSound && typeof clickSound.play === 'function') {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.warn("Click sound play failed. User interaction might be needed first.", e));
            }
        }

        let items = [];
        let resultsList = [];
        let activeTab = 'entries';
        let currentAngle = 0;
        let spinAngleStart = 0;
        let spinTime = 0;
        let spinTimeTotal = 0;
        let isSpinning = false;
        let wheelCenterX, wheelCenterY, wheelRadius;
        let currentWinner = null;
        let debounceTimer;
        let targetDegreeFromStartSpin = 0;

        const DEFAULT_WEIGHT = 1;
        const DEFAULT_IS_VISIBLE = true;
        const DEFAULT_CUSTOM_COLOR = null;
        const PLACEHOLDER_ID = 'placeholder_item_id';


        const innerCircleColor = "#FFFFFF";
        const innerCircleStrokeColor = "#BBBBBB";
        const textColorBlack = "#000000";

        function loadSoundSetting() {
            const savedState = localStorage.getItem(localStorageSoundEnabledKey);
            if (savedState !== null) {
                soundsEnabled = savedState === 'true';
            } else {
                soundsEnabled = true;
            }
            if (soundToggleCheckbox) {
                soundToggleCheckbox.checked = soundsEnabled;
            }
        }

        function saveSoundSetting() {
            if (soundToggleCheckbox) {
                 soundsEnabled = soundToggleCheckbox.checked;
                 localStorage.setItem(localStorageSoundEnabledKey, soundsEnabled.toString());
            } else {
                 localStorage.setItem(localStorageSoundEnabledKey, soundsEnabled.toString());
            }
        }

        function loadSpinDurationSetting() {
            const savedDuration = localStorage.getItem(localStorageSpinDurationKey);
            if (savedDuration !== null) {
                const parsedDuration = parseFloat(savedDuration);
                if (!isNaN(parsedDuration) && parsedDuration >= 1 && parsedDuration <= 10) {
                    baseSpinDurationSeconds = parsedDuration;
                }
            }
            if (spinDurationInput) {
                spinDurationInput.value = baseSpinDurationSeconds;
            }
        }

        function saveSpinDurationSetting() {
            if (spinDurationInput) {
                let newDuration = parseFloat(spinDurationInput.value);
                if (!isNaN(newDuration) && newDuration >= 1 && newDuration <= 10) {
                    baseSpinDurationSeconds = newDuration;
                    localStorage.setItem(localStorageSpinDurationKey, baseSpinDurationSeconds.toString());
                } else {
                    spinDurationInput.value = baseSpinDurationSeconds;
                }
            }
        }

        function populateFontSelector() {
            if (!fontFamilySelect) return;
            fontFamilySelect.innerHTML = '';
            webSafeFonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font.split(',')[0].replace(/'/g, "");
                fontFamilySelect.appendChild(option);
            });
            fontFamilySelect.value = wheelFontFamily;
        }

        function loadFontSettings() {
            const savedFontFamily = localStorage.getItem(localStorageFontFamilyKey);
            if (savedFontFamily && webSafeFonts.includes(savedFontFamily)) {
                wheelFontFamily = savedFontFamily;
            } else {
                wheelFontFamily = "Roboto, sans-serif";
            }

            const savedFontSize = localStorage.getItem(localStorageFontSizeKey);
            if (savedFontSize !== null) {
                const parsedSize = parseInt(savedFontSize, 10);
                if (!isNaN(parsedSize) && parsedSize >= 8 && parsedSize <= 24) {
                    wheelFontSize = parsedSize;
                }
            } else {
                 wheelFontSize = 16;
            }

            if (fontFamilySelect) {
                fontFamilySelect.value = wheelFontFamily;
            }
            if (fontSizeInput) {
                fontSizeInput.value = wheelFontSize;
            }
        }

        function saveFontSettings() {
            let needsRedraw = false;
            if (fontFamilySelect) {
                const newFontFamily = fontFamilySelect.value;
                if (webSafeFonts.includes(newFontFamily) && newFontFamily !== wheelFontFamily) {
                    wheelFontFamily = newFontFamily;
                    needsRedraw = true;
                }
            }
            if (fontSizeInput) {
                const newFontSize = parseInt(fontSizeInput.value, 10);
                if (!isNaN(newFontSize) && newFontSize >= 8 && newFontSize <= 24) {
                    if (newFontSize !== wheelFontSize) {
                        wheelFontSize = newFontSize;
                        needsRedraw = true;
                    }
                } else {
                    fontSizeInput.value = wheelFontSize;
                }
            }

            localStorage.setItem(localStorageFontFamilyKey, wheelFontFamily);
            localStorage.setItem(localStorageFontSizeKey, wheelFontSize.toString());

            if (needsRedraw && !isSpinning) {
                drawWheel();
            }
        }

        function generateCustomColorPickers() {
            if (!customColorPickersContainer) return;
            customColorPickersContainer.innerHTML = '';
            for (let i = 0; i < NUM_CUSTOM_COLOR_PICKERS; i++) {
                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.dataset.index = i;
                colorInput.value = customSegmentColors[i] || '#ffffff';
                if (!customSegmentColors[i]) {
                    colorInput.setAttribute('data-is-default', 'true');
                }
                colorInput.addEventListener('input', handleCustomColorChange);
                customColorPickersContainer.appendChild(colorInput);
            }
        }

        function handleCustomColorChange(event) {
            const index = parseInt(event.target.dataset.index, 10);
            const newColor = event.target.value;
            event.target.removeAttribute('data-is-default');

            if (index >= 0 && index < NUM_CUSTOM_COLOR_PICKERS) {
                customSegmentColors[index] = newColor;
                saveCustomColors();
                if (!isSpinning) {
                    drawWheel();
                }
            }
        }

        function loadCustomColors() {
            const savedColorsString = localStorage.getItem(localStorageCustomColorsKey);
            if (savedColorsString) {
                try {
                    const parsedColors = JSON.parse(savedColorsString);
                    if (Array.isArray(parsedColors) && parsedColors.length === NUM_CUSTOM_COLOR_PICKERS) {
                        customSegmentColors = parsedColors;
                    } else {
                         customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
                    }
                } catch (e) {
                    console.error("Error parsing custom colors from localStorage:", e);
                    customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
                }
            } else {
                customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
            }
        }

        function saveCustomColors() {
            localStorage.setItem(localStorageCustomColorsKey, JSON.stringify(customSegmentColors));
        }

        function resetCustomColors() {
            if (window.confirm("Are you sure you want to reset all custom segment colors? This will revert to using the selected theme colors.")) {
                customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
                saveCustomColors();
                generateCustomColorPickers();
                if (!isSpinning) {
                    drawWheel();
                }
                resultDisplay.textContent = "Custom colors reset.";
            }
        }

        function loadColorTheme() {
            const savedThemeKey = localStorage.getItem(localStorageThemeKey);
            if (savedThemeKey && predefinedColorThemes[savedThemeKey]) {
                currentThemeKey = savedThemeKey;
            } else {
                currentThemeKey = 'classic';
            }
            colors = [...predefinedColorThemes[currentThemeKey]];
        }

        function saveColorTheme() {
            localStorage.setItem(localStorageThemeKey, currentThemeKey);
        }

        function populateThemeSelector() {
            if (!colorThemeSelect) return;
            colorThemeSelect.innerHTML = '';
            Object.keys(predefinedColorThemes).forEach(themeKey => {
                const option = document.createElement('option');
                option.value = themeKey;
                option.textContent = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
                colorThemeSelect.appendChild(option);
            });
            colorThemeSelect.value = currentThemeKey;
        }

        function applyColorTheme(themeKey) {
            if (predefinedColorThemes[themeKey]) {
                currentThemeKey = themeKey;
                colors = [...predefinedColorThemes[themeKey]];
                if(colorThemeSelect) colorThemeSelect.value = themeKey;
                drawWheel();
                saveColorTheme();
            }
        }

        function toggleAdvancedSettings() {
            if (!advancedSettingsPanel) return;
            const isExpanded = advancedSettingsPanel.classList.contains('expanded');
            if (isExpanded) {
                advancedSettingsPanel.classList.remove('expanded');
                advancedSettingsPanel.classList.add('collapsed');
                localStorage.setItem(localStorageSettingsPanelKey, 'false');
            } else {
                advancedSettingsPanel.classList.remove('collapsed');
                advancedSettingsPanel.classList.add('expanded');
                localStorage.setItem(localStorageSettingsPanelKey, 'true');
            }
        }

        function loadSettingsPanelState() {
            if (!advancedSettingsPanel) return;
            const savedState = localStorage.getItem(localStorageSettingsPanelKey);
            if (savedState === 'true') {
                advancedSettingsPanel.classList.remove('collapsed');
                advancedSettingsPanel.classList.add('expanded');
            } else {
                advancedSettingsPanel.classList.add('collapsed');
                advancedSettingsPanel.classList.remove('expanded');
            }
        }

        function loadItemsFromLocalStorage() {
            const storedItemsString = localStorage.getItem(localStorageKey);
            let loadedItems = [];

            if (storedItemsString) {
                try {
                    const parsed = JSON.parse(storedItemsString);
                    if (Array.isArray(parsed)) {
                        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'name' in parsed[0]) {
                            loadedItems = parsed.map(item => ({
                                id: item.id || Date.now().toString(36) + Math.random().toString(36).substring(2),
                                name: item.name || "Unnamed",
                                weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : DEFAULT_WEIGHT,
                                customColor: item.customColor || DEFAULT_CUSTOM_COLOR,
                                isVisibleOnWheel: typeof item.isVisibleOnWheel === 'boolean' ? item.isVisibleOnWheel : DEFAULT_IS_VISIBLE
                            }));
                        } else if (parsed.length > 0 && typeof parsed[0] === 'string') {
                            loadedItems = parsed.map((itemName, index) => ({
                                id: Date.now().toString(36) + Math.random().toString(36).substring(2) + itemName.slice(0,3) + index,
                                name: itemName,
                                weight: DEFAULT_WEIGHT,
                                customColor: DEFAULT_CUSTOM_COLOR,
                                isVisibleOnWheel: DEFAULT_IS_VISIBLE
                            }));
                        }
                    }
                } catch (e) {
                    console.error("Error parsing items from localStorage:", e);
                    localStorage.removeItem(localStorageKey);
                }
            }

            if (loadedItems.length === 0) {
                return ["Apricot", "Apple:5", "Banana", "Mango", "Tomato", "Ambrosia melon :2", "Grapes", "Blueberry"].map((name, index) => ({
                    id: Date.now().toString(36) + Math.random().toString(36).substring(2) + name.slice(0,3) + index,
                    name: name,
                    weight: DEFAULT_WEIGHT,
                    customColor: DEFAULT_CUSTOM_COLOR,
                    isVisibleOnWheel: DEFAULT_IS_VISIBLE
                }));
            }
            return loadedItems;
        }


        function saveItemsToLocalStorage() {
            const itemsToSave = items.filter(item => item.id !== PLACEHOLDER_ID);
            if (itemsToSave.length > 0) {
                localStorage.setItem(localStorageKey, JSON.stringify(itemsToSave));
            } else {
                localStorage.removeItem(localStorageKey);
            }
        }

        function resizeWheel() {
            if (!wheelAreaContainer || !canvas) return;
            const containerWidth = wheelAreaContainer.clientWidth;
            const containerHeight = wheelAreaContainer.clientHeight;
            const isHidden = mainContentWrapper.classList.contains('controls-hidden');
            const size = Math.min(containerWidth, containerHeight, isHidden ? 550 : 500);

            const finalSize = Math.max(1, size);
            canvas.width = finalSize;
            canvas.height = finalSize;

            wheelCenterX = canvas.width / 2;
            wheelCenterY = canvas.height / 2;
            wheelRadius = canvas.width / 2 - Math.max(5, canvas.width * 0.01);
            drawWheel();
        }

        function updateCounts() {
            const effectiveItems = items.filter(item => item.id !== PLACEHOLDER_ID);
            entriesCountEl.textContent = effectiveItems.length;
            resultsCountEl.textContent = resultsList.length;
        }

        function switchTab(tabName) {
            activeTab = tabName;
            const isEntriesTab = tabName === 'entries';

            entriesTabButton.classList.toggle('active', isEntriesTab);
            resultsTabButton.classList.toggle('active', !isEntriesTab);
            itemsInput.style.display = isEntriesTab ? 'block' : 'none';
            resultsListArea.style.display = isEntriesTab ? 'none' : 'block';

            if (isEntriesTab) {
                itemsInput.value = items.filter(item => item.id !== PLACEHOLDER_ID).map(item => {
                     return item.weight === DEFAULT_WEIGHT ? item.name : `${item.name} : ${item.weight}`;
                }).join('\n');
            } else {
                resultsListArea.textContent = resultsList.length > 0 ? resultsList.join('\n') : "No results yet.";
            }

            const buttonsShouldBeDisabled = !isEntriesTab || isSpinning;
            shuffleButton.disabled = buttonsShouldBeDisabled;
            sortButton.disabled = buttonsShouldBeDisabled;
            if (importButton) importButton.disabled = buttonsShouldBeDisabled;
            if (exportButton) exportButton.disabled = buttonsShouldBeDisabled;

            updateCounts();
        }

        function getItemsFromInput() {
            const inputText = itemsInput.value.trim();
            if (inputText) {
                return inputText.split('\n').map(item => item.trim()).filter(item => item !== "");
            }
            return [];
        }

        function updateItemsArrayAndDisplay(sourceEvent = null) {
            const previousItemsJson = JSON.stringify(items);
            let dedupMessage = "";
            let itemsWereModified = false;

            if (
                sourceEvent !== 'initial_load' &&
                sourceEvent !== 'shuffle_sort' &&
                sourceEvent !== 'remove_winner' &&
                sourceEvent !== 'import_processed' &&       // MODIFIED: Added this condition
                sourceEvent !== 'import_processed_empty'   // MODIFIED: Added this condition
            ) {
                const rawItemLines = getItemsFromInput();
                const existingItemsMap = new Map(items.filter(item => item.id !== PLACEHOLDER_ID).map(item => [item.name, item]));
                let processedEntries = [];

                rawItemLines.forEach((line, index) => {
                    let name = line.trim();
                    let weight = DEFAULT_WEIGHT;
                    const parts = name.split(':');
                    if (parts.length > 1) {
                        const potentialWeight = parseFloat(parts[parts.length -1].trim());
                        if (!isNaN(potentialWeight) && potentialWeight > 0) {
                            weight = potentialWeight;
                        }
                        name = parts.slice(0, -1).join(':').trim();
                    }
                    if (name) {
                        processedEntries.push({ name, weight, originalLineIndex: index });
                    }
                });

                let finalItemsToProcess = processedEntries;
                const uniqueNamesFound = new Set();
                const itemsAfterInitialNameDedup = [];

                if (sourceEvent === 'manual_update' || sourceEvent === 'input_spin_update') {
                    let nameCounts = {};
                    processedEntries.forEach(entry => { nameCounts[entry.name] = (nameCounts[entry.name] || 0) + 1; });
                    let duplicateNamesExist = Object.values(nameCounts).some(count => count > 1);

                    if (duplicateNamesExist) {
                        const numPotentialDuplicates = processedEntries.length - Object.keys(nameCounts).length;
                        if (numPotentialDuplicates > 0) {
                            const userAgreesToDedup = window.confirm(
                                `Found ${numPotentialDuplicates} duplicate name(s) in your input. Remove them (keeping the first occurrence with its weight)?`
                            );
                            if (userAgreesToDedup) {
                                processedEntries.forEach(entry => {
                                    if (!uniqueNamesFound.has(entry.name)) {
                                        itemsAfterInitialNameDedup.push(entry);
                                        uniqueNamesFound.add(entry.name);
                                    }
                                });
                                finalItemsToProcess = itemsAfterInitialNameDedup;
                                dedupMessage = `Removed ${numPotentialDuplicates} duplicate name(s).`;
                            } else {
                                dedupMessage = `Kept duplicate item(s) as per your choice.`;
                            }
                        }
                    }
                }

                items = finalItemsToProcess.map((entry, index) => {
                    const existingItem = existingItemsMap.get(entry.name);
                    let id = (existingItem && (!uniqueNamesFound.size || uniqueNamesFound.has(entry.name))) ? existingItem.id :
                               (Date.now().toString(36) + Math.random().toString(36).substring(2) + entry.name.slice(0,2) + entry.originalLineIndex);

                    return {
                        id: id,
                        name: entry.name,
                        weight: entry.weight,
                        customColor: existingItem ? existingItem.customColor : DEFAULT_CUSTOM_COLOR,
                        isVisibleOnWheel: existingItem ? existingItem.isVisibleOnWheel : DEFAULT_IS_VISIBLE
                    };
                });
                itemsWereModified = true;
            }

            if (items.length === 0) {
                 items = [{
                    id: PLACEHOLDER_ID,
                    name: "Add Item!",
                    weight: DEFAULT_WEIGHT,
                    customColor: DEFAULT_CUSTOM_COLOR,
                    isVisibleOnWheel: false
                }];
                const prevItemsNonPlaceholder = JSON.parse(previousItemsJson).filter(item => item.id !== PLACEHOLDER_ID);
                if (prevItemsNonPlaceholder.length > 0) itemsWereModified = true;
            }

            if (activeTab === 'entries') {
                itemsInput.value = items.filter(item => item.id !== PLACEHOLDER_ID).map(item => {
                     return item.weight === DEFAULT_WEIGHT ? item.name : `${item.name} : ${item.weight}`;
                }).join('\n');
            }

            if (!isSpinning) currentAngle = 0;
            drawWheel();
            updateCounts();

            // MODIFIED: Moved and expanded result message logic
            if (dedupMessage) {
                resultDisplay.textContent = dedupMessage;
            } else if (sourceEvent === 'import_processed') {
                resultDisplay.textContent = "Items imported successfully!";
            } else if (sourceEvent === 'import_processed_empty') {
                 resultDisplay.textContent = "Imported file was empty or invalid. List reset.";
            } else if (!isSpinning && sourceEvent === 'initial_load') {
                resultDisplay.textContent = "Spin to select!";
            } else if (!isSpinning &&
                !['remove_winner', 'export_success', 'export_fail_empty', 'custom_colors_reset'].includes(sourceEvent)
            ) {
                 resultDisplay.textContent = "Wheel updated. Spin to select!";
            }

            if (itemsWereModified || JSON.stringify(items) !== previousItemsJson ||
                sourceEvent === 'manual_update' ||
                sourceEvent === 'remove_winner' ||
                sourceEvent === 'shuffle_sort' ||
                sourceEvent === 'input_spin_update' ||
                sourceEvent === 'import_processed' ||      // MODIFIED: Ensure saving after import
                sourceEvent === 'import_processed_empty'   // MODIFIED: Ensure saving after import
                ) {
                saveItemsToLocalStorage();
            }
        }

        itemsInput.addEventListener('input', () => {
            if (activeTab === 'entries') {
                debounce(() => {
                    // When user types, we still want to read from input and update the wheel preview
                    // So we don't pass a specific sourceEvent that would skip reading the input.
                    // Or, we can use 'manual_update' if that's the intended behavior for live typing updates.
                    // For now, let's keep it simple and just redraw + update counts.
                    // If full processing like de-duplication is needed on type, call updateItemsArrayAndDisplay.
                    drawWheel();
                    updateCounts();
                }, 300);
            }
        });

        function drawWheel() {
            if (!wheelRadius || !items || !colors || !ctx) {
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
             if (canvas.width <= 0 || canvas.height <= 0) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawableItems = items.filter(item => item.id !== PLACEHOLDER_ID && item.isVisibleOnWheel);
            const hasValidItems = drawableItems.length > 0;

            if (hasValidItems) {
                const totalWeight = drawableItems.reduce((sum, item) => sum + (item.weight || DEFAULT_WEIGHT), 0);

                ctx.font = `bold ${wheelFontSize}px ${wheelFontFamily}`;
                const innerRadius = Math.max(0, wheelRadius * 0.25);
                let currentSegmentDrawAngle = currentAngle;

                for (let i = 0; i < drawableItems.length; i++) {
                    const item = drawableItems[i];
                    const itemWeight = item.weight || DEFAULT_WEIGHT;
                    const arcSizeForThisItem = (totalWeight > 0) ? (itemWeight / totalWeight) * (2 * Math.PI) : (2 * Math.PI) / drawableItems.length;
                    const segmentEndAngleRad = currentSegmentDrawAngle + arcSizeForThisItem;

                    let segmentColor;
                    const originalItemGlobalIndex = items.findIndex(globalItem => globalItem.id === item.id);

                    if (originalItemGlobalIndex !== -1 && originalItemGlobalIndex < NUM_CUSTOM_COLOR_PICKERS && customSegmentColors[originalItemGlobalIndex]) {
                        segmentColor = customSegmentColors[originalItemGlobalIndex];
                    } else {
                        segmentColor = item.customColor || colors[i % colors.length];
                    }
                    ctx.fillStyle = segmentColor;
                    ctx.strokeStyle = innerCircleStrokeColor;
                    ctx.lineWidth = (segmentColor === '#FFFFFF' || segmentColor === '#ffffff') ? 1.5 : 1;

                    ctx.beginPath();
                    ctx.arc(wheelCenterX, wheelCenterY, wheelRadius, currentSegmentDrawAngle, segmentEndAngleRad, false);
                    if (innerRadius > 0) {
                        ctx.arc(wheelCenterX, wheelCenterY, innerRadius, segmentEndAngleRad, currentSegmentDrawAngle, true);
                    } else {
                         ctx.lineTo(wheelCenterX, wheelCenterY);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    ctx.save();
                    ctx.fillStyle = textColorBlack;
                    ctx.translate(wheelCenterX, wheelCenterY);
                    ctx.rotate(currentSegmentDrawAngle + arcSizeForThisItem / 2);

                    const text = item.name || "Empty";
                    const textXPosition = innerRadius + (wheelRadius - innerRadius) / 2;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    const maxTextDisplayWidth = (wheelRadius - innerRadius) * 0.85;
                    let textToDisplay = text;
                    if (ctx.measureText(text).width > maxTextDisplayWidth && maxTextDisplayWidth > 0) {
                         while(ctx.measureText(textToDisplay + "...").width > maxTextDisplayWidth && textToDisplay.length > 1) {
                            textToDisplay = textToDisplay.slice(0, -1);
                        }
                        if (textToDisplay.length < text.length && textToDisplay.length > 0) {
                             textToDisplay += "...";
                        } else if (textToDisplay.length === 0 && text.length > 0) {
                            textToDisplay = text.slice(0,1) + "...";
                        }
                    }
                    if (wheelRadius > 10) {
                        ctx.fillText(textToDisplay, textXPosition, 0);
                    }
                    ctx.restore();
                    currentSegmentDrawAngle = segmentEndAngleRad;
                }
            } else {
                ctx.beginPath();
                ctx.arc(wheelCenterX, wheelCenterY, wheelRadius, 0, 2 * Math.PI, false);
                let emptyFillColor = predefinedColorThemes[currentThemeKey]?.[0] || '#f0f2f5';
                if (currentThemeKey === 'classic' && emptyFillColor.toUpperCase() === '#FFFFFF') {
                     emptyFillColor = '#f8f8f8';
                } else if (emptyFillColor.toUpperCase() === '#FFFFFF' && colors.length > 1) {
                     emptyFillColor = colors[1] || '#f8f8f8';
                }
                ctx.fillStyle = emptyFillColor;
                ctx.fill();
                ctx.strokeStyle = innerCircleStrokeColor;
                ctx.lineWidth = 1;
                ctx.stroke();
                 if (wheelRadius > 20) {
                    ctx.fillStyle = textColorBlack;
                    ctx.font = `bold ${Math.min(20, wheelRadius * 0.1)}px ${wheelFontFamily}`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("Add Items!", wheelCenterX, wheelCenterY);
                }
            }

            if (wheelOverlay) {
                if (isSpinning) {
                    wheelOverlay.style.display = 'none';
                } else {
                    wheelOverlay.style.display = 'flex';
                }
            }
        }

        function easeOut(t, b, c, d) {
            t /= d; t--;
            return c * (t * t * t + 1) + b;
        }

        function rotateWheel() {
            spinTime += 20;
            if (spinTime >= spinTimeTotal) {
                currentAngle = targetDegreeFromStartSpin * Math.PI / 180;
                currentAngle %= (2 * Math.PI);
                if (currentAngle < 0) currentAngle += (2 * Math.PI);
                drawWheel();
                stopRotateWheel();
                return;
            }

            const easedTotalRotationSoFar = easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
            const easedTotalRotationLastFrame = easeOut(Math.max(0, spinTime - 20), 0, spinAngleStart, spinTimeTotal);
            const degreesToRotateThisFrame = easedTotalRotationSoFar - easedTotalRotationLastFrame;

            currentAngle += (degreesToRotateThisFrame * Math.PI / 180);
            currentAngle %= (2 * Math.PI);
            if (currentAngle < 0) currentAngle += (2 * Math.PI);
            drawWheel();
            requestAnimationFrame(rotateWheel);
        }

        function startSpin() {
            if (activeTab === 'entries') {
                updateItemsArrayAndDisplay('input_spin_update');
            }

            const spinnableItems = items.filter(item => item.id !== PLACEHOLDER_ID && item.isVisibleOnWheel);

            if (spinnableItems.length === 0) {
                resultDisplay.textContent = "Add items to spin!";
                return;
            }

            if (isSpinning) return;

            isSpinning = true;
            if (wheelOverlay) wheelOverlay.style.display = 'none';
            if (wheelAreaContainer) wheelAreaContainer.classList.add('spinning');

            spinButton.disabled = true; updateButton.disabled = true; itemsInput.disabled = true;
            shuffleButton.disabled = true; sortButton.disabled = true;
            if (importButton) importButton.disabled = true;
            if (exportButton) exportButton.disabled = true;
            resultDisplay.textContent = "Spinning...";

            if (soundsEnabled && spinSound && typeof spinSound.play === 'function') {
                spinSound.currentTime = 0;
                spinSound.play().catch(e => console.warn("Spin sound play failed:", e));
            }

            const baseMilliseconds = baseSpinDurationSeconds * 1000;
            spinTimeTotal = baseMilliseconds + Math.random() * 2000;

            const totalWeightForSpin = spinnableItems.reduce((sum, item) => sum + (item.weight || DEFAULT_WEIGHT), 0);
            if (totalWeightForSpin <= 0) {
                console.error("Cannot spin, total weight of spinnable items is 0 or less.");
                isSpinning = false;
                spinButton.disabled = false; updateButton.disabled = false; itemsInput.disabled = false;
                switchTab(activeTab);
                resultDisplay.textContent = "Invalid weights. All items have 0 or invalid weight.";
                return;
            }

            const randomWeightPoint = Math.random() * totalWeightForSpin;
            let cumulativeWeight = 0;
            let winningItemForSpin = null;
            let winningItemVisualIndex = -1;

            for (let i = 0; i < spinnableItems.length; i++) {
                const item = spinnableItems[i];
                cumulativeWeight += (item.weight || DEFAULT_WEIGHT);
                if (randomWeightPoint <= cumulativeWeight) {
                    winningItemForSpin = item;
                    winningItemVisualIndex = i;
                    break;
                }
            }

            if (!winningItemForSpin && spinnableItems.length > 0) {
                winningItemForSpin = spinnableItems[spinnableItems.length - 1];
                winningItemVisualIndex = spinnableItems.length - 1;
            }

            if (!winningItemForSpin) {
                isSpinning = false; switchTab(activeTab); return;
            }
            currentWinner = winningItemForSpin.name;

            let startAngleOfWinningSegmentDeg = 0;
            for(let i = 0; i < winningItemVisualIndex; i++) {
                const itemW = spinnableItems[i].weight || DEFAULT_WEIGHT;
                startAngleOfWinningSegmentDeg += (itemW / totalWeightForSpin) * 360;
            }
            const angleOfWinningSegmentDeg = ((winningItemForSpin.weight || DEFAULT_WEIGHT) / totalWeightForSpin) * 360;

            const isMobile = window.innerWidth <= 768;
            const pointerIsOnTop = isMobile && !mainContentWrapper.classList.contains('controls-hidden');
            const pointerRefAngleDeg = pointerIsOnTop ? 270 : 0;

            const minOffsetRatio = 0.3;
            const maxOffsetRatio = 0.7;
            const randomSegmentOffsetRatio = Math.random() * (maxOffsetRatio - minOffsetRatio) + minOffsetRatio;
            const offsetIntoSegmentDeg = angleOfWinningSegmentDeg * randomSegmentOffsetRatio;

            targetDegreeFromStartSpin = (pointerRefAngleDeg - (startAngleOfWinningSegmentDeg + offsetIntoSegmentDeg) + 360 * 10) % 360;

            let currentVisualAngleDeg = (currentAngle * 180 / Math.PI);
            currentVisualAngleDeg = (currentVisualAngleDeg % 360 + 360) % 360;

            let netRotationToTarget = (targetDegreeFromStartSpin - currentVisualAngleDeg + 360) % 360;
            spinAngleStart = (Math.floor(Math.random() * 2) + 4) * 360 + netRotationToTarget;

            spinTime = 0;
            requestAnimationFrame(rotateWheel);
        }

        function stopRotateWheel() {
            isSpinning = false;
            if (soundsEnabled && spinSound && typeof spinSound.pause === 'function') {
                spinSound.pause();
                spinSound.currentTime = 0;
            }
            if (soundsEnabled && winSound && typeof winSound.play === 'function') {
                winSound.currentTime = 0;
                winSound.play().catch(e => console.warn("Win sound play failed:", e));
            }

            if (wheelOverlay && items.filter(item => item.id !== PLACEHOLDER_ID).length > 0) {
                 wheelOverlay.style.display = 'flex';
            }
            if (wheelAreaContainer) wheelAreaContainer.classList.remove('spinning');

            spinButton.disabled = false;
            updateButton.disabled = false;
            itemsInput.disabled = false;

            switchTab(activeTab);

            if (currentWinner) {
                if (!resultsList.includes(currentWinner)){
                    resultsList.push(currentWinner);
                }
                updateCounts();
                if(activeTab === 'results') {
                     resultsListArea.textContent = resultsList.length > 0 ? resultsList.join('\n') : "No results yet.";
                }
                showModal(currentWinner);
                triggerCelebration();
            } else {
                 resultDisplay.textContent = "Error determining result. Try again!";
                 console.error("CRITICAL: currentWinner was not set or became null before stopRotateWheel!");
            }
        }

        function showModal(winnerName) {
            modalWinnerName.textContent = winnerName;
            winnerModalOverlay.classList.add('active');
        }

        function hideModal() {
            winnerModalOverlay.classList.remove('active');
            const spinnableItems = items.filter(item => item.id !== PLACEHOLDER_ID);
             if (spinnableItems.length > 0) {
                resultDisplay.textContent = "Spin again or update list!";
            } else {
                resultDisplay.textContent = "Add items to the list to spin!";
            }
        }

        if (modalCloseButton) modalCloseButton.addEventListener('click', hideModal);

        winnerModalOverlay.addEventListener('click', (event) => {
            if (event.target === winnerModalOverlay) {
                hideModal();
            }
        });

        if (modalRemoveButton) {
            modalRemoveButton.addEventListener('click', () => {
                const winnerIndex = items.findIndex(item => item.name === currentWinner && item.id !== PLACEHOLDER_ID);
                if (winnerIndex > -1) {
                    const removedItemName = items[winnerIndex].name;
                    items.splice(winnerIndex, 1);
                    updateItemsArrayAndDisplay('remove_winner');
                    resultDisplay.textContent = `"${removedItemName}" removed. Spin again!`;
                } else {
                     console.warn(`Winner "${currentWinner}" not found for removal or was placeholder.`);
                }
                hideModal();
            });
        }


        function triggerCelebration() {
            const confettiCount = 50;
            const confettiColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = -Math.random() * 50 + 'vh';
                confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.transform = `scale(${Math.random() * 0.5 + 0.5}) rotate(${Math.random() * 360}deg)`;
                celebrationContainer.appendChild(confetti);
                setTimeout(() => confetti.remove(), 5000);
            }
        }

        function exportItems() {
            if (isSpinning) return;
            const itemsToExport = items.filter(item => item.id !== PLACEHOLDER_ID).map(item => {
                return item.weight === DEFAULT_WEIGHT ? item.name : `${item.name} : ${item.weight}`;
            });

            if (itemsToExport.length === 0) {
                resultDisplay.textContent = "Nothing to export. Add some items first!";
                return;
            }
            const textContent = itemsToExport.join('\n');
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'lucky_wheel_items.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resultDisplay.textContent = "Items exported successfully!";
        }

        function importItemsTrigger() {
            if (isSpinning) return;
            fileInput.click();
        }

        function handleFileImport(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const textContent = e.target.result;
                const importedItemLines = textContent.split('\n')
                                           .map(line => line.trim())
                                           .filter(line => line !== "");

                if (importedItemLines.length > 0) {
                    items = importedItemLines.map((line, index) => {
                        let name = line;
                        let weight = DEFAULT_WEIGHT;
                        const parts = line.split(':');
                        if (parts.length > 1) {
                            const potentialWeight = parseFloat(parts[parts.length -1].trim());
                            if (!isNaN(potentialWeight) && potentialWeight > 0) weight = potentialWeight;
                            name = parts.slice(0, -1).join(':').trim();
                        }
                        return {
                            id: Date.now().toString(36) + Math.random().toString(36).substring(2) + name.slice(0,3) + index,
                            name: name,
                            weight: weight,
                            customColor: DEFAULT_CUSTOM_COLOR,
                            isVisibleOnWheel: DEFAULT_IS_VISIBLE
                        };
                    });
                    updateItemsArrayAndDisplay('import_processed'); // MODIFIED: Changed sourceEvent
                } else {
                    items = [{ id: PLACEHOLDER_ID, name: "Add Item!", weight: DEFAULT_WEIGHT, customColor: DEFAULT_CUSTOM_COLOR, isVisibleOnWheel: false }];
                    updateItemsArrayAndDisplay('import_processed_empty'); // MODIFIED: Changed sourceEvent for empty case
                }
                fileInput.value = ''; // Reset file input
            };
            reader.onerror = function() {
                resultDisplay.textContent = "Error reading file.";
                fileInput.value = '';
            };
            reader.readAsText(file);
        }


        if (wheelOverlay) {
            wheelOverlay.addEventListener('click', () => {
                playClickSound();
                startSpin();
            });
        }

        entriesTabButton.addEventListener('click', () => switchTab('entries'));
        resultsTabButton.addEventListener('click', () => switchTab('results'));

        hideControlsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                mainContentWrapper.classList.add('controls-hidden');
            } else {
                mainContentWrapper.classList.remove('controls-hidden');
            }
            requestAnimationFrame(() => {
                setTimeout(resizeWheel, 50);
            });
        });

        showControlsButton.addEventListener('click', () => {
            hideControlsCheckbox.checked = false;
            const changeEvent = new Event('change', { bubbles: true });
            hideControlsCheckbox.dispatchEvent(changeEvent);
        });


        shuffleButton.addEventListener('click', () => {
            if (isSpinning || activeTab !== 'entries') return;
            const spinnableItems = items.filter(item => item.id !== PLACEHOLDER_ID);
             if (spinnableItems.length > 1) {
                for (let i = spinnableItems.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [spinnableItems[i], spinnableItems[j]] = [spinnableItems[j], spinnableItems[i]];
                }
                items = items.length === 1 && items[0].id === PLACEHOLDER_ID ? items : spinnableItems;
                updateItemsArrayAndDisplay('shuffle_sort');
            }
        });

        sortButton.addEventListener('click', () => {
            if (isSpinning || activeTab !== 'entries') return;
            const spinnableItems = items.filter(item => item.id !== PLACEHOLDER_ID);
            if (spinnableItems.length > 0) {
                spinnableItems.sort((a, b) => a.name.localeCompare(b.name));
                items = items.length === 1 && items[0].id === PLACEHOLDER_ID ? items : spinnableItems;
                updateItemsArrayAndDisplay('shuffle_sort');
            }
        });

        window.addEventListener('resize', () => { debounce(resizeWheel, 150); });
        
        function debounce(func, delay) { // MODIFIED: Moved debounce to be defined before use in itemsInput listener
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(func, delay);
        }

        document.addEventListener('DOMContentLoaded', () => {
            items = loadItemsFromLocalStorage();
            loadColorTheme();
            populateThemeSelector();
            loadSettingsPanelState();
            loadSoundSetting();
            loadSpinDurationSetting();
            loadFontSettings();
            populateFontSelector();
            loadCustomColors();
            generateCustomColorPickers();

            resizeWheel();
            switchTab('entries'); // This will call updateItemsArrayAndDisplay('initial_load' implicitly via itemsInput update if logic is changed)
                                 // Let's ensure 'initial_load' is explicitly handled if needed by switchTab or by calling updateItemsArrayAndDisplay separately
            updateItemsArrayAndDisplay('initial_load'); // Explicit call for initial setup


            if(itemsInput) itemsInput.placeholder = "Enter one item per line...\n(e.g., Apple or Banana : 2 for weight)";
            if(resultsListArea) resultsListArea.placeholder = "Results will appear here...";
        });


        updateButton.addEventListener('click', () => updateItemsArrayAndDisplay('manual_update'));

        spinButton.addEventListener('click', () => {
            playClickSound();
            startSpin();
        });

        if (exportButton) exportButton.addEventListener('click', exportItems);
        if (importButton) importButton.addEventListener('click', importItemsTrigger);
        if (fileInput) fileInput.addEventListener('change', handleFileImport);

        if (colorThemeSelect) {
            colorThemeSelect.addEventListener('change', (event) => {
                applyColorTheme(event.target.value);
            });
        }
        if (advancedSettingsButton) {
            advancedSettingsButton.addEventListener('click', toggleAdvancedSettings);
        }
        if (soundToggleCheckbox) {
            soundToggleCheckbox.addEventListener('change', saveSoundSetting);
        }
        if (spinDurationInput) {
            spinDurationInput.addEventListener('change', saveSpinDurationSetting);
        }
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', saveFontSettings);
        }
        if (fontSizeInput) {
            fontSizeInput.addEventListener('change', saveFontSettings);
        }
        if (resetCustomColorsButton) {
            resetCustomColorsButton.addEventListener('click', resetCustomColors);
        }
        // --- SCRIPT CONTENT STARTS HERE ---
        // (你的所有现有 JavaScript 代码)
        // ...

        // ======== Navbar Toggler Script ========
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.getElementById('navbarIndustrialNav');
        const navLinks = document.querySelectorAll('.navbar-industrial .nav-link'); // 获取所有导航链接

        if (navbarToggler && navbarCollapse) {
            navbarToggler.addEventListener('click', () => {
                const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true' || false;
                navbarToggler.setAttribute('aria-expanded', !isExpanded);
                navbarCollapse.classList.toggle('show');
                // playClickSound(); // 可选：播放点击声音
            });
        }

        // 点击导航链接后，如果是在移动端展开的菜单，则关闭菜单
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('show')) {
                    navbarToggler.setAttribute('aria-expanded', 'false');
                    navbarCollapse.classList.remove('show');
                }

                // 平滑滚动到锚点
                const targetSelector = link.getAttribute('href');
                if (targetSelector && targetSelector.startsWith('#') || targetSelector.startsWith('.')) {
                    const targetElement = document.querySelector(targetSelector);
                    if (targetElement) {
                        event.preventDefault(); // 阻止默认锚点跳转行为
                        // 如果 target 是FAQ或New Section，并且它们是隐藏的，则显示它们
                        if ((targetSelector === '#faq-section' || targetSelector === '#new-section') && targetElement.style.display === 'none') {
                           // 先隐藏所有manual-section，再显示目标
                           document.querySelectorAll('.manual-section.container[id]').forEach(s => s.style.display = 'none');
                           targetElement.style.display = 'block';
                           // 对于 "User Guide"，它可能总是可见的，或者根据链接决定
                           if(targetSelector !== '.manual-section') { // 如果不是主用户手册
                               const mainManual = document.querySelector('.manual-section:not([id])');
                               if(mainManual) mainManual.style.display = 'none';
                           } else {
                               document.querySelectorAll('.manual-section.container[id]').forEach(s => s.style.display = 'none');
                               targetElement.style.display = 'block'; //确保用户手册显示
                           }
                        } else if (targetSelector === '.manual-section') {
                            document.querySelectorAll('.manual-section.container[id]').forEach(s => s.style.display = 'none');
                            targetElement.style.display = 'block';
                        }


                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });

        // 可选: 点击页面其他地方关闭展开的导航菜单 (如果需要)
        document.addEventListener('click', function(event) {
            const isClickInsideNavbar = navbarToggler.contains(event.target) || navbarCollapse.contains(event.target);
            if (!isClickInsideNavbar && navbarCollapse.classList.contains('show')) {
                navbarToggler.setAttribute('aria-expanded', 'false');
                navbarCollapse.classList.remove('show');
            }
        });


        // 初始时，确保只有 User Guide 显示 (如果 #new-section 和 #faq-section 默认隐藏)
        document.addEventListener('DOMContentLoaded', () => {
            // ... 现有 DOMContentLoaded 内容 ...

            const newSection = document.getElementById('new-section');
            const faqSection = document.getElementById('faq-section');
            const mainManual = document.querySelector('.manual-section:not([id])'); // 主用户手册

            if (newSection) newSection.style.display = 'none';
            if (faqSection) faqSection.style.display = 'none';
            if (mainManual) mainManual.style.display = 'block'; // 默认显示主用户手册

            // 如果 URL 中有 hash，尝试滚动到对应区域并显示
            if (window.location.hash) {
                const hashTarget = document.querySelector(window.location.hash);
                if (hashTarget && (hashTarget.id === 'new-section' || hashTarget.id === 'faq-section')) {
                    document.querySelectorAll('.manual-section.container[id]').forEach(s => s.style.display = 'none');
                    if(mainManual) mainManual.style.display = 'none';
                    hashTarget.style.display = 'block';
                    hashTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (hashTarget && hashTarget.classList.contains('manual-section')) {
                     document.querySelectorAll('.manual-section.container[id]').forEach(s => s.style.display = 'none');
                     hashTarget.style.display = 'block';
                     hashTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });