/**
 * UI TRANSLATION DICTIONARY
 * Static strings for the interface (Buttons, Labels, Headers).
 * Used by LanguageManager.getText(key, UI_TEXT).
 */

export const UI_TEXT = {
    // --- Header ---
    ui_title: { en: "Card Forge", es: "Forja de Cartas" },
    ui_subtitle: { en: "Universal TCG Generator", es: "Generador Universal de TCG" },
    ui_btn_config: { en: "⚙️ Config", es: "⚙️ Config" },
    ui_btn_lang: { en: "🇪🇸 ES", es: "🇺🇸 EN" }, // Toggle button label

    // --- Main Editor Inputs ---
    ui_label_name: { en: "Name", es: "Nombre" },
    ui_placeholder_name: { en: "Card Name", es: "Nombre de Carta" },
    
    ui_label_type: { en: "Type", es: "Tipo" },
    ui_type_minion: { en: "Minion", es: "Esbirro" },
    ui_type_spell: { en: "Spell", es: "Hechizo" },
    ui_type_weapon: { en: "Weapon", es: "Arma" },

    ui_label_rarity: { en: "Rarity", es: "Rareza" },
    ui_label_tribe: { en: "Tribe / Faction", es: "Tribu / Facción" },
    
    ui_label_art: { en: "Card Art", es: "Arte de Carta" },
    
    ui_label_attack: { en: "Attack", es: "Ataque" },
    ui_label_health: { en: "Health", es: "Salud" },
    ui_label_durability: { en: "Durability", es: "Durabilidad" },

    ui_label_keywords: { en: "Keywords", es: "Palabras Clave" },
    ui_label_abilities: { en: "Abilities", es: "Habilidades" },
    ui_btn_add_ability: { en: "+ Add New Ability", es: "+ Añadir Habilidad" },

    ui_label_flavor: { en: "Flavor Text", es: "Texto de Ambientación" },
    ui_placeholder_flavor: { en: "Lore text...", es: "Historia..." },

    // --- Preview & Export ---
    ui_btn_download_img: { en: "Download Image", es: "Descargar Imagen" },
    ui_btn_save_json: { en: "Save JSON", es: "Guardar JSON" },
    
    ui_panel_balance: { en: "Balance Report", es: "Reporte de Balance" },
    ui_log_default: { en: "Adjust stats...", es: "Ajusta estadísticas..." },
    
    // --- Balance Report Log ---
    ui_log_mana: { en: "Mana Cost", es: "Coste de Maná" },
    ui_log_vp: { en: "Total VP", es: "VP Total" },
    ui_log_base: { en: "Base", es: "Base" },
    ui_log_stats: { en: "Stats", es: "Estadísticas" },
    ui_log_keywords: { en: "Keywords", es: "Palabras Clave" },
    ui_log_abilities: { en: "Abilities", es: "Habilidades" },
    ui_log_discount: { en: "Rarity Discount", es: "Descuento Rareza" },
    ui_log_typemod: { en: "Type Mod", es: "Mod. de Tipo" },
    ui_log_capped: { en: "Cost capped at", es: "Coste limitado a" },

    // --- Ability Modal ---
    ui_modal_ab_title: { en: "Create Ability", es: "Crear Habilidad" },
    ui_ab_flavor_label: { en: "Flavor Name (Optional)", es: "Nombre Temático (Opcional)" },
    ui_ab_flavor_placeholder: { en: "e.g. Fireball", es: "ej. Bola de Fuego" },
    ui_ab_flavor_hint: { en: "Appears in bold at the start.", es: "Aparece en negrita al inicio." },
    
    ui_ab_step_1: { en: "1. Trigger (When?)", es: "1. Disparador (¿Cuándo?)" },
    ui_ab_step_2: { en: "2. Condition (If?)", es: "2. Condición (¿Si?)" },
    ui_ab_step_3: { en: "3. Effect (Do what?)", es: "3. Efecto (¿Qué hace?)" },
    ui_ab_step_4: { en: "4. Target (To whom?)", es: "4. Objetivo (¿A quién?)" },
    
    ui_ab_opt_none: { en: "No Condition", es: "Sin Condición" },
    ui_ab_grp_generic: { en: "Generic", es: "Genérico" },
    ui_ab_grp_tribal: { en: "Tribal", es: "Tribal" },
    
    ui_ab_preview_label: { en: "Text Preview:", es: "Vista Previa:" },
    ui_btn_confirm_ab: { en: "Add Ability", es: "Añadir Habilidad" },

    // --- Settings Modal ---
    ui_modal_settings_title: { en: "Game Configuration", es: "Configuración del Juego" },
    ui_settings_presets: { en: "Presets", es: "Preajustes" },
    ui_btn_reset_midgard: { en: "Reset to Midgard TCG", es: "Reiniciar a Midgard TCG" },
    
    ui_settings_tribes: { en: "Tribe Manager", es: "Gestor de Tribus" },
    ui_placeholder_new_tribe: { en: "New Tribe Name", es: "Nombre de Nueva Tribu" },
    ui_btn_add_tribe: { en: "Add", es: "Añadir" },
    ui_btn_done: { en: "Done", es: "Listo" }
};