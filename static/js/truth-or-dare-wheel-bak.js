// =================================================================================
// UNIFIED WHEEL SCRIPT
// This script is designed to be used by multiple wheel pages.
// It dynamically loads page-specific configurations for default items and localStorage keys.
// =================================================================================

// ===== 1. CONFIGURATION FOR DIFFERENT WHEELS =====
const getPageConfig = () => {
    const pagePath = window.location.pathname;
    // Extracts filename without extension (e.g., "yes-or-no-wheel"). Defaults to "index" for root path.
    const pageName = pagePath.substring(pagePath.lastIndexOf('/') + 1).replace('.html', '') || 'index';

    // --- Add new wheel configurations here ---
    const pageConfigs = {
        'index': {
            defaults: ['Alice', 'Bob:3', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi']
        },
        'truth-or-dare-wheel': {
            defaults: [
                'What is the most embarrassing thing you have ever done?',
                'What is a secret you have never told anyone?',
                'What is the biggest lie you have ever told?',
                'Sing everything you say for the next 10 minutes.',
                'Do 20 pushups.',
                'Let the person to your right post anything they want on your social media.'
            ]
        },
        'yes-or-no-wheel': {
            defaults: ['Yes', 'No','Yes', 'No','Yes', 'No','Yes', 'No']
        }
        // Example for a future wheel page named "what-to-eat-wheel.html":
        // 'what-to-eat-wheel': {
        //     defaults: ['Pizza', 'Burger', 'Salad', 'Sushi', 'Tacos']
        // }
    };

    const selectedConfig = pageConfigs[pageName] || pageConfigs['index']; // Fallback to index config
    const keySuffix = pageName; // Use the page name for unique keys

    // Return the selected defaults and a set of unique localStorage keys for this page
    return {
        defaults: selectedConfig.defaults,
        keys: {
            items: `luckyWheelItems_${keySuffix}`,
            theme: `luckyWheelColorTheme_${keySuffix}`,
            settingsPanelOpen: `luckyWheelSettingsPanelOpen_${keySuffix}`,
            soundEnabled: `luckyWheelSoundsEnabled_${keySuffix}`,
            spinDuration: `luckyWheelSpinDuration_${keySuffix}`,
            fontFamily: `luckyWheelFontFamily_${keySuffix}`,
            fontSize: `luckyWheelFontSize_${keySuffix}`,
            customColors: `luckyWheelCustomColors_${keySuffix}`
        }
    };
};

// ===== 2. INITIALIZE PAGE-SPECIFIC CONFIGURATION =====
const CONFIG = getPageConfig();


// ===== 3. SCRIPT CORE LOGIC (Uses CONFIG object) =====

// DOM Elements
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

// Constants
const NUM_CUSTOM_COLOR_PICKERS = 10;
const DEFAULT_WEIGHT = 1;
const DEFAULT_IS_VISIBLE = true;
const DEFAULT_CUSTOM_COLOR = null;
const PLACEHOLDER_ID = 'placeholder_item_id';
const innerCircleColor = "#FFFFFF";
const innerCircleStrokeColor = "#BBBBBB";
const textColorBlack = "#000000";

// Predefined Themes & Fonts
const predefinedColorThemes = {
    pastel: ["#A0E7E5", "#FBE7C6", "#FFBFB5", "#FFAEBC", "#B4F8C8", "#E2D2F8", "#D4F0F0", "#FFEBD6", "#FFD6D6", "#D6FFD6"],
    classic: ["#c0c0c0", "#a9a9a9", "#808080", "#b87333", "#d2691e", "#e67e22", "#f39c12", "#555555", "#424242", "#f1c40f"],
    vibrant: ["#FF1744", "#F50057", "#D500F9", "#651FFF", "#3D5AFE", "#2979FF", "#00B0FF", "#00E5FF", "#1DE9B6", "#00E676"],
    earthy: ["#A0522D", "#CD853F", "#D2B48C", "#8B4513", "#F4A460", "#BC8F8F", "#BDB76B", "#deb887", "#DAA520", "#FFE4B5"],
    ocean: ["#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF", "#ADE8F4", "#CAF0F8", "#E0FCFF", "#B6E2D3", "#99D4C2"]
};
const webSafeFonts = ["Roboto, sans-serif", "Arial, Helvetica, sans-serif", "'Arial Black', Gadget, sans-serif", "'Comic Sans MS', cursive, sans-serif", "'Courier New', Courier, monospace", "Georgia, serif", "Impact, Charcoal, sans-serif", "'Lucida Console', Monaco, monospace", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", "'Palatino Linotype', 'Book Antiqua', Palatino, serif", "Tahoma, Geneva, sans-serif", "'Times New Roman', Times, serif", "'Trebuchet MS', Helvetica, sans-serif", "Verdana, Geneva, sans-serif"];

// State Variables
let currentThemeKey = 'classic';
let colors = [];
let soundsEnabled = true;
let baseSpinDurationSeconds = 3;
let wheelFontFamily = "Roboto, sans-serif";
let wheelFontSize = 16;
let customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
let spinSound, winSound, clickSound;
let items = [];
let resultsList = [];
let activeTab = 'entries';
let currentAngle = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let isSpinning = false;
let wheelCenterX, wheelCenterY, wheelRadius;
let currentWinner = null;
let debounceTimer;

// --- Sound Initialization ---
try {
    spinSound = new Audio('./static/music/spin.mp3');
    spinSound.loop = true;
    winSound = new Audio('./static/music/win.mp3');
    clickSound = new Audio('./static/music/whoosh.mp3');
} catch (e) {
    console.error("Error initializing audio.", e);
    const dummyAudio = { play: () => Promise.resolve(), pause: () => {}, currentTime: 0, loop: false };
    spinSound = spinSound || dummyAudio;
    winSound = winSound || dummyAudio;
    clickSound = clickSound || dummyAudio;
}

function playClickSound() {
    if (!soundsEnabled) return;
    if (clickSound && typeof clickSound.play === 'function') {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.warn("Click sound failed.", e));
    }
}

// --- Settings Load/Save Functions (Now using dynamic keys from CONFIG) ---
function loadSoundSetting() {
    const savedState = localStorage.getItem(CONFIG.keys.soundEnabled);
    soundsEnabled = savedState !== null ? savedState === 'true' : true;
    if (soundToggleCheckbox) soundToggleCheckbox.checked = soundsEnabled;
}

function saveSoundSetting() {
    soundsEnabled = soundToggleCheckbox ? soundToggleCheckbox.checked : soundsEnabled;
    localStorage.setItem(CONFIG.keys.soundEnabled, soundsEnabled.toString());
}

function loadSpinDurationSetting() {
    const savedDuration = localStorage.getItem(CONFIG.keys.spinDuration);
    if (savedDuration !== null) {
        const parsedDuration = parseFloat(savedDuration);
        if (!isNaN(parsedDuration) && parsedDuration >= 1 && parsedDuration <= 10) {
            baseSpinDurationSeconds = parsedDuration;
        }
    }
    if (spinDurationInput) spinDurationInput.value = baseSpinDurationSeconds;
}

function saveSpinDurationSetting() {
    if (spinDurationInput) {
        let newDuration = parseFloat(spinDurationInput.value);
        if (!isNaN(newDuration) && newDuration >= 1 && newDuration <= 10) {
            baseSpinDurationSeconds = newDuration;
            localStorage.setItem(CONFIG.keys.spinDuration, baseSpinDurationSeconds.toString());
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
    const savedFontFamily = localStorage.getItem(CONFIG.keys.fontFamily);
    wheelFontFamily = (savedFontFamily && webSafeFonts.includes(savedFontFamily)) ? savedFontFamily : "Roboto, sans-serif";

    const savedFontSize = localStorage.getItem(CONFIG.keys.fontSize);
    if (savedFontSize !== null) {
        const parsedSize = parseInt(savedFontSize, 10);
        wheelFontSize = (!isNaN(parsedSize) && parsedSize >= 8 && parsedSize <= 24) ? parsedSize : 16;
    } else {
        wheelFontSize = 16;
    }

    if (fontFamilySelect) fontFamilySelect.value = wheelFontFamily;
    if (fontSizeInput) fontSizeInput.value = wheelFontSize;
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
        if (!isNaN(newFontSize) && newFontSize >= 8 && newFontSize <= 24 && newFontSize !== wheelFontSize) {
            wheelFontSize = newFontSize;
            needsRedraw = true;
        } else {
            fontSizeInput.value = wheelFontSize;
        }
    }
    localStorage.setItem(CONFIG.keys.fontFamily, wheelFontFamily);
    localStorage.setItem(CONFIG.keys.fontSize, wheelFontSize.toString());
    if (needsRedraw && !isSpinning) drawWheel();
}

function generateCustomColorPickers() {
    if (!customColorPickersContainer) return;
    customColorPickersContainer.innerHTML = '';
    for (let i = 0; i < NUM_CUSTOM_COLOR_PICKERS; i++) {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.dataset.index = i;
        colorInput.value = customSegmentColors[i] || '#ffffff';
        if (!customSegmentColors[i]) colorInput.setAttribute('data-is-default', 'true');
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
        if (!isSpinning) drawWheel();
    }
}

function loadCustomColors() {
    const savedColorsString = localStorage.getItem(CONFIG.keys.customColors);
    if (savedColorsString) {
        try {
            const parsedColors = JSON.parse(savedColorsString);
            customSegmentColors = (Array.isArray(parsedColors) && parsedColors.length === NUM_CUSTOM_COLOR_PICKERS) ? parsedColors : new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
        } catch (e) {
            console.error("Error parsing custom colors:", e);
            customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
        }
    } else {
        customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
    }
}

function saveCustomColors() {
    localStorage.setItem(CONFIG.keys.customColors, JSON.stringify(customSegmentColors));
}

function resetCustomColors() {
    if (window.confirm("Are you sure you want to reset all custom segment colors?")) {
        customSegmentColors = new Array(NUM_CUSTOM_COLOR_PICKERS).fill(null);
        saveCustomColors();
        generateCustomColorPickers();
        if (!isSpinning) drawWheel();
        resultDisplay.textContent = "Custom colors reset.";
    }
}

function loadColorTheme() {
    const savedThemeKey = localStorage.getItem(CONFIG.keys.theme);
    currentThemeKey = (savedThemeKey && predefinedColorThemes[savedThemeKey]) ? savedThemeKey : 'classic';
    colors = [...predefinedColorThemes[currentThemeKey]];
}

function saveColorTheme() {
    localStorage.setItem(CONFIG.keys.theme, currentThemeKey);
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
        if (colorThemeSelect) colorThemeSelect.value = themeKey;
        drawWheel();
        saveColorTheme();
    }
}

function toggleAdvancedSettings() {
    if (!advancedSettingsPanel) return;
    const isExpanded = advancedSettingsPanel.classList.toggle('expanded');
    advancedSettingsPanel.classList.toggle('collapsed', !isExpanded);
    localStorage.setItem(CONFIG.keys.settingsPanelOpen, isExpanded.toString());
}

function loadSettingsPanelState() {
    if (!advancedSettingsPanel) return;
    const savedState = localStorage.getItem(CONFIG.keys.settingsPanelOpen);
    if (savedState === 'true') {
        advancedSettingsPanel.classList.add('expanded');
        advancedSettingsPanel.classList.remove('collapsed');
    } else {
        advancedSettingsPanel.classList.add('collapsed');
        advancedSettingsPanel.classList.remove('expanded');
    }
}

// --- Core Item Loading and Saving ---
function loadItemsFromLocalStorage() {
    const storedItemsString = localStorage.getItem(CONFIG.keys.items);
    let loadedItems = [];

    if (storedItemsString) {
        try {
            const parsed = JSON.parse(storedItemsString);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'name' in parsed[0]) {
                loadedItems = parsed.map(item => ({
                    id: item.id || Date.now().toString(36) + Math.random().toString(36).substring(2),
                    name: item.name || "Unnamed",
                    weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : DEFAULT_WEIGHT,
                    customColor: item.customColor || DEFAULT_CUSTOM_COLOR,
                    isVisibleOnWheel: typeof item.isVisibleOnWheel === 'boolean' ? item.isVisibleOnWheel : DEFAULT_IS_VISIBLE
                }));
            }
        } catch (e) {
            console.error("Error parsing items from localStorage:", e);
            localStorage.removeItem(CONFIG.keys.items);
        }
    }

    if (loadedItems.length === 0) {
        // Use the dynamic defaults from the config object
        return CONFIG.defaults.map((name, index) => ({
            id: Date.now().toString(36) + Math.random().toString(36).substring(2) + name.slice(0, 3) + index,
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
        localStorage.setItem(CONFIG.keys.items, JSON.stringify(itemsToSave));
    } else {
        localStorage.removeItem(CONFIG.keys.items);
    }
}

// --- Wheel Drawing and Logic ---
function resizeWheel() {
    if (!wheelAreaContainer || !canvas) return;
    const containerWidth = wheelAreaContainer.clientWidth;
    const isHidden = mainContentWrapper.classList.contains('controls-hidden');
    const size = Math.min(containerWidth, isHidden ? 550 : 500);

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
    return inputText ? inputText.split('\n').map(item => item.trim()).filter(item => item !== "") : [];
}

function updateItemsArrayAndDisplay(sourceEvent = null) {
    const previousItemsJson = JSON.stringify(items);
    let dedupMessage = "";
    let itemsWereModified = false;

    if (!['initial_load', 'shuffle_sort', 'remove_winner', 'import_processed', 'import_processed_empty'].includes(sourceEvent)) {
        const rawItemLines = getItemsFromInput();
        let processedEntries = [];

        rawItemLines.forEach((line, index) => {
            let name = line;
            let weight = DEFAULT_WEIGHT;
            const parts = name.split(':');
            if (parts.length > 1) {
                const potentialWeight = parseFloat(parts[parts.length - 1].trim());
                if (!isNaN(potentialWeight) && potentialWeight > 0) {
                    weight = potentialWeight;
                    name = parts.slice(0, -1).join(':').trim();
                }
            }
            if (name) processedEntries.push({ name, weight, originalLineIndex: index });
        });

        let finalItemsToProcess = processedEntries;
        if (sourceEvent === 'manual_update' || sourceEvent === 'input_spin_update') {
            const nameCounts = {};
            processedEntries.forEach(entry => { nameCounts[entry.name] = (nameCounts[entry.name] || 0) + 1; });
            const duplicateNamesExist = Object.values(nameCounts).some(count => count > 1);

            if (duplicateNamesExist) {
                const numPotentialDuplicates = processedEntries.length - Object.keys(nameCounts).length;
                if (window.confirm(`Found ${numPotentialDuplicates} duplicate name(s). Remove them?`)) {
                    const uniqueNamesFound = new Set();
                    finalItemsToProcess = processedEntries.filter(entry => {
                        if (!uniqueNamesFound.has(entry.name)) {
                            uniqueNamesFound.add(entry.name);
                            return true;
                        }
                        return false;
                    });
                    dedupMessage = `Removed ${numPotentialDuplicates} duplicate(s).`;
                } else {
                    dedupMessage = `Kept duplicate item(s).`;
                }
            }
        }

        items = finalItemsToProcess.map((entry, index) => ({
            id: Date.now().toString(36) + Math.random().toString(36).substring(2) + entry.name.slice(0, 2) + entry.originalLineIndex,
            name: entry.name,
            weight: entry.weight,
            customColor: DEFAULT_CUSTOM_COLOR,
            isVisibleOnWheel: DEFAULT_IS_VISIBLE
        }));
        itemsWereModified = true;
    }

    if (items.length === 0) {
        items = [{ id: PLACEHOLDER_ID, name: "Add Item!", weight: DEFAULT_WEIGHT, customColor: DEFAULT_CUSTOM_COLOR, isVisibleOnWheel: false }];
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

    if (dedupMessage) {
        resultDisplay.textContent = dedupMessage;
    } else if (sourceEvent === 'import_processed') {
        resultDisplay.textContent = "Items imported successfully!";
    } else if (sourceEvent === 'import_processed_empty') {
        resultDisplay.textContent = "Imported file was empty or invalid.";
    } else if (!isSpinning && sourceEvent === 'initial_load') {
        resultDisplay.textContent = "Spin to select!";
    } else if (!isSpinning && !['remove_winner', 'export_success', 'export_fail_empty', 'custom_colors_reset'].includes(sourceEvent)) {
        resultDisplay.textContent = "Wheel updated. Spin to select!";
    }

    if (itemsWereModified || JSON.stringify(items) !== previousItemsJson) {
        saveItemsToLocalStorage();
    }
}

function drawWheel() {
    if (!wheelRadius || !items || !colors || !ctx || canvas.width <= 0 || canvas.height <= 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawableItems = items.filter(item => item.id !== PLACEHOLDER_ID && item.isVisibleOnWheel);

    if (drawableItems.length > 0) {
        const totalWeight = drawableItems.reduce((sum, item) => sum + (item.weight || DEFAULT_WEIGHT), 0);
        ctx.font = `bold ${wheelFontSize}px ${wheelFontFamily}`;
        const innerRadius = Math.max(0, wheelRadius * 0.25);
        let currentSegmentDrawAngle = currentAngle;

        drawableItems.forEach((item, i) => {
            const itemWeight = item.weight || DEFAULT_WEIGHT;
            const arcSizeForThisItem = (totalWeight > 0) ? (itemWeight / totalWeight) * (2 * Math.PI) : (2 * Math.PI) / drawableItems.length;
            const segmentEndAngleRad = currentSegmentDrawAngle + arcSizeForThisItem;

            const originalItemGlobalIndex = items.findIndex(globalItem => globalItem.id === item.id);
            let segmentColor = (originalItemGlobalIndex !== -1 && originalItemGlobalIndex < NUM_CUSTOM_COLOR_PICKERS && customSegmentColors[originalItemGlobalIndex])
                ? customSegmentColors[originalItemGlobalIndex]
                : (item.customColor || colors[i % colors.length]);

            ctx.fillStyle = segmentColor;
            ctx.strokeStyle = innerCircleStrokeColor;
            ctx.lineWidth = (segmentColor === '#FFFFFF' || segmentColor === '#ffffff') ? 1.5 : 1;

            ctx.beginPath();
            ctx.arc(wheelCenterX, wheelCenterY, wheelRadius, currentSegmentDrawAngle, segmentEndAngleRad, false);
            ctx.arc(wheelCenterX, wheelCenterY, innerRadius, segmentEndAngleRad, currentSegmentDrawAngle, true);
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
                while (ctx.measureText(textToDisplay + "...").width > maxTextDisplayWidth && textToDisplay.length > 1) {
                    textToDisplay = textToDisplay.slice(0, -1);
                }
                textToDisplay = (textToDisplay.length < text.length && textToDisplay.length > 0) ? textToDisplay + "..." : (text.slice(0, 1) + "...");
            }
            if (wheelRadius > 10) ctx.fillText(textToDisplay, textXPosition, 0);
            ctx.restore();
            currentSegmentDrawAngle = segmentEndAngleRad;
        });
    } else {
        ctx.beginPath();
        ctx.arc(wheelCenterX, wheelCenterY, wheelRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = predefinedColorThemes[currentThemeKey]?.[0] || '#f0f2f5';
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
    if (wheelOverlay) wheelOverlay.style.display = isSpinning ? 'none' : 'flex';
}

function easeOut(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function rotateWheel() {
    spinTime += 20;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const easedTotalRotationSoFar = easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    currentAngle = (easedTotalRotationSoFar * Math.PI / 180);
    drawWheel();
    requestAnimationFrame(rotateWheel);
}

function startSpin() {
    if (activeTab === 'entries') updateItemsArrayAndDisplay('input_spin_update');
    const spinnableItems = items.filter(item => item.id !== PLACEHOLDER_ID && item.isVisibleOnWheel);
    if (spinnableItems.length === 0 || isSpinning) {
        if(spinnableItems.length === 0) resultDisplay.textContent = "Add items to spin!";
        return;
    }

    isSpinning = true;
    if (wheelOverlay) wheelOverlay.style.display = 'none';
    if (wheelAreaContainer) wheelAreaContainer.classList.add('spinning');
    spinButton.disabled = true; updateButton.disabled = true; itemsInput.disabled = true;
    shuffleButton.disabled = true; sortButton.disabled = true;
    if (importButton) importButton.disabled = true;
    if (exportButton) exportButton.disabled = true;
    resultDisplay.textContent = "Spinning...";

    if (soundsEnabled && spinSound) spinSound.play().catch(e => console.warn("Spin sound failed:", e));

    spinTimeTotal = (baseSpinDurationSeconds * 1000) + (Math.random() * 2000);
    const totalWeightForSpin = spinnableItems.reduce((sum, item) => sum + (item.weight || DEFAULT_WEIGHT), 0);
    if (totalWeightForSpin <= 0) {
        stopRotateWheel(true, "Invalid weights. All items have 0 or invalid weight.");
        return;
    }

    const randomWeightPoint = Math.random() * totalWeightForSpin;
    let cumulativeWeight = 0;
    let winningItemForSpin = spinnableItems.find(item => {
        cumulativeWeight += (item.weight || DEFAULT_WEIGHT);
        return randomWeightPoint <= cumulativeWeight;
    }) || spinnableItems[spinnableItems.length - 1];

    currentWinner = winningItemForSpin.name;

    let startAngleOfWinningSegmentDeg = 0;
    for (const item of spinnableItems) {
        if (item.id === winningItemForSpin.id) break;
        startAngleOfWinningSegmentDeg += ((item.weight || DEFAULT_WEIGHT) / totalWeightForSpin) * 360;
    }
    const angleOfWinningSegmentDeg = ((winningItemForSpin.weight || DEFAULT_WEIGHT) / totalWeightForSpin) * 360;
    
    const pointerRefAngleDeg = (window.innerWidth <= 768 && !mainContentWrapper.classList.contains('controls-hidden')) ? 270 : 0;
    const randomSegmentOffsetRatio = Math.random() * 0.4 + 0.3; // between 0.3 and 0.7
    const offsetIntoSegmentDeg = angleOfWinningSegmentDeg * randomSegmentOffsetRatio;
    const targetDegree = (pointerRefAngleDeg - (startAngleOfWinningSegmentDeg + offsetIntoSegmentDeg) + 360) % 360;
    
    const currentVisualAngleDeg = (currentAngle * 180 / Math.PI) % 360;
    const netRotationToTarget = (targetDegree - currentVisualAngleDeg + 360) % 360;
    spinAngleStart = (Math.floor(Math.random() * 2) + 4) * 360 + netRotationToTarget;
    
    spinTime = 0;
    requestAnimationFrame(rotateWheel);
}

function stopRotateWheel(error = false, errorMessage = "") {
    isSpinning = false;
    if (spinSound) spinSound.pause();
    if (!error && soundsEnabled && winSound) winSound.play().catch(e => console.warn("Win sound failed:", e));

    if (wheelOverlay && items.filter(item => item.id !== PLACEHOLDER_ID).length > 0) wheelOverlay.style.display = 'flex';
    if (wheelAreaContainer) wheelAreaContainer.classList.remove('spinning');
    spinButton.disabled = false; updateButton.disabled = false; itemsInput.disabled = false;
    switchTab(activeTab);

    if (error) {
        resultDisplay.textContent = errorMessage;
        return;
    }

    if (currentWinner) {
        resultsList.push(currentWinner);
        updateCounts();
        if (activeTab === 'results') resultsListArea.textContent = resultsList.join('\n');
        showModal(currentWinner);
        triggerCelebration();
    } else {
        resultDisplay.textContent = "Error determining result. Try again!";
    }
}

function showModal(winnerName) {
    modalWinnerName.textContent = winnerName;
    winnerModalOverlay.classList.add('active');
}

function hideModal() {
    winnerModalOverlay.classList.remove('active');
    const spinnableItems = items.filter(item => item.id !== PLACEHOLDER_ID);
    resultDisplay.textContent = spinnableItems.length > 0 ? "Spin again or update list!" : "Add items to the list to spin!";
}

function triggerCelebration() {
    const confettiCount = 50;
    const confettiColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
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
        resultDisplay.textContent = "Nothing to export.";
        return;
    }
    const textContent = itemsToExport.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lucky_wheel_items.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    resultDisplay.textContent = "Items exported successfully!";
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const importedItemLines = e.target.result.split('\n').map(line => line.trim()).filter(Boolean);
        if (importedItemLines.length > 0) {
            items = importedItemLines.map((line, index) => {
                let name = line, weight = DEFAULT_WEIGHT;
                const parts = line.split(':');
                if (parts.length > 1) {
                    const potentialWeight = parseFloat(parts[parts.length - 1].trim());
                    if (!isNaN(potentialWeight) && potentialWeight > 0) {
                        weight = potentialWeight;
                        name = parts.slice(0, -1).join(':').trim();
                    }
                }
                return { id: Date.now().toString(36) + Math.random().toString(36).substring(2) + name.slice(0, 3) + index, name, weight, customColor: DEFAULT_CUSTOM_COLOR, isVisibleOnWheel: DEFAULT_IS_VISIBLE };
            });
            updateItemsArrayAndDisplay('import_processed');
        } else {
            items = [{ id: PLACEHOLDER_ID, name: "Add Item!", weight: DEFAULT_WEIGHT, customColor: DEFAULT_CUSTOM_COLOR, isVisibleOnWheel: false }];
            updateItemsArrayAndDisplay('import_processed_empty');
        }
        fileInput.value = '';
    };
    reader.onerror = () => { resultDisplay.textContent = "Error reading file."; fileInput.value = ''; };
    reader.readAsText(file);
}

function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    loadColorTheme();
    populateThemeSelector();
    loadSettingsPanelState();
    loadSoundSetting();
    loadSpinDurationSetting();
    loadFontSettings();
    populateFontSelector();
    loadCustomColors();
    generateCustomColorPickers();
    items = loadItemsFromLocalStorage(); // This now loads page-specific items
    resizeWheel();
    switchTab('entries');
    updateItemsArrayAndDisplay('initial_load');
});

window.addEventListener('resize', () => debounce(resizeWheel, 150));
if (wheelOverlay) wheelOverlay.addEventListener('click', () => { playClickSound(); startSpin(); });
entriesTabButton.addEventListener('click', () => switchTab('entries'));
resultsTabButton.addEventListener('click', () => switchTab('results'));
hideControlsCheckbox.addEventListener('change', function() {
    mainContentWrapper.classList.toggle('controls-hidden', this.checked);
    requestAnimationFrame(() => setTimeout(resizeWheel, 50));
});
showControlsButton.addEventListener('click', () => {
    hideControlsCheckbox.checked = false;
    hideControlsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
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
updateButton.addEventListener('click', () => updateItemsArrayAndDisplay('manual_update'));
spinButton.addEventListener('click', () => { playClickSound(); startSpin(); });
if (exportButton) exportButton.addEventListener('click', exportItems);
if (importButton) importButton.addEventListener('click', () => fileInput.click());
if (fileInput) fileInput.addEventListener('change', handleFileImport);
if (colorThemeSelect) colorThemeSelect.addEventListener('change', (e) => applyColorTheme(e.target.value));
if (advancedSettingsButton) advancedSettingsButton.addEventListener('click', toggleAdvancedSettings);
if (soundToggleCheckbox) soundToggleCheckbox.addEventListener('change', saveSoundSetting);
if (spinDurationInput) spinDurationInput.addEventListener('change', saveSpinDurationSetting);
if (fontFamilySelect) fontFamilySelect.addEventListener('change', saveFontSettings);
if (fontSizeInput) fontSizeInput.addEventListener('change', saveFontSettings);
if (resetCustomColorsButton) resetCustomColorsButton.addEventListener('click', resetCustomColors);
if (modalCloseButton) modalCloseButton.addEventListener('click', hideModal);
if (winnerModalOverlay) winnerModalOverlay.addEventListener('click', (e) => { if (e.target === winnerModalOverlay) hideModal(); });
if (modalRemoveButton) {
    modalRemoveButton.addEventListener('click', () => {
        const winnerIndex = items.findIndex(item => item.name === currentWinner && item.id !== PLACEHOLDER_ID);
        if (winnerIndex > -1) {
            const removedItemName = items[winnerIndex].name;
            items.splice(winnerIndex, 1);
            updateItemsArrayAndDisplay('remove_winner');
            resultDisplay.textContent = `"${removedItemName}" removed. Spin again!`;
        }
        hideModal();
    });
}

//Navbar Toggler Script
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.getElementById('navbarIndustrialNav');
if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', () => {
        navbarCollapse.classList.toggle('show');
        navbarToggler.setAttribute('aria-expanded', navbarCollapse.classList.contains('show'));
    });
    document.addEventListener('click', (event) => {
        const isClickInsideNavbar = navbarToggler.contains(event.target) || navbarCollapse.contains(event.target);
        if (!isClickInsideNavbar && navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
        }
    });
}