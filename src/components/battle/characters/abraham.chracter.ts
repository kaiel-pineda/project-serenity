// src/components/battle/characters/abraham.character.ts
import type { CharacterTemplate } from "../types/types";

const abraham: CharacterTemplate = {
	id: "abraham",
	name: "Abraham",
	maxHp: 80,
	attack: 20,
	defense: 10,
	speed: 90,
	// Single sprite path - flipped for player
	sprite: "/public/characters/abraham.png",
	moves: [
		{
			id: "thunder-jolt",
			name: "Thunder Jolt",
			description: "Quick hit that scales with Attack.",
			critChance: 0.15,
			effects: [
				{
					type: "instantDamage",
					target: "enemy",
					power: 18,
				},
			],
		},
		{
			id: "static-field",
			name: "Static Field",
			description: "Applies a damaging field for a few turns (DoT).",
			critChance: 0.1,
			effects: [
				{
					type: "damageOverTime",
					target: "enemy",
					power: 4,
					duration: 3,
				},
			],
		},
		{
			id: "focus",
			name: "Focus",
			description: "Recover some HP.",
			critChance: 0,
			effects: [
				{
					type: "instantHeal",
					target: "self",
					power: 14,
				},
			],
		},
		{
			id: "armor-crack",
			name: "Armor Crack",
			description: "Small hit that lowers enemy defense for a while.",
			critChance: 0.2,
			effects: [
				{
					type: "instantDamage",
					target: "enemy",
					power: 10,
				},
				{
					type: "statModifier",
					target: "enemy",
					stat: "defense",
					amount: -4,
					duration: 2,
				},
			],
		},
	],
};

export default abraham;
