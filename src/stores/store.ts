import { writable, derived, get } from "svelte/store";
import type { StopItemData } from "../types/types";
import { localStorageService } from "../utilities/localStorageService";

export const isPickups = writable(false);

const initialPickupList = localStorageService.getPickupList().map((item) => ({
	...item,
	isEditing: false,
	originalText: undefined,
}));

const initialDeliveryList = localStorageService.getDeliveryList().map((item) => ({
	...item,
	isEditing: false,
	originalText: undefined,
}));

export const pickupList = writable<StopItemData[]>(initialPickupList);
export const deliveryList = writable<StopItemData[]>(initialDeliveryList);

export const currentList = derived([isPickups, pickupList, deliveryList], ([$isPickups, $pickupList, $deliveryList]) => {
	return $isPickups ? $pickupList : $deliveryList;
});

export const remainingCount = derived(currentList, ($currentList) => {
	return $currentList.filter((item) => !item.status).length;
});

export const listActions = {
	updateCurrentList(updatedList: StopItemData[]) {
		const isPickup = get(isPickups);

		if (isPickup) {
			pickupList.set(updatedList);
			localStorageService.savePickupList(updatedList);
		} else {
			deliveryList.set(updatedList);
			localStorageService.saveDeliveryList(updatedList);
		}
	},

	updateItem(itemId: number, updatedFields: Partial<StopItemData>) {
		const current = get(currentList);
		const updatedList = current.map((item) => {
			if (item.id !== itemId) return item;

			const updated = { ...item, ...updatedFields };

			if (updated.isEditing === false && updatedFields.isEditing === false) {
				delete updated.originalText;
			}

			return updated;
		});
		this.updateCurrentList(updatedList);
	},

	addItem(newItem: StopItemData) {
		const current = get(currentList);
		this.updateCurrentList([...current, newItem]);
	},

	removeItem(itemId: number) {
		const current = get(currentList);
		const updatedList = current.filter((item) => item.id !== itemId);
		this.updateCurrentList(updatedList);
	},

	clearCurrentList() {
		this.updateCurrentList([]);
	},

	getItem(itemId: number): StopItemData | undefined {
		const current = get(currentList);
		return current.find((item) => item.id === itemId);
	},

	isDuplicate(text: string, excludeId?: number): boolean {
		const current = get(currentList);
		const normalizedText = text.trim().toLowerCase();

		return current.some((item) => {
			if (excludeId !== undefined && item.id === excludeId) {
				return false;
			}

			return item.text.toLowerCase() === normalizedText;
		});
	},

	saveToStorage() {
		const pickup = get(pickupList);
		const delivery = get(deliveryList);
		localStorageService.saveBothLists(pickup, delivery);
	},
};
