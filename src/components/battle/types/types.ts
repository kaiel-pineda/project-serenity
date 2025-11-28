// src/components/battle/types/types.ts
export type Stat = "attack" | "defense";

export type MoveEffectType = "instantDamage" | "instantHeal" | "damageOverTime" | "statModifier";

export type EffectTarget = "self" | "enemy";

export interface MoveEffect {
	type: MoveEffectType;
	target: EffectTarget;
	power?: number;
	duration?: number;
	stat?: Stat;
	amount?: number;
}

export interface Move {
	id: string;
	name: string;
	description: string;
	critChance: number;
	effects: MoveEffect[];
}

export interface CharacterTemplate {
	id: string;
	name: string;
	maxHp: number;
	attack: number;
	defense: number;
	speed: number;
	moves: Move[];
	// Single sprite - flipped for player/enemy
	sprite: string;
}

export type StatusType = "damageOverTime" | "statModifier";

export interface StatusInstance {
	type: StatusType;
	sourceMoveId: string;
	label: string;
	stat?: Stat;
	amount?: number;
	power?: number;
	remainingTurns: number;
}

export interface BattleCharacter extends CharacterTemplate {
	currentHp: number;
	statuses: StatusInstance[];
}
