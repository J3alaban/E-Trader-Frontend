import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // Link eklendi
import { motion } from "framer-motion";
import { CreditCard, Loader2, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { Config } from "../helpers/Config.tsx";
import { IyzicoNavigationState } from "./OrderPage";

interface PaymentRequest {
    orderId: number;
    method: string;
    amount: number;
    currency: string;
    provider: string;
    addressId: number;
}

interface PaymentResponse {
    paymentPageUrl?: string;
    checkoutFormContent?: string;
    status: string;
}

const Iyzico = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as IyzicoNavigationState | null;

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isAgreed, setIsAgreed] = useState<boolean>(false); // Sözleşme onayı state'i
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!state) {
            navigate("/cart");
        }
    }, [state, navigate]);

    const handleStartPayment = async () => {
        if (!isAgreed) {
            setError("Lütfen devam etmeden önce sözleşmeleri onaylayın.");
            return;
        }
        if (!state) return;

        setIsProcessing(true);
        setError(null);

        const paymentRequest: PaymentRequest = {
            orderId: state.orderId,
            method: "CREDIT_CARD",
            amount: state.amount,
            currency: "TRY",
            provider: "IYZICO",
            addressId: 24,
        };

        try {
            const response = await fetch(`${Config.api.baseUrl}/api/payments/iyzico-start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentRequest),
            });

            if (!response.ok) throw new Error("Ödeme başlatılamadı.");
            const result: PaymentResponse = await response.json();

            if (result.checkoutFormContent) {
                const checkoutDiv = document.getElementById("iyzipay-checkout-form");
                if (checkoutDiv) {
                    checkoutDiv.innerHTML = result.checkoutFormContent;
                    const scripts = checkoutDiv.getElementsByTagName("script");
                    for (let i = 0; i < scripts.length; i++) {
                        const script = document.createElement("script");
                        script.type = "text/javascript";
                        if (scripts[i].src) script.src = scripts[i].src;
                        else script.textContent = scripts[i].textContent;
                        document.head.appendChild(script);
                    }
                }
            } else if (result.paymentPageUrl) {
                window.location.href = result.paymentPageUrl;
            }
        } catch (err) {
            setError("Ödeme sistemiyle bağlantı kurulamadı. Lütfen tekrar deneyin.");
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

                <div className="bg-gray-50 rounded-2xl p-6 mb-6 flex justify-between items-center">
                    <span className="text-gray-600 font-bold uppercase tracking-wider text-sm">Ödenecek Tutar</span>
                    <span className="text-2xl font-black text-blue-600">
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(state.amount)}
                    </span>
                </div>

                {/* --- SÖZLEŞME ONAY KUTUSU --- */}
                <div className="mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-left">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                            <input
                                type="checkbox"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 transition-all"
                            />
                            <svg className="absolute w-3.5 h-3.5 mt-0.5 ml-0.5 text-white hidden peer-checked:block pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-sm font-bold text-gray-600 leading-tight">
                            <Link to="/documents" className="text-blue-600 underline hover:text-blue-800">Gizlilik Politikası</Link>,{" "}
                            <Link to="/documents" className="text-blue-600 underline hover:text-blue-800">Teslimat ve İade</Link> ve{" "}
                            <Link to="/documents" className="text-blue-600 underline hover:text-blue-800">Mesafeli Satış Sözleşmesi</Link>'ni
                            okudum, onaylıyorum.
                        </span>
                    </label>
                </div>

                {/* --------------------------- */}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div id="iyzipay-checkout-form" className="mb-6"></div>

                {!isProcessing && !document.getElementById("iyzipay-checkout-form")?.innerHTML && (
                    <button
                        onClick={handleStartPayment}
                        disabled={!isAgreed} // Onaylanmadan buton aktif olmaz
                        className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                            isAgreed ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
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

                <div className="mt-8 flex items-center justify-center gap-6">
                    <img src="/logo_band_colored@3x.png" alt="Iyzico" className="h-6 transition-all hover:scale-105" />
                    <div className="h-4 w-[1px] bg-gray-400"></div>
                    <span className="text-[10px] font-bold tracking-tighter uppercase text-gray-500">
                        256-Bit SSL Security
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default Iyzico;