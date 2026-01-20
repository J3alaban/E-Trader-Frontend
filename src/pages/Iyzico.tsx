import { FC, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Lock,
    ChevronLeft,
    Loader2,
    AlertCircle,
    CreditCard
} from "lucide-react";
import { Config } from "../helpers/Config";

const IyzicoPage: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, totalPrice } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scriptInjected = useRef(false);

    useEffect(() => {
        // Eğer state üzerinden veri gelmemişse (doğrudan linkle girilmişse) geri gönder
        if (!orderId) {
            navigate("/payment");
            return;
        }

        const fetchIyzicoForm = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${Config.api.baseUrl}/api/v1/payments/iyzico-start`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: Number(orderId) }),
                });

                if (!response.ok) throw new Error("Ödeme formu alınamadı.");

                const data = await response.json();

                if (data && data.checkoutFormContent) {
                    injectIyzicoScript(data.checkoutFormContent);
                } else {
                    throw new Error("Geçersiz API yanıtı.");
                }
            } catch (err: any) {
                setError(err.message || "Bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        if (!scriptInjected.current) {
            fetchIyzicoForm();
        }
    }, [orderId, navigate]);

    const injectIyzicoScript = (content: string) => {
        // Iyzico scriptini çalıştırmak için script elementini manuel oluşturup enjekte ediyoruz
        const container = document.getElementById("iyzipay-checkout-form");
        if (!container) return;

        const range = document.createRange();
        const fragment = range.createContextualFragment(content);
        container.appendChild(fragment);
        scriptInjected.current = true;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-karla">
            {/* Üst Bar / Geri Dönüş */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-2xl flex justify-between items-center mb-8"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm group"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    ÖDEME SEÇENEKLERİNE DÖN
                </button>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Güvenli Ödeme Katmanı</span>
                </div>
            </motion.div>

            <main className="w-full max-w-2xl">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white relative">

                    {/* Sipariş Bilgi Şeridi */}
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Ödenecek Tutar</p>
                            <h1 className="text-3xl font-black italic">
                                {totalPrice ? `${new Intl.NumberFormat("tr-TR").format(totalPrice)} TL` : "---"}
                            </h1>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Sipariş No</p>
                            <p className="font-mono font-bold text-indigo-400">#{orderId}</p>
                        </div>
                    </div>

                    <div className="p-10 relative min-h-[400px]">
                        {/* Yükleme Ekranı */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10"
                                >
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-slate-400 font-bold animate-pulse text-sm">İyzico ödeme formu hazırlanıyor...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hata Ekranı */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="bg-red-50 p-4 rounded-full mb-4">
                                    <AlertCircle size={40} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">Hata Oluştu</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-6 font-medium text-sm">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    TEKRAR DENE
                                </button>
                            </motion.div>
                        )}

                        {/* İyzico Form Konteynırı */}
                        <div
                            id="iyzipay-checkout-form"
                            className={`responsive ${loading || error ? 'hidden' : 'block'}`}
                        >
                            {/* Script buraya inject edilecek */}
                        </div>
                    </div>

                    {/* Alt Bilgi */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-8">
                        <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                            <Lock size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">PCI-DSS Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                            <CreditCard size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">SSL Secured</span>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-[9px] uppercase font-black tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                    Ödeme işleminiz iyzico tarafından 256-bit SSL şifreleme teknolojisi ile güvence altına alınmıştır.
                </p>
            </main>
        </div>
    );
};

export default IyzicoPage;