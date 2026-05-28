import React, { Suspense } from "react";
import BrandingForm from "@/components/branding/BrandingForm";

export const metadata = {
    title: "Solicitar Plano de Branding | Vink",
    description: "Preencha o formulário e dê o próximo passo na criação de uma marca gastronômica inesquecível.",
};

export default function BrandingFormPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div>
            </div>
        }>
            <BrandingForm />
        </Suspense>
    );
}
