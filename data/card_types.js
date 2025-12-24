export const CARD_TYPES = [
    {
        id: "minion",
        name: { en: "Minion", es: "Esbirro" },
        hasStats: true,
        statLabels: { atk: "Attack", hp: "Health" },
        description: { en: "A creature that fights on the board.", es: "Una criatura que lucha en el tablero." }
    },
    {
        id: "spell",
        name: { en: "Spell", es: "Hechizo" },
        hasStats: false, // Hides the sliders
        description: { en: "A one-time effect.", es: "Un efecto de un solo uso." }
    },
    {
        id: "weapon",
        name: { en: "Weapon", es: "Arma" },
        hasStats: true,
        statLabels: { atk: "Attack", hp: "Durability" }, // Renames Health to Durability
        description: { en: "Equip your hero to attack.", es: "Equipa a tu héroe para atacar." }
    }
];