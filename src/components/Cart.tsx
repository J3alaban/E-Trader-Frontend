import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Config} from "../helpers/Config.tsx";

// Tip tanımlamaları (Eksikse ekleyebilirsiniz)
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

const ITEMS_PER_PAGE = 5;

const Cart = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const storedUserId = localStorage.getItem("userId");

  // Sayı formatlama fonksiyonu (6.0E7 gibi değerleri düzgün gösterir)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    if (!storedUserId) return;
    fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}`)
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch((err) => console.error("Sepet getirme hatası:", err));
  }, [storedUserId]);

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (!storedUserId || newQuantity < 1) return;

    try {
      const response = await fetch(
          `${Config.api.baseUrl}/api/v1/carts/${storedUserId}/items/${productId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newQuantity }),
          }
      );

      if (response.ok) {
        const updatedCart = await response.json();
        // Backend'den gelen tüm sepet objesini set ediyoruz
        setCart(updatedCart);
      }
    } catch (error) {
      console.error("Adet güncelleme hatası:", error);
    }
  };

  const handleDelete = (productId: number) => {
    if (!storedUserId) return;
    fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}/items/${productId}`, {
      method: "DELETE",
    }).then(() => {
      // Silerken sadece frontend'den filtrelemek yerine backend'den tekrar çekmek
      // totalPrice senkronizasyonu için daha garantidir.
      if (cart) {
        const updatedItems = cart.items.filter((item) => item.productId !== productId);
        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        setCart({ ...cart, items: updatedItems, totalPrice: newTotal });
      }
    });
  };

  const handleCreateOrder = async () => {
    if (!storedUserId || !cart || cart.items.length === 0) {
      alert("Sepetiniz boş!");
      return;
    }

    setLoading(true);
    const orderRequest = {
      userId: Number(storedUserId),
      productId: cart.items.map((item) => item.productId),
      totalPrice: cart.totalPrice,
      addressId: 1,
      orderDate: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${Config.api.baseUrl}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRequest),
      });

      if (response.ok) {
        const orderData = await response.json();
        navigate(`/payment/${orderData.id}`);
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.message || "Sipariş oluşturulamadı."}`);
      }
    } catch (error) {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return <div className="p-4 text-center text-lg">Yükleniyor...</div>;

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedItems = cart.items.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(cart.items.length / ITEMS_PER_PAGE) || 1;

  return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-3">🛒 Sepetim</h1>

        <div className="space-y-4">
          {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border p-4 rounded-lg shadow-sm bg-gray-50">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-700">{item.productTitle}</p>
                      <p className="text-sm text-gray-500 font-mono">
                        Birim Fiyat: {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-400 mb-1">Adet</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                            className="w-16 px-2 py-1 border rounded-md text-center focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="text-xs text-gray-400">Ara Toplam</p>
                        <p className="font-bold text-gray-800">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                          onClick={() => handleDelete(item.productId)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2"
                          title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
              ))
          ) : (
              <p className="text-center py-10 text-gray-500">Sepetinizde ürün bulunmamaktadır.</p>
          )}
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 transition-all"
              >
                ⬅️ Geri
              </button>
              <span className="font-medium text-gray-600">
            {page} / {totalPages}
          </span>
              <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-30 transition-all"
              >
                İleri ➡️
              </button>
            </div>
        )}

        {/* Alt Kısım */}
        <div className="mt-8 pt-6 border-t flex flex-col items-end gap-4">
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-sm">Genel Toplam</span>
            <div className="text-3xl font-black text-green-600">
              {formatCurrency(cart.totalPrice)}
            </div>
          </div>

          <button
              onClick={handleCreateOrder}
              disabled={loading || cart.items.length === 0}
              className={`w-full sm:w-64 py-4 rounded-xl font-bold text-white shadow-md transition-all uppercase tracking-wider
            ${loading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200"}`}
          >
            {loading ? "Sipariş İşleniyor..." : "💳 Ödemeye Geç"}
          </button>
        </div>
      </div>
  );
};

export default Cart;