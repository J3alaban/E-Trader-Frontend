import { useEffect, useState } from "react";
import { Config } from "../helpers/Config";

// Yeni eklenen Adres arayüzü
interface Address {
    id: number;
    title: string;
    city: string;
    district: string;
    fullAddress: string;
}

interface OrderItem {
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
}

interface Order {
    id: number;
    userId: number | null;
    orderDate: string;
    totalPrice: number;
    items: OrderItem[];
    address: Address | null; // addressId -> address olarak güncellendi
    status: string | null;
}

const AllOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(
                    `${Config.api.baseUrl}/api/v1/orders`
                );

                if (!response.ok) {
                    throw new Error("Siparişler alınamadı");
                }

                const data: Order[] = await response.json();
                setOrders(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Bilinmeyen bir hata oluştu");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter((order) => {
        const searchLower = searchTerm.toLowerCase();

        return (
            order.id.toString().includes(searchLower) ||
            order.userId?.toString().includes(searchLower) ||
            order.status?.toLowerCase().includes(searchLower) ||
            // Arama filtresine şehir veya ilçe bilgisini de ekleyebiliriz
            order.address?.city.toLowerCase().includes(searchLower) ||
            order.items.some(item => item.productName.toLowerCase().includes(searchLower))
        );
    });

    const getStatusColor = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case "tamamlandı": return "bg-green-100 text-green-700";
            case "beklemede": return "bg-yellow-100 text-yellow-700";
            case "iptal": return "bg-red-100 text-red-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-2xl mx-auto mt-10 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tüm Siparişler</h2>
                        <p className="mt-1 text-sm text-gray-500">Toplam {filteredOrders.length} sonuç listeleniyor.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Sipariş, Ürün veya Şehir ara..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-medium">Aradığınız kriterlere uygun sipariş bulunamadı.</p>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                        >
                            Aramayı Temizle
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sipariş</span>
                                        <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status ?? "İşleniyor"}
                                        </span>
                                        <span className="text-sm text-gray-500 italic">
                                            {new Date(order.orderDate).toLocaleString("tr-TR")}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-900 border-b pb-1">Müşteri & Teslimat</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium text-gray-800">Kullanıcı ID:</span> {order.userId ?? "Bilinmiyor"}</p>

                                            {/* Adres Bilgisi Kontrolü */}
                                            {order.address ? (
                                                <div className="mt-2 pt-2 border-t border-gray-50">
                                                    <p className="font-bold text-gray-800 text-xs uppercase">{order.address.title}</p>
                                                    <p>{order.address.district} / {order.address.city}</p>
                                                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{order.address.fullAddress}</p>
                                                </div>
                                            ) : (
                                                <p className="text-red-400 italic">Adres bilgisi bulunamadı</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-900 border-b pb-1">Ürünler</h4>
                                        <ul className="divide-y divide-gray-100">
                                            {order.items.map((item, index) => (
                                                <li key={index} className="py-2 flex justify-between text-sm italic">
                                                    <span className="text-gray-700">{item.productName} <span className="text-gray-400 font-normal">x{item.quantity}</span></span>
                                                    <span className="font-medium text-gray-900">{item.productPrice.toLocaleString("tr-TR")} ₺</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end items-center">
                                    <span className="text-sm text-gray-500 mr-2">Toplam:</span>
                                    <span className="text-xl font-extrabold text-indigo-600">
                                        {order.totalPrice.toLocaleString("tr-TR")} ₺
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllOrdersPage;