export interface StopItemData {
	id: number;
	text: string;
	status: boolean;
	isEditing: boolean;
	note?: string;
	originalText?: string;
}

export type NewStopItem = {
	id: number;
	text: string;
	status: boolean;
	isEditing: false;
	note?: string;
};

export type StopItemUpdate = Partial<Omit<StopItemData, "id">>;

export function isItemEditing(item: StopItemData): boolean {
	return item.isEditing === true;
}

export function hasOriginalText(item: StopItemData): item is StopItemData & { originalText: string } {
	return typeof item.originalText === "string";
}
