import { createPortal } from "react-dom";
import {
  cloneElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ModalContext, useModalContext } from "../hooks/useModalContext";

/* ------------------------------------------------------------------ */
/* Modal Root */
/* ------------------------------------------------------------------ */

type ModalProps = {
  children: ReactNode;
};

function Modal({ children }: ModalProps) {
  const [openName, setOpenName] = useState("");

  const open = (name: string) => setOpenName(name);
  const close = () => setOpenName("");

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Modal.Window */
/* ------------------------------------------------------------------ */

type WindowProps = {
  children: ReactElement<{ onCloseModal?: () => void }>;
  name: string;
};

function Window({ children, name }: WindowProps) {
  const [show, setShow] = useState(false);
  const { openName, close } = useModalContext();

  const display = openName === name;

  useEffect(() => {
    if (display) {
      // Slight delay to trigger animation
      setShow(true);
    } else {
      // Start fade-out animation, then hide
      setShow(false);
    }
  }, [display]);

  if (!display && !show) return null; // Not visible at all

  return createPortal(
    <div
      className={`fixed inset-0 z-1000 bg-black/40 ${show ? "opacity-100" : "opacity-0"} transition-all delay-300 duration-150 ease-out`}
    >
      <div
        className={`relative ${show ? "opacity-100" : "opacity-0"} top-1/2 left-1/2 w-fit -translate-x-1/2 -translate-y-1/2 rounded-xl bg-(--bg-modal) px-16 py-12 shadow-xl transition-all delay-300 duration-150 ease-out`}
      >
        {!display ? null : cloneElement(children, { onCloseModal: close })}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Compound component exports */
/* ------------------------------------------------------------------ */

Modal.Window = Window;

export default Modal;
