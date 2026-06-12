"use client";

import {useTelegramConnect} from "@/hooks/useTelegramConnect";
import {useSearchParams} from "next/navigation";

import './TelegramConnect.scss';
import Button from "@/components/UI/Button/Button";

export default function TelegramConnectComponentPage()
{
    const {
        tgStatus,
        isLoading,
        isConfirming,
        isDisconnecting,
        handleConfirm,
        handleDisconnect
    } = useTelegramConnect();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    if (isLoading)
    {
        return (
            <div className="block">
                <div className="block-container">
                    <div className="block-row">
                        Загрузка страницы...
                    </div>
                </div>
            </div>
        );
    }

    if (token)
    {
        return (
            <div className="block tg">
                <div className="block-container tg-container">
                    <div className="block-row tg-card">
                        <div className="tg-status-badge tg-status-badge--disconnected">Подтверждение</div>
                        <p className="tg-description">Нажмите кнопку, чтобы привязать Telegram.</p>
                        <button
                            className="tg__btn tg__btn--connect"
                            onClick={handleConfirm}
                            disabled={isConfirming}
                        >
                            {isConfirming ? "Подключаем..." : "Подтвердить"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="block tg">
            <div className="block-container">
                <div className="block-row">
                    {tgStatus?.connected ? (
                        <div className="tg-connected">
                            <div className="tg__status tg__status--connected">Уведомления подключены</div>
                            <div className="tg__info">
                                <div className="tg-info-row">
                                    <span className="tg-label">Telegram ID</span>
                                    <span className="tg-value">{tgStatus.chat_id}</span>
                                </div>
                            </div>
                            <button
                                className="tg__btn tg__btn--disconnect"
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? "Отвязываем..." : "Отвязать аккаунт"}
                            </button>
                        </div>
                    ) : (
                        <div className="tg-disconnected">
                            <div className="tg__status tg__status--disconnected">Уведомления не подключены</div>
                            <p className="tg__description">Подключите Telegram, чтобы получать уведомления.</p>

                            <a
                                href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}?start=connect`}
                                className="tg__btn tg__btn--connect"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Подключить Telegram
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}