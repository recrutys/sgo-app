import {ComponentProps} from "react";
import './InputBox.scss'

interface InputProps extends ComponentProps<"input">
{
    label: React.ReactNode;
}

export default function InputBox({
    label,
    className = "",
    id,
    ...props
}: InputProps)
{
    const inputId = id || (typeof label === "string" ? label : undefined);

    return (
        <div className="ui-input">
            <label htmlFor={inputId} className="ui-input__label">
                {label}
            </label>
            <input
                id={inputId}
                className={`ui-input__field ${className}`}
                {...props} // Сюда летят type, placeholder, value, onChange, disabled
            />
        </div>
    );
}