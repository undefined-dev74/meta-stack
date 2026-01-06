import { create } from 'zustand';

export interface ConfirmProps {
  isOpened: boolean;
  message: string;
  description?: string;
  submitText?: string;
  onConfirm: () => void;
}

interface ModalStore {
  confirm: ConfirmProps;
  setConfirm: (confirm: ConfirmProps) => void;

  isConfirming: boolean;
  setConfirming: (isConfirming: boolean) => void;
}

export const useModalStore = create<ModalStore>()((set) => ({
  confirm: {
    isOpened: false,
    message: '',
    description: '',
    submitText: 'Confirm',
    onConfirm: () => {},
  },

  setConfirm: (confirm: ConfirmProps) => set({ confirm }),

  isConfirming: false,
  setConfirming: (isConfirming: boolean) => set({ isConfirming }),
}));