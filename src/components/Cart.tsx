import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Config } from "../helpers/Config.tsx";

// Tip tanımlamaları
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

  // Sadece Frontend üzerinde miktarı ve toplam fiyatı günceller
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (!cart || newQuantity < 1) return;

    const updatedItems = cart.items.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    setCart({
      ...cart,
      items: updatedItems,
      totalPrice: newTotal
    });
  };

  const handleDelete = (productId: number) => {
    if (!storedUserId) return;
    fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}/items/${productId}`, {
      method: "DELETE",
    }).then(() => {
      if (cart) {
        const updatedItems = cart.items.filter((item) => item.productId !== productId);
        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        setCart({ ...cart, items: updatedItems, totalPrice: newTotal });
      }
    });
  };

  const handleCreateOrder = async () => {
    if (!storedUserId || !cart || cart.items.length === 0) return;
    setLoading(true);

    // Backend'e güncel miktar ve fiyat bilgileriyle istek atılır
    const orderRequest = {
      userId: Number(storedUserId),
      productId: cart.items.map((item) => item.productId),
      quantities: cart.items.map((item) => item.quantity), // Backend beklentisine göre eklendi
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
      }
    } catch (error) {
      console.error("Sipariş hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShoppingBag className="h-24 w-24 text-blue-100 mb-6 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 text-center">Sepetiniz Boş</h2>
            <p className="text-gray-500 mb-8 text-center">Henüz ürün eklememişsiniz.</p>
            <button
                onClick={() => navigate("/products")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
            >
              Alışverişe Başla <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
    );
  }

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedItems = cart.items.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(cart.items.length / ITEMS_PER_PAGE) || 1;

  return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 font-karla">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-blue-600">🛒</span> SEPETİM
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Toplam {cart.items.length} ürün bulundu.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ürün Listesi */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {paginatedItems.map((item, index) => (
                  <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {item.productTitle}
                      </h3>
                      <p className="text-sm text-blue-500 font-bold mt-1">
                        {formatCurrency(item.price)} <span className="text-gray-400 font-normal">/ adet</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-8">
                      {/* Miktar Kontrolü */}
                      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
                        <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Minus size={16} />
                        </button>

                        <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                            className="w-12 text-center font-bold text-gray-700 bg-transparent border-none focus:ring-0 appearance-none"
                        />

                        <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-2 hover:bg-white hover:text-blue-600 rounded-lg transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Ara Toplam */}
                      <div className="text-right min-w-[120px]">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Ara Toplam</p>
                        <p className="font-black text-gray-900 text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Silme */}
                      <button
                          onClick={() => handleDelete(item.productId)}
                          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center py-6 gap-2">
                  <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-2 border rounded-lg disabled:opacity-20 hover:bg-gray-50"
                  >
                    <ArrowRight className="rotate-180" size={20} />
                  </button>
                  <span className="text-sm font-bold px-4">Sayfa {page} / {totalPages}</span>
                  <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-2 border rounded-lg disabled:opacity-20 hover:bg-gray-50"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
            )}
          </div>

          {/* Sipariş Özeti Kartı */}
          <div className="lg:col-span-1">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl sticky top-24"
            >
              <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4">Sipariş Özeti</h2>

              <div className="space-y-4 mb-8 text-slate-400">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span className="text-white">{formatCurrency(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%20)</span>
                  <span className="text-white">Dahil</span>
                </div>
                <div className="flex justify-between items-center text-green-400 text-sm">
                  <span>Kargo</span>
                  <span className="border border-green-400/30 px-2 py-0.5 rounded-md uppercase text-[10px] font-bold">Bedava</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 mb-8">
                <p className="text-sm text-slate-500 uppercase font-bold mb-1">Ödenecek Tutar</p>
                <p className="text-4xl font-black text-blue-400">
                  {formatCurrency(cart.totalPrice)}
                </p>
              </div>

              <button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg
                ${loading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"}`}
              >
                {loading ? "İşleniyor..." : "ÖDEMEYE GEÇ"}
                {!loading && <ArrowRight size={20} />}
              </button>

              <p className="text-[10px] text-center text-slate-500 mt-6 uppercase tracking-widest">
                256-bit SSL Güvenli Ödeme
              </p>
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default Cart;