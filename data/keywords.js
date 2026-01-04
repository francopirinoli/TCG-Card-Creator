// Cost is in Value Points (2 VP = 1 Mana)
export const KEYWORDS = [
    { 
        id: 'taunt', 
        name: { en: 'Taunt', es: 'Provocar' }, 
        cost: 1.0, 
        description: { en: 'Enemies must attack this minion.', es: 'Los enemigos deben atacar a este esbirro.' } 
    },
    { 
        id: 'divine_shield', 
        name: { en: 'Divine Shield', es: 'Escudo Divino' }, 
        cost: 2.5, 
        description: { en: 'Ignore the first damage.', es: 'Ignora el primer daño recibido.' } 
    },
    { 
        id: 'charge', 
        name: { en: 'Charge', es: 'Carga' }, 
        cost: 3.0, 
        description: { en: 'Can attack immediately.', es: 'Puede atacar inmediatamente.' } 
    },
    { 
        id: 'rush', 
        name: { en: 'Rush', es: 'Acometida' }, 
        cost: 2.0, 
        description: { en: 'Can attack minions immediately.', es: 'Puede atacar a esbirros inmediatamente.' } 
    },
    { 
        id: 'stealth', 
        name: { en: 'Stealth', es: 'Sigilo' }, 
        cost: 1.5, 
        description: { en: 'Untargetable until it attacks.', es: 'No puede ser objetivo hasta que ataque.' } 
    },
    { 
        id: 'windfury', 
        name: { en: 'Windfury', es: 'Viento Furioso' }, 
        cost: 3.0, 
        description: { en: 'Attacks twice per turn.', es: 'Ataca dos veces por turno.' } 
    },
    { 
        id: 'poisonous', 
        name: { en: 'Poisonous', es: 'Venenoso' }, 
        cost: 4.0, 
        description: { en: 'Destroy any minion damaged by this.', es: 'Destruye cualquier esbirro dañado por esto.' } 
    },
    { 
        id: 'lifesteal', 
        name: { en: 'Lifesteal', es: 'Robo de Vida' }, 
        cost: 2.0, 
        description: { en: 'Damage dealt heals your hero.', es: 'El daño infligido cura a tu héroe.' } 
    },
    { 
        id: 'reborn', 
        name: { en: 'Reborn', es: 'Renacer' }, 
        cost: 2.5, 
        description: { en: 'Resurrects with 1 Health when dead.', es: 'Resucita con 1 Salud al morir.' } 
    }
];