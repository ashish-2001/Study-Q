import React, { forwardRef } from "react";

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(
    (
        { children, onClose },
        ref
    ) => {
        return <dialog ref={ref}>{children}</dialog>;
    }
);

export default Modal;