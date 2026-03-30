import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    CreditCard,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    Lock,
    User,
    X,
} from "lucide-react";
import { Config } from "../helpers/Config.tsx";

/* --- Tipler --- */
interface CartItem {
    id: number;
    productId: number;
    productTitle: string;
    price: number;
    quantity: number;
}

interface CartResponse {
    cartId: number;
    userId: number;
    items: CartItem[];
    totalPrice: number;
}

interface OrderItemRequest {
    productId: number;
    quantity: number;
}

interface OrderRequest {
    userId: number;
    items: OrderItemRequest[];
    totalPrice: number;
    orderDate: string;
    guestInfo?: GuestInfo; // opsiyonel misafir bilgisi
}

interface OrderSuccessResponse {
    id: number;
    status: string;
}

interface GuestInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

export interface IyzicoNavigationState {
    orderId: number;
    amount: number;
    userId: string;
    cart: CartResponse;
    guestInfo?: GuestInfo;
}

/* --- Misafir Bilgi Modalı --- */
interface GuestInfoModalProps {
    onConfirm: (info: GuestInfo) => void;
}

const GuestInfoModal = ({ onConfirm }: GuestInfoModalProps) => {
    const navigate = useNavigate();
    const [form, setForm] = useState<GuestInfo>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
    });
    const [errors, setErrors] = useState<Partial<GuestInfo>>({});

    const validate = (): boolean => {
        const newErrors: Partial<GuestInfo> = {};
        if (!form.fullName.trim()) newErrors.fullName = "Ad Soyad zorunludur";
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Geçerli bir e-posta giriniz";
        if (!form.phone.trim() || !/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, "")))
            newErrors.phone = "Geçerli bir telefon giriniz";
        if (!form.address.trim()) newErrors.address = "Adres zorunludur";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) onConfirm(form);
    };

    const fields: { key: keyof GuestInfo; label: string; placeholder: string; type?: string }[] = [
        { key: "fullName", label: "Ad Soyad", placeholder: "Örn: Ahmet Yılmaz" },
        { key: "email", label: "E-posta", placeholder: "ornek@mail.com", type: "email" },
        { key: "phone", label: "Telefon", placeholder: "05XX XXX XX XX", type: "tel" },
        { key: "address", label: "Adres", placeholder: "Mahalle, Cadde, No, İlçe, İl" },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
                >
                    {/* Kapat — sepete geri dön */}
                    <button
                        onClick={() => navigate("/cart")}
                        className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Başlık */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-600 p-2 rounded-xl text-white">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Misafir Bilgileri</h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Sipariş için iletişim bilgilerinizi giriniz
                            </p>
                        </div>
                    </div>

                    {/* Form Alanları */}
                    <div className="space-y-4">
                        {fields.map(({ key, label, placeholder, type }) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    {label}
                                </label>
                                <input
                                    type={type || "text"}
                                    placeholder={placeholder}
                                    value={form[key]}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    className={`w-full bg-slate-800 text-white placeholder-slate-500
                                        rounded-xl px-4 py-3 text-sm outline-none border transition-colors
                                        ${errors[key]
                                            ? "border-red-500 focus:border-red-400"
                                            : "border-slate-700 focus:border-blue-500"
                                        }`}
                                />
                                {errors[key] && (
                                    <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Gizlilik Notu */}
                    <p className="text-slate-500 text-xs mt-5 flex items-center gap-2">
                        <Lock size={12} />
                        Bilgileriniz yalnızca bu sipariş için kullanılır ve saklanmaz.
                    </p>

                    {/* Devam Et */}
                    <button
                        onClick={handleSubmit}
                        className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white
                            rounded-2xl font-black text-base flex items-center justify-center
                            gap-2 transition-all active:scale-95"
                    >
                        Devam Et <CreditCard size={18} />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/* --- Ana Sayfa --- */
const OrderPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const storedUserId = localStorage.getItem("userId");
    const guestId = localStorage.getItem("guestId");
    const isGuest = !storedUserId && !!guestId;

    const cart = (location.state as { cart: CartResponse })?.cart;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
        }).format(value);

    // Misafir ise modal otomatik açılır
    useEffect(() => {
        if (!cart) {
            navigate("/cart");
            return;
        }
        if (isGuest && !guestInfo) {
            setShowGuestModal(true);
        }
    }, []);

    const handleGuestConfirm = (info: GuestInfo) => {
        setGuestInfo(info);
        setShowGuestModal(false);
    };

    const handleCompleteOrder = async () => {
        if (!cart || !isAgreed) return;
        // Misafir ise guestInfo zorunlu
        if (isGuest && !guestInfo) {
            setShowGuestModal(true);
            return;
        }

        setIsSubmitting(true);

        const effectiveUserId = storedUserId ?? guestId ?? "0";

        const orderBody: OrderRequest = {
            userId: Number(effectiveUserId),
            items: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            totalPrice: cart.totalPrice,
            orderDate: new Date().toISOString().split(".")[0],
            ...(isGuest && guestInfo ? { guestInfo } : {}),
        };

        try {
            const response = await fetch(`${Config.api.baseUrl}/api/v1/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderBody),
            });

            if (!response.ok) throw new Error("Sipariş oluşturulamadı");

            const orderResult: OrderSuccessResponse = await response.json();

            navigate("/Iyzico", {
                state: {
                    orderId: orderResult.id,
                    amount: cart.totalPrice,
                    userId: effectiveUserId,
                    cart,
                    guestInfo
                },
            });
        } catch (err) {
            console.error(err);
            alert("Sipariş sırasında hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cart) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    return (
        <>
            {/* Misafir Modal */}
            {showGuestModal && <GuestInfoModal onConfirm={handleGuestConfirm} />}

            <div className="max-w-5xl mx-auto p-4 md:p-10 font-karla">
                <button
                    onClick={() => navigate("/cart")}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-bold"
                >
                    <ArrowLeft size={20} /> SEPETE DÖN
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* SOL: Ürün Özeti */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <ShieldCheck size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                                Siparişi Onayla
                            </h1>
                        </div>

                        {/* Misafir bilgi özeti — doldurulduysa göster */}
                        {isGuest && guestInfo && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start justify-between gap-4"
                            >
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                                        Misafir Bilgileri
                                    </p>
                                    <p className="font-bold text-gray-800">{guestInfo.fullName}</p>
                                    <p className="text-sm text-gray-500">{guestInfo.email}</p>
                                    <p className="text-sm text-gray-500">{guestInfo.phone}</p>
                                    <p className="text-sm text-gray-500">{guestInfo.address}</p>
                                </div>
                                <button
                                    onClick={() => setShowGuestModal(true)}
                                    className="text-xs font-bold text-blue-500 hover:text-blue-700 underline shrink-0"
                                >
                                    Düzenle
                                </button>
                            </motion.div>
                        )}

                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                                Ürün Listesi ({cart.items.length})
                            </h3>
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-gray-800 uppercase text-md">
                                                {item.productTitle}
                                            </span>
                                            <span className="text-sm text-gray-500 font-medium">
                                                {item.quantity} Adet × {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                        <span className="font-black text-gray-900">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* SAĞ: Ödeme Özeti */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4 py-2 px-4 bg-green-500/10 border border-green-500/20 rounded-full">
                            <Lock size={14} className="text-green-500" />
                            <span className="text-[11px] font-bold text-green-500 uppercase tracking-wider">
                                SSL Secured & Güvenli Ödeme
                            </span>
                        </div>

                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl sticky top-10">
                            <div className="mb-8">
                                <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">
                                    Ödenecek Toplam
                                </p>
                                <p className="text-4xl font-black text-blue-400">
                                    {formatCurrency(cart.totalPrice)}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-green-500" />
                                    Güvenli Ödeme Altyapısı
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-green-500" />
                                    Anında Onay
                                </div>
                            </div>

                            {/* Sözleşme */}
                            <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-left">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center mt-1">
                                        <input
                                            type="checkbox"
                                            checked={isAgreed}
                                            onChange={(e) => setIsAgreed(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-600 bg-slate-800 checked:bg-blue-600 checked:border-blue-600 transition-all"
                                        />
                                        <svg className="absolute w-3.5 h-3.5 mt-0.5 ml-0.5 text-white hidden peer-checked:block pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <span className="text-[12px] font-medium text-slate-300 leading-snug">
                                        <Link to="/documents" className="text-blue-400 underline hover:text-blue-300">Gizlilik Politikası</Link>,{" "}
                                        <Link to="/documents" className="text-blue-400 underline hover:text-blue-300">Teslimat ve İade</Link> ve{" "}
                                        <Link to="/documents" className="text-blue-400 underline hover:text-blue-300">Mesafeli Satış Sözleşmesi</Link>'ni okudum, onaylıyorum.
                                    </span>
                                </label>
                            </div>

                            <button
                                onClick={handleCompleteOrder}
                                disabled={isSubmitting || !isAgreed || (isGuest && !guestInfo)}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700
                                    disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl
                                    font-black text-lg flex items-center justify-center gap-3 transition-all
                                    transform active:scale-95 shadow-lg shadow-blue-600/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>ÖDEMEYE GEÇ <CreditCard size={24} /></>
                                )}
                            </button>

                            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock size={12} className="text-slate-500" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
                                        Secure Checkout
                                    </span>
                                </div>
                                <img
                                    src="/iyzico_ile_ode_white.png"
                                    alt="Iyzico"
                                    className="h-5 opacity-50 grayscale hover:grayscale-0 transition-all"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default OrderPage;
