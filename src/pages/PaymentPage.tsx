import { FC, useEffect, useState } from "react";
import { useParams,} from "react-router-dom";
import {  useAppSelector } from "../redux/hooks";

import { Link } from "react-router-dom";
import { Config } from "../helpers/Config";
import {
  CreditCard,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
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
interface CardResponse {
  id: number;
  cardNumber: string;
  maskedCardNumber?: string;
  expireDate: string;
}

interface Card {
  id: number;
  cardNumber: string;
  expireDate: string;
  cvv: string;
}

interface OrderDetails {
  id: number;
  totalPrice: number;
}

const PaymentPage: FC = () => {
  const { orderId } = useParams();


  const isLoading = useAppSelector(state => state.homeReducer.isLoading);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", expire: "", cvv: "" });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [paymentSuccess, ] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  const handleResponse = async (res: Response) => {
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Bir hata oluştu");
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    return null;
  };

  const showToast = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId || !orderId) return;

    // Sipariş detaylarını getir
    fetch(`${Config.api.baseUrl}/api/v1/orders/${orderId}`)
        .then(handleResponse)
        .then(data => setOrderData(data))
        .catch(() => showToast("Sipariş bilgileri alınamadı", "error"));

    // Adresleri getir
    fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`)
        .then(handleResponse)
        .then(data => setAddresses(data || []))
        .catch(() => setAddresses([]));

    fetchCards();
  }, [orderId]);

  const fetchCards = () => {
    const storedUserId = localStorage.getItem("userId");
    fetch(`${Config.api.baseUrl}/api/v1/cards/${storedUserId}`)
        .then(handleResponse)
        .then((data: CardResponse[]) => {
          const mapped: Card[] = (data || []).map(c => ({
            id: c.id,
            cardNumber: c.maskedCardNumber || c.cardNumber,
            expireDate: c.expireDate,
            cvv: "",
          }));
          setCards(mapped);
        })
        .catch(() => setCards([]));
  };

  const handleAddCard = async () => {
    const storedUserId = localStorage.getItem("userId");
    if (!cardForm.number || !cardForm.expire || !cardForm.cvv) {
      showToast("Lütfen tüm alanları doldurun", "error");
      return;
    }

    try {
      await fetch(`${Config.api.baseUrl}/api/v1/cards/${storedUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: cardForm.number.replace(/\s/g, ""),
          expireDate: cardForm.expire,
          cvv: cardForm.cvv,
        }),
      }).then(handleResponse);

      showToast("Kart başarıyla kaydedildi", "success");
      fetchCards();
      setCardForm({ number: "", expire: "", cvv: "" });
      setShowModal(false);
    } catch (err) {
      showToast("Kart kaydedilirken bir hata oluştu", "error");
    }
  };

  const deleteCard = async (id: number) => {
    try {
      await fetch(`${Config.api.baseUrl}/api/v1/cards/${id}`, { method: "DELETE" });
      showToast("Kart silindi", "success");
      if (selectedCardId === id) setSelectedCardId(null);
      fetchCards();
    } catch (err) {
      showToast("Kart silinemedi", "error");
    }
  };










  if (paymentSuccess) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-white">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500 w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Ödeme Başarılı!</h1>
            <p className="text-slate-500 mt-2 font-medium">Anasayfaya yönlendiriliyorsunuz...</p>
          </motion.div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-karla">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* SOL KOLON */}
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-4xl font-black text-slate-900">Ödeme Yap</h1>

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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <CreditCard size={20} /> <h2>ÖDEME YÖNTEMİ</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="text-xs font-black text-white bg-slate-900 px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors">
                  + KART EKLE
                </button>
              </div>
              <div className="space-y-4">
                {cards.map(card => (
                    <div
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`group flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedCardId === card.id ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-6 bg-slate-800 rounded text-[8px] flex items-center justify-center font-bold text-white">CARD</div>
                        <span className="font-mono font-bold text-slate-700">{card.cardNumber}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                ))}
              </div>
            </section>
          </div>

          {/* SAĞ KOLON: SİPARİŞ ÖZETİ */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
                <Receipt className="text-indigo-400" />
                <h2 className="text-2xl font-black">SİPARİŞ ÖZETİ</h2>
              </div>
              <div className="space-y-4 mb-10 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <div className="flex justify-between"><span>Ara Toplam</span><span className="text-white">{orderData ? formatCurrency(orderData.totalPrice) : "---"}</span></div>
                <div className="flex justify-between"><span>Kargo</span><span className="text-green-400">Bedava</span></div>
                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-indigo-400 mb-1">TOPLAM TUTAR</p>
                    <p className="text-4xl font-black text-white">{orderData ? formatCurrency(orderData.totalPrice) : "---"}</p>
                  </div>
                </div>
              </div>
              <Link
                  to="/Iyzico"
                  // State üzerinden sipariş ID ve toplam fiyatı Iyzico bileşenine aktarıyoruz
                  state={{
                    orderId: orderId,
                    totalPrice: orderData?.totalPrice,
                    selectedAddressId: selectedAddressId
                  }}
                  // Eğer veriler yüklenmediyse tıklamayı engellemek için pointer-events-none ekliyoruz
                  className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 
    ${(!orderData || isLoading || !selectedAddressId || !selectedCardId) ? "pointer-events-none bg-slate-700 opacity-70" : "active:scale-95"}`}
              >
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                      ÖDEMEYİ TAMAMLA
                      <ChevronRight size={20} />
                    </>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* TOAST BİLDİRİMİ */}
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

        {/* KART EKLEME MODALI */}
        <AnimatePresence>
          {showModal && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
                  <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
                  <h3 className="text-2xl font-black text-slate-900 mb-8">YENİ KART EKLE</h3>
                  <div className="space-y-4">
                    <input
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-600 transition-all font-mono font-bold"
                        placeholder="KART NUMARASI"
                        value={cardForm.number}
                        onChange={e => setCardForm({...cardForm, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-600 transition-all font-bold"
                          placeholder="AA/YY"
                          value={cardForm.expire}
                          onChange={e => setCardForm({...cardForm, expire: e.target.value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim().slice(0, 5)})}
                      />
                      <input
                          className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-600 transition-all font-bold"
                          placeholder="CVV"
                          maxLength={3}
                          value={cardForm.cvv}
                          onChange={e => setCardForm({...cardForm, cvv: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                    <button onClick={handleAddCard} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black mt-4 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      KARTI KAYDET
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default PaymentPage;



