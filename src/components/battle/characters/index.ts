// src/components/battle/characters/index.ts
import type { BattleCharacter, CharacterTemplate } from "../types/types";
import abraham from "./abraham.chracter";
import andres from "./andres.character";

const templates: CharacterTemplate[] = [abraham, andres];

export const roster = templates;

// Create a fresh battle instance of a character, safe to mutate.
export function getCharacter(id: string): BattleCharacter {
	const base = templates.find((c) => c.id === id);
	if (!base) {
		throw new Error(`Character with id "${id}" not found.`);
	}

	return {
		...base,
		currentHp: base.maxHp,
		statuses: [],
	};
}
