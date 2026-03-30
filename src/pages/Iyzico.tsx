import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Loader2, AlertCircle, ShieldCheck, ArrowLeft, MapPin, User } from "lucide-react";
import { Config } from "../helpers/Config.tsx";
import { IyzicoNavigationState } from "./OrderPage";

interface Address {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    userId: number;
}

interface PaymentRequest {
    orderId: number;
    method: string;
    amount: number;
    currency: string;
    provider: string;
    addressId?: number | null;

    // Misafir bilgileri için
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    tcNo?: string;
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

    const guestInfo = state?.guestInfo;
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);

    const storedUserId = localStorage.getItem("userId");

    useEffect(() => {
        if (!state) {
            navigate("/cart");
            return;
        }

        const fetchAddresses = async () => {
            if (guestInfo || !storedUserId) {
                setIsLoadingAddresses(false);
                return;
            }

            try {
                const response = await fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`);
                if (!response.ok) throw new Error("Adresler yüklenemedi.");
                const data: Address[] = await response.json();
                setAddresses(data);
                if (data.length > 0) setSelectedAddressId(data[0].id);
            } catch (err) {
                setError("Adres bilgileriniz alınırken bir sorun oluştu.");
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [state, navigate, storedUserId, guestInfo]);

    const handleStartPayment = async () => {
        if (!isAgreed) {
            setError("Lütfen sözleşmeleri onaylayın.");
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
            addressId: guestInfo ? null : selectedAddressId ?? null,
        };

        if (guestInfo) {
            const [firstName, ...rest] = guestInfo.fullName.split(" ");
            const lastName = rest.join(" ");

            paymentRequest.firstName = firstName;
            paymentRequest.lastName = lastName || "";
            paymentRequest.email = guestInfo.email;
            paymentRequest.phone = guestInfo.phone;
            paymentRequest.tcNo = "11111111111";
        }

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
            setError("Ödeme sistemiyle bağlantı kurulamadı.");
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
                    Sipariş No: <span className="text-gray-900 font-bold">#{state.orderId}</span>
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6 flex justify-between items-center">
                    <span className="text-gray-600 font-bold uppercase tracking-wider text-sm">Tutar</span>
                    <span className="text-2xl font-black text-blue-600">
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(state.amount)}
                    </span>
                </div>

                <div className="mb-6 text-left">
                    {guestInfo ? (
                        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                            <label className="flex items-center gap-2 text-sm font-black text-blue-800 mb-3 uppercase tracking-widest">
                                <User size={18} /> Alıcı Bilgileri (Misafir)
                            </label>
                            <div className="space-y-1 text-gray-700 font-bold">
                                <p className="text-lg">{guestInfo.fullName}</p>
                                <p className="text-sm font-medium text-gray-500">{guestInfo.email} • {guestInfo.phone}</p>
                                <div className="mt-3 pt-3 border-t border-blue-100 flex gap-2">
                                    <MapPin size={16} className="text-blue-600 shrink-0 mt-1" />
                                    <p className="text-sm leading-relaxed">{guestInfo.address}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">
                                <MapPin size={18} className="text-blue-600" /> Teslimat Adresi
                            </label>

                            {isLoadingAddresses ? (
                                <div className="p-4 bg-gray-50 rounded-2xl animate-pulse h-16"></div>
                            ) : addresses.length > 0 ? (
                                <select
                                    value={selectedAddressId || ""}
                                    onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em'
                                    }}
                                >
                                    {addresses.map((addr) => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.street} - {addr.city}, {addr.state}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-4 bg-orange-50 text-orange-700 rounded-2xl text-sm font-bold">
                                    Kayıtlı adres bulunamadı.
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-left">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                            <input
                                type="checkbox"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-blue-600 transition-all"
                            />
                            <svg className="absolute w-3.5 h-3.5 mt-0.5 ml-0.5 text-white hidden peer-checked:block pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-sm font-bold text-gray-600 leading-tight">
                            <Link to="/documents" className="text-blue-600 underline">Gizlilik Politikası</Link>,{" "}
                            <Link to="/documents" className="text-blue-600 underline">Mesafeli Satış Sözleşmesi</Link>'ni onaylıyorum.
                        </span>
                    </label>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div id="iyzipay-checkout-form" className="mb-6"></div>

                {!isProcessing && !document.getElementById("iyzipay-checkout-form")?.innerHTML && (
                    <button
                        onClick={handleStartPayment}
                        disabled={!isAgreed || (!guestInfo && !selectedAddressId)}
                        className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                            isAgreed && (guestInfo || selectedAddressId)
                            ? "bg-slate-900 text-white shadow-lg"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        ÖDEMEYE BAŞLA <ShieldCheck size={24} />
                    </button>
                )}

                {isProcessing && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-gray-500 font-bold text-sm">Güvenli Ödeme Yükleniyor...</p>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
                    <img src="/logo_band_colored@3x.png" alt="Iyzico" className="h-6" />
                    <div className="h-4 w-[1px] bg-gray-400"></div>
                    <span className="text-[10px] font-bold text-gray-500">256-Bit SSL Security</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Iyzico;