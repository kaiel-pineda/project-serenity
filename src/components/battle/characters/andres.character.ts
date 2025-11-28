// src/components/battle/characters/andres.character.ts
import type { CharacterTemplate } from "../types/types";

const andres: CharacterTemplate = {
	id: "andres",
	name: "Andres",
	maxHp: 85,
	attack: 18,
	defense: 12,
	speed: 60,
	// Single sprite path - flipped for player
	sprite: "/public/characters/andres.png",
	moves: [
		{
			id: "ember",
			name: "Ember",
			description: "Basic fire hit.",
			critChance: 0.1,
			effects: [
				{
					type: "instantDamage",
					target: "enemy",
					power: 16,
				},
			],
		},
		{
			id: "flame-wrap",
			name: "Flame Wrap",
			description: "Trap the foe in flames (DoT).",
			critChance: 0.15,
			effects: [
				{
					type: "damageOverTime",
					target: "enemy",
					power: 5,
					duration: 3,
				},
			],
		},
		{
			id: "guard-up",
			name: "Guard Up",
			description: "Boost your defense for a while.",
			critChance: 0,
			effects: [
				{
					type: "statModifier",
					target: "self",
					stat: "defense",
					amount: 4,
					duration: 3,
				},
			],
		},
		{
			id: "scratch",
			name: "Scratch",
			description: "Quick physical strike.",
			critChance: 0.05,
			effects: [
				{
					type: "instantDamage",
					target: "enemy",
					power: 12,
				},
			],
		},
	],
};

export default andres;
