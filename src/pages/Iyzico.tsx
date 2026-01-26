import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Loader2, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { Config } from "../helpers/Config.tsx";
import { IyzicoNavigationState } from "./OrderPage"; // Tipleri oradan çekiyoruz

// --- Tip Tanımlamaları ---

interface PaymentRequest {
    orderId: number;
    method: string;
    amount: number;
    currency: string;
    provider: string;
    addressId: number; // Bu değerin OrderPage'den gelmesi idealdir
}

interface PaymentResponse {
    paymentPageUrl?: string; // Bazı senaryolarda URL döner
    checkoutFormContent?: string; // HTML script içeriği
    status: string;
}

const Iyzico = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as IyzicoNavigationState | null;

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Sayfa yüklendiğinde state kontrolü
    useEffect(() => {
        if (!state) {
            navigate("/cart");
        }
    }, [state, navigate]);

    const handleStartPayment = async () => {
        if (!state) return;

        setIsProcessing(true);
        setError(null);

        // Belirttiğin request body formatı
        const paymentRequest: PaymentRequest = {
            orderId: state.orderId,
            method: "CREDIT_CARD",
            amount: state.amount,
            currency: "TRY",
            provider: "IYZICO",
            addressId: 24, // Sabit verdik, dinamik olması için OrderPage'den taşınmalı
        };

        try {
            const response = await fetch(`${Config.api.baseUrl}/api/payments/iyzico-start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentRequest),
            });

            if (!response.ok) throw new Error("Ödeme başlatılamadı.");

            const result: PaymentResponse = await response.json();

            if (result.checkoutFormContent) {
                // Iyzico'nun gönderdiği script içeriğini sayfaya enjekte ediyoruz
                const checkoutDiv = document.getElementById("iyzipay-checkout-form");
                if (checkoutDiv) {
                    // Önceki içeriği temizle
                    checkoutDiv.innerHTML = result.checkoutFormContent;

                    // Script tag'lerini manuel olarak çalıştırmamız gerekebilir
                    const scripts = checkoutDiv.getElementsByTagName("script");
                    for (let i = 0; i < scripts.length; i++) {
                        const script = document.createElement("script");
                        script.type = "text/javascript";
                        if (scripts[i].src) {
                            script.src = scripts[i].src;
                        } else {
                            script.textContent = scripts[i].textContent;
                        }
                        document.head.appendChild(script);
                    }
                }
            } else if (result.paymentPageUrl) {
                // Eğer script değil de URL dönerse oraya yönlendir
                window.location.href = result.paymentPageUrl;
            }

        } catch (err) {
            setError("Ödeme sistemiyle bağlantı kurulamadı. Lütfen tekrar deneyin.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!state) return null;

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-12 font-karla">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold transition-colors"
            >
                <ArrowLeft size={20} /> Vazgeç ve Geri Dön
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl text-center"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-50 p-4 rounded-full">
                        <CreditCard size={40} className="text-blue-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2">Ödemeyi Tamamla</h1>
                <p className="text-gray-500 mb-8 font-medium">
                    Sipariş numaranız: <span className="text-gray-900 font-bold">#{state.orderId}</span>
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex justify-between items-center">
                    <span className="text-gray-600 font-bold uppercase tracking-wider text-sm">Ödenecek Tutar</span>
                    <span className="text-2xl font-black text-blue-600">
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(state.amount)}
          </span>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Iyzico Formunun Yerleşeceği Alan */}
                <div id="iyzipay-checkout-form" className="mb-6"></div>

                {!isProcessing && !document.getElementById("iyzipay-checkout-form")?.innerHTML && (
                    <button
                        onClick={handleStartPayment}
                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95"
                    >
                        ÖDEMEYE BAŞLA <ShieldCheck size={24} />
                    </button>
                )}

                {isProcessing && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-gray-500 font-bold animate-pulse text-sm">Iyzico Güvenli Ödeme Ekranı Yükleniyor...</p>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
                    <img src="https://www.iyzico.com/assets/images/logo.svg" alt="Iyzico" className="h-6" />
                    <div className="h-4 w-[1px] bg-gray-400"></div>
                    <span className="text-[10px] font-bold tracking-tighter uppercase text-gray-500">256-Bit SSL Security</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Iyzico;