import { create } from "zustand";

interface useStoreModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useStoreModal = create<useStoreModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
