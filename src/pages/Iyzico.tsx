import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Loader2, AlertCircle, ShieldCheck, ArrowLeft, MapPin } from "lucide-react";
import { Config } from "../helpers/Config.tsx";

interface IyzicoNavigationState {
  orderId: number;
  amount: number;
  userId: string | number;
  // Guest buyer bilgileri — OrderPage'den taşınır
  guestName:  string | null;
  guestEmail: string | null;
  guestPhone: string | null;
}

const Iyzico = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as IyzicoNavigationState | null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [guestAddress, setGuestAddress] = useState("");

  const userId = state?.userId ?? localStorage.getItem("userId") ?? "guest";

  useEffect(() => {
    if (!state) navigate("/cart");
  }, [state, navigate]);

  // Kayıtlı kullanıcı adreslerini getir
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId || userId === "guest") return;
      try {
        const res = await fetch(`${Config.api.baseUrl}/api/v1/users/${userId}/addresses`);
        if (!res.ok) throw new Error("Adresler yüklenemedi.");
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : data?.addresses || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [userId]);

  const renderIyzicoForm = (checkoutFormContent: string) => {
    const container = document.getElementById("iyzipay-checkout-form");
    if (!container) return;

    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = checkoutFormContent;
    container.appendChild(wrapper);

    const scripts = wrapper.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const oldScript = scripts[i];
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.text = oldScript.innerText;
      }
      document.body.appendChild(newScript);
    }
  };

  const handleStartPayment = async () => {
    if (!state) return;

    if (userId === "guest" && !guestAddress.trim()) {
      setError("Lütfen teslimat adresi giriniz.");
      return;
    }
    if (userId !== "guest" && !selectedAddressId) {
      setError("Lütfen bir kayıtlı adres seçiniz.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // PaymentRequest backend DTO ile birebir uyumlu
    const paymentRequest = {
      orderId:   state.orderId,
      method:    "CREDIT_CARD",
      amount:    state.amount,
      currency:  "TRY",
      provider:  "IYZICO",
      guestAddress: userId === "guest" ? guestAddress : null,
      addressId:    userId === "guest" ? 0 : selectedAddressId,
      // Guest buyer bilgileri — Iyzico Buyer nesnesini doldurmak için
      guestName:  userId === "guest" ? state.guestName  : null,
      guestEmail: userId === "guest" ? state.guestEmail : null,
      guestPhone: userId === "guest" ? state.guestPhone : null,
    };

    try {
      const response = await fetch(`${Config.api.baseUrl}/api/payments/iyzico-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) throw new Error("Ödeme sistemi yanıt vermiyor.");

      const result = await response.json();

      if (result.checkoutFormContent) {
        renderIyzicoForm(result.checkoutFormContent);
      } else if (result.paymentPageUrl) {
        window.location.href = result.paymentPageUrl;
      } else {
        throw new Error("Ödeme formu oluşturulamadı.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ödeme başlatılamadı.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!state) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black transition-colors"
      >
        <ArrowLeft size={18} /> Geri Dön
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border shadow-xl rounded-3xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} className="text-blue-600" />
        </div>

        <h1 className="text-3xl font-black mb-1">Ödeme Paneli</h1>
        <p className="text-gray-500 mb-8 font-medium">Sipariş Numarası: #{state.orderId}</p>

        {/* KAYITLI KULLANICI — adres seçimi */}
        {userId !== "guest" && addresses.length > 0 && (
          <div className="bg-gray-50 p-5 rounded-2xl mb-6 text-left border">
            <label className="flex items-center gap-2 font-bold mb-3 text-sm text-gray-700">
              <MapPin size={16} /> Teslimat Adresi Seçin
            </label>
            <select
              className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedAddressId ?? ""}
              onChange={(e) => setSelectedAddressId(Number(e.target.value))}
            >
              <option value="">Lütfen bir adres seçin...</option>
              {addresses.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.title || `${a.street} - ${a.city}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MİSAFİR — serbest adres girişi */}
        {userId === "guest" && (
          <div className="bg-gray-50 p-5 rounded-2xl mb-6 text-left border">
            <label className="flex items-center gap-2 font-bold mb-3 text-sm text-gray-700">
              <MapPin size={16} /> Teslimat Adresi
            </label>
            <textarea
              className="w-full border p-4 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
              placeholder="Siparişinizin gönderileceği tam adresi yazınız..."
              value={guestAddress}
              onChange={(e) => setGuestAddress(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl mb-8">
          <span className="text-gray-400 font-medium">Toplam Tutar</span>
          <span className="text-2xl font-bold text-blue-400">{state.amount.toFixed(2)} TL</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div id="iyzipay-checkout-form" className="mb-6 overflow-hidden transition-all" />

        {!isProcessing ? (
          <button
            type="button"
            onClick={handleStartPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Güvenli Ödemeyi Başlat
            <ShieldCheck size={20} />
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-medium text-gray-500">Ödeme formu hazırlanıyor...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Iyzico;