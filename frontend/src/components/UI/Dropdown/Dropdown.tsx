import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import "./Dropdown.scss";

interface DropdownItem
{
    label?: string;
    href?: string;
    icon?: React.ReactNode;
    danger?: boolean;
    divider?: boolean;
    onClick?: () => void;
}

interface DropdownProps
{
    trigger: (open: boolean) => React.ReactNode;
    items: DropdownItem[];
}

export default function Dropdown({trigger, items}: DropdownProps)
{
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        const handleClickOutside = (e: MouseEvent) =>
        {
            if (ref.current && !ref.current.contains(e.target as Node))
            {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            className="dropdown"
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <div onClick={() => setOpen((prev) => !prev)}>
                {trigger(open)}
            </div>

            {open && (
                <div className="dropdown__menu">
                    {items.map((item, idx) =>
                    {
                        if (item.divider)
                        {
                            return <div key={idx} className="dropdown__divider" />;
                        }

                        const className = `dropdown__item${item.danger ? " dropdown__item--danger" : ""}`;

                        if (item.href)
                        {
                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className={className}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.icon && item.icon}
                                    {item.label}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={idx}
                                className={className}
                                onClick={() =>
                                {
                                    item.onClick?.();
                                    setOpen(false);
                                }}
                            >
                                {item.icon && item.icon}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}