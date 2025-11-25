import type { StopItemData } from "../types/types";

const STORAGE_KEYS = {
	PICKUP_LIST: "pickupList",
	DELIVERY_LIST: "deliveryList",
} as const;

class LocalStorageService {
	private isAvailable(): boolean {
		try {
			const test = "__localStorage_test__";
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	}

	private getItem<T>(key: string): T | null {
		if (!this.isAvailable()) {
			console.warn("localStorage is not available");
			return null;
		}

		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : null;
		} catch (error) {
			console.error(`Error reading from localStorage (${key}):`, error);
			return null;
		}
	}

	private setItem<T>(key: string, value: T): boolean {
		if (!this.isAvailable()) {
			console.warn("localStorage is not available");
			return false;
		}

		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			if (error instanceof Error && error.name === "QuotaExceededError") {
				console.error("localStorage quota exceeded");
			} else {
				console.error(`Error writing to localStorage (${key}):`, error);
			}
			return false;
		}
	}

	getPickupList(): StopItemData[] {
		return this.getItem<StopItemData[]>(STORAGE_KEYS.PICKUP_LIST) ?? [];
	}

	getDeliveryList(): StopItemData[] {
		return this.getItem<StopItemData[]>(STORAGE_KEYS.DELIVERY_LIST) ?? [];
	}

	savePickupList(list: StopItemData[]): boolean {
		return this.setItem(STORAGE_KEYS.PICKUP_LIST, list);
	}

	saveDeliveryList(list: StopItemData[]): boolean {
		return this.setItem(STORAGE_KEYS.DELIVERY_LIST, list);
	}

	saveBothLists(pickupList: StopItemData[], deliveryList: StopItemData[]): boolean {
		const pickupSuccess = this.savePickupList(pickupList);
		const deliverySuccess = this.saveDeliveryList(deliveryList);
		return pickupSuccess && deliverySuccess;
	}

	clear(): void {
		if (!this.isAvailable()) return;

		try {
			localStorage.removeItem(STORAGE_KEYS.PICKUP_LIST);
			localStorage.removeItem(STORAGE_KEYS.DELIVERY_LIST);
		} catch (error) {
			console.error("Error clearing localStorage:", error);
		}
	}
}

export const localStorageService = new LocalStorageService();
export { STORAGE_KEYS };
