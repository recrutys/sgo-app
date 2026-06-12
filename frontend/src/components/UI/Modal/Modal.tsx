import {useEffect} from "react";
import "./Modal.scss";

interface ModalProps
{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({isOpen, onClose, title, children}: ModalProps)
{
    // Блокируем скролл страницы, когда модалка открыта
    useEffect(() =>
    {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () =>
        {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // Закрытие по Escape
    useEffect(() =>
    {
        const handleEsc = (e: KeyboardEvent) =>
        {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}