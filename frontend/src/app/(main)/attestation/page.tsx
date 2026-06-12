import AttestationPageComponent from "@/components/Attestation/AttestationPageComponent";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Аттестация | Сетевой Город. Образование"
};

export default function AttestationPage()
{
    return <AttestationPageComponent />
}