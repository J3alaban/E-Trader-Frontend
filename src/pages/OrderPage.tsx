import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Config } from "../helpers/Config.tsx";
import { useAppSelector } from "../redux/hooks";

interface CartItem {
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

const OrderPage = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const storedUserId = localStorage.getItem("userId");
  const guestCart = useAppSelector((state) => state.cartReducer.cartItems);

  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (storedUserId) {
          const res = await fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}`);
          if (!res.ok) throw new Error("Cart error");
          const data: CartResponse = await res.json();
          setCart(data);
        } else {
          const mappedItems: CartItem[] = guestCart.map((item: any) => ({
            productId: item.id,
            productTitle: item.title,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
          }));
          setCart({
            cartId: 0,
            userId: 0,
            items: mappedItems,
            totalPrice: mappedItems.reduce((a, b) => a + b.price * b.quantity, 0),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [storedUserId, guestCart]);

  const handleCompleteOrder = async () => {
    if (!cart) return;

    if (!storedUserId && (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone)) {
      alert("Lütfen misafir bilgilerini eksiksiz doldurun.");
      return;
    }

    setIsSubmitting(true);

    // Guest bilgileri düz alanlara açıldı — backend OrderRequestDTO ile birebir uyumlu
    const orderBody = {
      userId: storedUserId ? Number(storedUserId) : null,
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      totalPrice: cart.totalPrice,
      orderDate: new Date().toISOString(),
      addressId: null,
      // Guest alanları — kayıtlı kullanıcıda null gönderilir
      guestName:  storedUserId ? null : guestInfo.fullName,
      guestEmail: storedUserId ? null : guestInfo.email,
      guestPhone: storedUserId ? null : guestInfo.phone,
    };

    try {
      const res = await fetch(`${Config.api.baseUrl}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });

      if (!res.ok) throw new Error("Sipariş oluşturulamadı");

      const result = await res.json();

      // Iyzico sayfasına orderId + amount + guest bilgilerini taşı
      navigate("/Iyzico", {
        state: {
          orderId: result.id,
          amount: cart.totalPrice,
          userId: storedUserId ?? "guest",
          // Ödeme adımında Iyzico buyer nesnesini doldurmak için
          guestName:  storedUserId ? null : guestInfo.fullName,
          guestEmail: storedUserId ? null : guestInfo.email,
          guestPhone: storedUserId ? null : guestInfo.phone,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Sipariş işlemi başarısız.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10">
      <button onClick={() => navigate("/cart")} className="flex items-center gap-2 mb-6 text-gray-600">
        <ArrowLeft size={18} /> Sepete Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-600" />
            <h1 className="text-2xl font-bold">Siparişi Onayla</h1>
          </div>

          {!storedUserId && (
            <div className="bg-white border p-6 rounded-xl space-y-3 shadow-sm">
              <h2 className="font-bold text-lg">İletişim Bilgileri (Misafir)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="border p-3 rounded-lg"
                  placeholder="Ad Soyad"
                  value={guestInfo.fullName}
                  onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                />
                <input
                  className="border p-3 rounded-lg"
                  placeholder="E-posta"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                />
                <input
                  className="border p-3 rounded-lg md:col-span-2"
                  placeholder="Telefon Numarası"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Ürün Özeti</h3>
            {cart?.items.map((item) => (
              <div key={item.productId} className="flex justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-semibold">{item.productTitle}</p>
                  <p className="text-sm text-gray-500">{item.quantity} Adet</p>
                </div>
                <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl h-fit sticky top-6">
          <p className="text-gray-400 mb-1">Ödenecek Tutar</p>
          <h2 className="text-3xl font-bold text-blue-400 mb-6">
            {formatCurrency(cart?.totalPrice || 0)}
          </h2>

          <button
            onClick={handleCompleteOrder}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Ödeme Adımına Geç"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Bir sonraki adımda ödeme bilgilerinizi gireceksiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
