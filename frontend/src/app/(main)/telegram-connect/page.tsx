"use client";

import {useRouter} from "next/navigation";

export default function TelegramConnectPage()
{
    const router = useRouter();
    router.replace("/dashboard")
}

// import {Metadata} from "next";
// import TelegramConnectComponentPage from "@/components/TelegramConnect/TelegramConnectComponentPage";
//
// export const metadata: Metadata = {
//     title: "TG Connect | Сетевой Город. Образование"
// };
//
// export default function TelegramConnectPage()
// {
//     return <TelegramConnectComponentPage />;
// }