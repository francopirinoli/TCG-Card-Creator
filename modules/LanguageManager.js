import { UI_TEXT } from '../data/translations.js';

/**
 * LANGUAGE MANAGER
 * Handles localization state, string lookup, and DOM updates.
 */
class LanguageManager {
    constructor() {
        // Load saved preference or default to English
        this.currentLang = localStorage.getItem('card_forge_lang') || 'en';
        this.subscribers = [];
    }

    /**
     * Get the current language code ('en' or 'es').
     */
    get code() {
        return this.currentLang;
    }

    /**
     * Switch language, save preference, and update the UI.
     * @param {string} langCode - 'en' or 'es'
     */
    setLanguage(langCode) {
        if (langCode !== 'en' && langCode !== 'es') return;
        
        this.currentLang = langCode;
        localStorage.setItem('card_forge_lang', langCode);
        
        // 1. Update static HTML elements
        this.translatePage();

        // 2. Notify subscribers (app.js, AbilityBuilder) to re-render dynamic content
        this.notify();
    }

    /**
     * Toggles between English and Spanish.
     */
    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(newLang);
        return newLang;
    }

    /**
     * Scans the document for [data-i18n] and [data-i18n-placeholder] attributes
     * and updates them with text from UI_TEXT.
     */
    translatePage() {
        // 1. Text Content
        const textElements = document.querySelectorAll('[data-i18n]');
        textElements.forEach(el => {
            const key = el.dataset.i18n;
            if (UI_TEXT[key]) {
                el.textContent = UI_TEXT[key][this.currentLang] || UI_TEXT[key]['en'];
            }
        });

        // 2. Placeholders (Inputs/Textareas)
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (UI_TEXT[key]) {
                el.placeholder = UI_TEXT[key][this.currentLang] || UI_TEXT[key]['en'];
            }
        });
    }

    /**
     * Looks up a static UI string from the dictionary.
     * Used for dynamic JS alerts or logs.
     * @param {string} key - e.g. "ui_log_mana"
     */
    getText(key) {
        if (!UI_TEXT[key]) return `[${key}]`;
        return UI_TEXT[key][this.currentLang] || UI_TEXT[key]['en'];
    }

    /**
     * Extracts text from a Data Object containing {en, es}.
     * Used for Abilities, Tribes, Keywords data files.
     * @param {Object} dataObj - e.g. { en: "Taunt", es: "Provocar" }
     */
    translate(dataObj) {
        if (!dataObj) return "";
        // If it's just a string, return it as-is
        if (typeof dataObj === 'string') return dataObj;
        
        // Try current language, fallback to English, fallback to first available key
        return dataObj[this.currentLang] || dataObj['en'] || Object.values(dataObj)[0] || "";
    }

    // --- Observer Pattern ---
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        this.subscribers.forEach(cb => cb(this.currentLang));
    }
}

// Export Singleton
export const lang = new LanguageManager();