import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Config } from "../helpers/Config.tsx";

// --- Tip Tanımlamaları ---

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
}

interface OrderSuccessResponse {
    id: number;
    status: string;
    // Backend'den dönen diğer olası alanları buraya ekleyebilirsin
}

// Iyzico sayfasına gönderilecek state tipi
export interface IyzicoNavigationState {
    orderId: number;
    amount: number;
    userId: string;
}

const OrderPage = () => {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const navigate = useNavigate();
    const storedUserId = localStorage.getItem("userId");

    const formatCurrency = (value: number): string =>
        new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
        }).format(value);

    // 1. Sepet Verilerini Çek
    useEffect(() => {
        if (!storedUserId) {
            navigate("/login");
            return;
        }

        const fetchCart = async () => {
            try {
                const response = await fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}`);
                if (!response.ok) throw new Error("Sepet yüklenemedi");
                const data: CartResponse = await response.json();
                setCart(data);
            } catch (err) {
                console.error("Sepet getirme hatası:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [storedUserId, navigate]);

    // 2. Siparişi Oluştur ve Ödemeye Yönlendir
    const handleCompleteOrder = async (): Promise<void> => {
        if (!cart || !storedUserId) return;

        setIsSubmitting(true);

        const orderBody: OrderRequest = {
            userId: Number(storedUserId),
            items: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            totalPrice: cart.totalPrice,
            // Format: YYYY-MM-DDTHH:mm:ss
            orderDate: new Date().toISOString().split('.')[0],
        };

        try {
            const response = await fetch(`${Config.api.baseUrl}/api/v1/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderBody),
            });

            if (!response.ok) throw new Error("Sipariş oluşturma başarısız");

            const orderResult: OrderSuccessResponse = await response.json();

            // Iyzico sayfasına veri göndererek yönlendir
            const navigationState: IyzicoNavigationState = {
                orderId: orderResult.id,
                amount: cart.totalPrice,
                userId: storedUserId,
            };

            navigate("/Iyzico", { state: navigationState });

        } catch (error) {
            console.error("Sipariş hatası:", error);
            alert("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Sipariş bilgileriniz hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 font-karla">
            <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-bold"
            >
                <ArrowLeft size={20} /> SEPETE DÖN
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Sol Taraf: Sipariş Detayları */}
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

                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                            Ürün Listesi ({cart?.items.length})
                        </h3>

                        <div className="space-y-4">
                            {cart?.items.map((item) => (
                                <div key={item.productId} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
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

                {/* Sağ Taraf: Ödeme ve Checkout */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl sticky top-10">
                        <div className="mb-8">
                            <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-1">Ödenecek Toplam</p>
                            <p className="text-4xl font-black text-blue-400">
                                {formatCurrency(cart?.totalPrice || 0)}
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

                        <button
                            onClick={handleCompleteOrder}
                            disabled={isSubmitting}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-blue-600/20"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>ÖDEMEYE GEÇ <CreditCard size={24} /></>
                            )}
                        </button>

                        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col items-center gap-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Powered by</span>
                            <img
                                src="https://www.iyzico.com/assets/images/logo.svg?v=1"
                                alt="Iyzico"
                                className="h-5 opacity-50 grayscale hover:grayscale-0 transition-all"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderPage;