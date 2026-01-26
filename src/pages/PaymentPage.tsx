import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { Config } from "../helpers/Config";
import {
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderDetails {
  id: number;
  totalPrice: number;
}

const PaymentPage: FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const isLoading = useAppSelector(state => state.homeReducer.isLoading);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!storedUserId || !orderId) return;

    // Sipariş detaylarını çek
    fetch(`${Config.api.baseUrl}/api/v1/orders/${orderId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => setOrderData(data))
        .catch(() => showToast("Sipariş bilgileri alınamadı", "error"));

    // Adresleri çek
    fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => setAddresses(data || []))
        .catch(() => setAddresses([]));
  }, [orderId]);

  // Butona tıklandığında yapılacak işlem
  const handleGoToIyzico = () => {
    if (!selectedAddressId) {
      showToast("Lütfen bir teslimat adresi seçin.", "error");
      return;
    }

    if (!orderData) {
      showToast("Sipariş verileri yüklenemedi.", "error");
      return;
    }

    // Kullanıcıyı senin IyzicoPage bileşenine yönlendiriyoruz
    // Verileri state ile gönderiyoruz ki IyzicoPage bunları alabilsin
    navigate("/Iyzico", {
      state: {
        orderId: orderId,
        totalPrice: orderData.totalPrice,
        addressId: selectedAddressId // Backend'de lazım olabilir
      }
    });
  };

  return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-karla">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* SOL KOLON: ADRES SEÇİMİ */}
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-4xl font-black text-slate-900">Ödeme Adımı</h1>

            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold">
                <MapPin size={20} /> <h2>TESLİMAT ADRESİ</h2>
              </div>
              <div className="grid gap-4">
                {addresses.map(addr => (
                    <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200"
                        }`}
                    >
                      <p className="text-sm font-bold text-slate-800 uppercase">{addr.street}</p>
                      <p className="text-xs text-slate-400 mt-1">{addr.city}, {addr.state}</p>
                    </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold">
                <CreditCard size={20} /> <h2>ÖDEME YÖNTEMİ</h2>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Kart bilgileriniz bir sonraki adımda <span className="text-indigo-600 font-bold">iyzico</span> güvenli ödeme sayfasında istenecektir.
              </p>
            </section>
          </div>

          {/* SAĞ KOLON: ÖZET VE YÖNLENDİRME */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
                <Receipt className="text-indigo-400" />
                <h2 className="text-2xl font-black">SİPARİŞ ÖZETİ</h2>
              </div>

              <div className="space-y-4 mb-10 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <div className="flex justify-between"><span>Sipariş ID</span><span className="text-white">#{orderId}</span></div>
                <div className="flex justify-between"><span>Toplam Tutar</span><span className="text-white">{orderData ? formatCurrency(orderData.totalPrice) : "---"}</span></div>
                <div className="flex justify-between"><span>Kargo</span><span className="text-green-400">Ücretsiz</span></div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-[10px] text-indigo-400 mb-1 tracking-widest">ÖDENECEK TOPLAM</p>
                  <p className="text-4xl font-black text-white">{orderData ? formatCurrency(orderData.totalPrice) : "---"}</p>
                </div>
              </div>

              <button
                  onClick={handleGoToIyzico}
                  disabled={!selectedAddressId || !orderData}
                  className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg
                  ${(!selectedAddressId || !orderData) ? "bg-slate-700 opacity-50 cursor-not-allowed" : "active:scale-95"}`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                    <>
                      ÖDEME EKRANINA GEÇ
                      <ChevronRight size={20} />
                    </>
                )}
              </button>

              <div className="mt-8 flex flex-col items-center gap-2 opacity-40">
                <span className="text-[9px] font-bold tracking-[0.2em]">POWERED BY</span>
                <img src="https://www.iyzico.com/assets/images/logo.svg" alt="Iyzico" className="h-4 grayscale invert" />
              </div>
            </div>
          </div>
        </div>

        {/* TOAST */}
        <AnimatePresence>
          {message && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] ${
                              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white font-bold text-sm`}
              >
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default PaymentPage;