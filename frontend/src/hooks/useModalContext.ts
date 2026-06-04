import { createContext, useContext } from "react";

type ModalContextType = {
  openName: string;
  open: (name: string) => void;
  close: () => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used inside <Modal>");
  }
  return context;
}
