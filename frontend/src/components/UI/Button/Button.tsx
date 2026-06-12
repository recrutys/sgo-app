import {ComponentProps} from "react";
import {useFormStatus} from "react-dom";
import './Button.scss'

interface ButtonProps extends ComponentProps<"button">
{
    isLoading?: boolean;
    loadingText?: string;
}

export default function Button({
    children,
    className = "",
    isLoading = false,
    loadingText = "Загрузка...",
    disabled,
    ...props
}: ButtonProps)
{
    // Хук автоматически следит за родительской формой и возвращает true, если она отправляется
    const {pending} = useFormStatus();

    // Кнопка грузится, если либо пропс isLoading принудительно true, либо форма в процессе (pending)
    const isCurrentlyLoading = isLoading || pending;

    return (
        <button
            className={`ui-button ${isCurrentlyLoading ? "ui-button--loading" : ""} ${className}`}
            disabled={disabled || isCurrentlyLoading}
            {...props}
        >
            {isCurrentlyLoading ? loadingText : children}
        </button>
    );
}