import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateLoading } from "../redux/features/homeSlice";
import { Config } from "../helpers/Config";

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentResponse {
  id: number;
  transactionId: string;
  amount: number;
  currency: string;
  paymentDate: string;
}

interface Card {
  id: number;
  cardNumber: string;
  expireDate: string;
  cvv: string;
}

type MsgType = "success" | "error" | "info";

const PaymentPage: FC = () => {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.homeReducer.isLoading);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newExpireDate, setNewExpireDate] = useState("");
  const [newCvv, setNewCvv] = useState("");

  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editCardNumber, setEditCardNumber] = useState("");
  const [editExpireDate, setEditExpireDate] = useState("");
  const [editCvv, setEditCvv] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MsgType>("info");

  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Helper fonksiyonlar */
  const formatCardNumber = (num: string) => num.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  const formatExpireDate = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length >= 4) return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return cleaned;
  };
  const formatCvv = (val: string) => val.replace(/\D/g, "").slice(0, 4);

  const showMessage = (text: string, type: MsgType = "info", duration = 3500) => {
    setMessage(text);
    setMessageType(type);
    if (duration > 0) {
      const timer = window.setTimeout(() => setMessage(null), duration);
      return () => clearTimeout(timer);
    }
  };

  /* ADRESLER */
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) return;

    fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`)
      .then(res => res.json())
      .then(data => setAddresses(data))
      .catch(() => setAddresses([]));
  }, []);

  /* KARTLARI GETİR */
  const fetchCards = () => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) return;

    fetch(`${Config.api.baseUrl}/api/v1/cards/${storedUserId}`)
      .then(res => res.json())
      .then((data: { id: number; maskedCardNumber: string; expireDate: string }[]) => {
        const mappedCards = data.map(c => ({
          id: c.id,
          cardNumber: c.maskedCardNumber,
          expireDate: c.expireDate,
          cvv: "",
        }));
        setCards(mappedCards);
      })
      .catch(() => setCards([]));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  /* KART EKLE */
  const handleAddCard = () => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId || !newCardNumber || !newExpireDate || !newCvv) {
      showMessage("Lütfen tüm kart bilgilerini doldurun.", "error");
      return;
    }

    fetch(`${Config.api.baseUrl}/api/v1/cards/${storedUserId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardNumber: newCardNumber.replace(/\s/g, ""),
        expireDate: newExpireDate,
        cvv: newCvv,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.status !== 204 ? res.json() : null;
      })
      .then(() => {
        fetchCards();
        setNewCardNumber("");
        setNewExpireDate("");
        setNewCvv("");
        setShowModal(false);
        showMessage("Kart başarıyla eklendi.", "success");
      })
      .catch(() => {
        setError("Kart ekleme sırasında hata oluştu");
        showMessage("Kart eklenirken hata oluştu.", "error");
      });
  };

  /* KART GÜNCELLE */
  const handleUpdateCard = (cardId: number) => {
    const cardToUpdate = cards.find(c => c.id === cardId);
    if (!cardToUpdate) {
      showMessage("Güncellenecek kart bulunamadı.", "error");
      return;
    }

    const payload = {
      cardNumber: editCardNumber.replace(/\s/g, "") || cardToUpdate.cardNumber.replace(/\s/g, ""),
      expireDate: editExpireDate || cardToUpdate.expireDate,
      cvv: editCvv || cardToUpdate.cvv,
    };

    fetch(`${Config.api.baseUrl}/api/v1/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.status !== 204 ? res.json() : null;
      })
      .then(() => {
        fetchCards();
        setEditingCardId(null);
        setEditCardNumber("");
        setEditExpireDate("");
        setEditCvv("");
        showMessage("Kart başarıyla güncellendi.", "success");
      })
      .catch(() => {
        setError("Kart güncelleme sırasında hata oluştu");
        showMessage("Kart güncellenirken hata oluştu.", "error");
      });
  };

  /* KART SİL */
  const handleDeleteCard = (cardId: number) => {
    fetch(`${Config.api.baseUrl}/api/v1/cards/${cardId}`, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) throw new Error();
        fetchCards();
        if (selectedCardId === cardId) setSelectedCardId(null);
        setDeleteConfirmId(null);
        showMessage("Kart başarıyla silindi.", "success");
      })
      .catch(() => {
        setError("Kart silme sırasında hata oluştu");
        showMessage("Kart silinirken hata oluştu.", "error");
      });
  };

  /* ÖDEME */
  const handlePayment = () => {
    if (!orderId || !selectedAddressId || !selectedCardId) {
      showMessage("Lütfen adres ve kart seçin.", "error");
      return;
    }

    const selectedCard = cards.find(c => c.id === selectedCardId);
    if (!selectedCard) {
      showMessage("Seçili kart bulunamadı.", "error");
      return;
    }

    dispatch(updateLoading(true));
    setError(null);

    fetch(`${Config.api.baseUrl}/api/v1/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: Number(orderId),
        addressId: selectedAddressId,
        method: "CREDIT_CARD",
        card: {
          cardNumber: selectedCard.cardNumber.replace(/\s/g, ""),
          expireDate: selectedCard.expireDate,
          cvv: selectedCard.cvv,
        },
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.status !== 204 ? res.json() : null;
      })
      .then(data => {
        setResult(data);
        showMessage("Ödeme başarılı.", "success");
      })
      .catch(() => {
        setError("Ödeme sırasında hata oluştu");
        showMessage("Ödeme sırasında hata oluştu.", "error");
      })
      .finally(() => dispatch(updateLoading(false)));
  };

  return (
    <div className="container mx-auto min-h-[83vh] p-6 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 relative">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-indigo-700">💳 Ödeme Sayfası</h2>

        {/* GLOBAL MESAJ */}
        {message && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-4 w-[90%] max-w-[520px] z-20 ${
              messageType === "success"
                ? "bg-green-50 border-green-200"
                : messageType === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            } border p-3 rounded-lg shadow-sm flex items-center justify-between`}
          >
            <div
              className={`${
                messageType === "success"
                  ? "text-green-800"
                  : messageType === "error"
                  ? "text-red-800"
                  : "text-blue-800"
              } text-sm`}
            >
              {message}
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 ml-3" aria-label="Kapat mesaj">
              ✕
            </button>
          </div>
        )}

        {/* ADRES SEÇİMİ */}
        <label className="block text-sm font-semibold mb-2 text-gray-700">Adres Seç</label>
        <select className="w-full border p-2 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500" value={selectedAddressId ?? ""} onChange={e => setSelectedAddressId(Number(e.target.value))}>
          <option value="">Adres Seç</option>
          {addresses.map(a => (
            <option key={a.id} value={a.id}>
              {a.street}, {a.state} / {a.city}
            </option>
          ))}
        </select>

        {/* KART SEÇİMİ */}
        <label className="block text-sm font-semibold mb-2 text-gray-700">Kart Seç</label>
        <select className="w-full border p-2 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500" value={selectedCardId ?? ""} onChange={e => setSelectedCardId(Number(e.target.value))}>
          <option value="">Kart Seç</option>
          {cards.map(c => (
            <option key={c.id} value={c.id}>
              {c.cardNumber} (Son: {c.expireDate})
            </option>
          ))}
        </select>

        <div className="flex gap-3 mb-4">
          <button onClick={() => setShowModal(true)} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition">
             Yeni Kart Ekle / Yönet
          </button>

          <button onClick={handlePayment} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
            Kart ile Öde
          </button>
        </div>

        {isLoading && <p className="mt-3 text-indigo-600">Ödeme yapılıyor...</p>}
        {error && <p className="text-red-500 mt-3">{error}</p>}
        {result && (
          <div className="mt-4 text-green-600 text-center font-semibold">
            ✔ Ödeme Başarılı <br />
            {result.amount} {result.currency}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo-700">Kartlarım</h3>
              <button onClick={() => { setShowModal(false); setEditingCardId(null); setDeleteConfirmId(null); }} className="text-gray-500 hover:text-gray-700" aria-label="Kapat">✕</button>
            </div>

            {/* Kart Listesi */}
            <div className="space-y-3 max-h-64 overflow-auto mb-4">
              {cards.length === 0 && <p className="text-sm text-gray-500">Kayıtlı kart yok.</p>}
              {cards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{card.cardNumber}</div>
                    <div className="text-xs text-gray-500">Son: {card.expireDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedCardId(card.id); setEditingCardId(card.id); setEditCardNumber(card.cardNumber); setEditExpireDate(card.expireDate); setEditCvv(""); }} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition">
                      Düzenle
                    </button>
                    <button onClick={() => setDeleteConfirmId(card.id)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition">
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Kart Düzenleme */}
            {editingCardId && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Kartı Düzenle</h4>
                <input className="w-full border p-2 rounded mb-2 focus:ring-2 focus:ring-indigo-500" placeholder="Kart Numarası" value={editCardNumber} onChange={e => setEditCardNumber(formatCardNumber(e.target.value))} />
                <div className="flex gap-2 mb-2">
                  <input className="w-1/2 border p-2 rounded focus:ring-2 focus:ring-indigo-500" placeholder="AA YY" value={editExpireDate} onChange={e => setEditExpireDate(formatExpireDate(e.target.value))} />
                  <input className="w-1/2 border p-2 rounded focus:ring-2 focus:ring-indigo-500" placeholder="CVV" value={editCvv} onChange={e => setEditCvv(formatCvv(e.target.value))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdateCard(editingCardId)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition">Kaydet</button>
                  <button onClick={() => { setEditingCardId(null); setEditCardNumber(""); setEditExpireDate(""); setEditCvv(""); }} className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition">İptal</button>
                </div>
              </div>
            )}

            {/* Yeni Kart Ekle */}
            <div className="mb-4 p-4 border rounded-lg bg-white">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Yeni Kart Ekle</h4>
              <input className="w-full border p-2 rounded mb-2 focus:ring-2 focus:ring-indigo-500" placeholder="Kart Numarası" value={newCardNumber} onChange={e => setNewCardNumber(formatCardNumber(e.target.value))} />
              <div className="flex gap-2 mb-3">
                <input className="w-1/2 border p-2 rounded focus:ring-2 focus:ring-indigo-500" placeholder="AA YY" value={newExpireDate} onChange={e => setNewExpireDate(formatExpireDate(e.target.value))} />
                <input className="w-1/2 border p-2 rounded focus:ring-2 focus:ring-indigo-500" placeholder="CVV" value={newCvv} onChange={e => setNewCvv(formatCvv(e.target.value))} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddCard} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition">Kart Ekle</button>
                <button onClick={() => { setNewCardNumber(""); setNewExpireDate(""); setNewCvv(""); }} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition">Temizle</button>
              </div>
            </div>

            {/* Silme Onayı */}
            {deleteConfirmId && (
              <div className="mt-2 p-3 border rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-red-700">Bu kartı silmek istediğinize emin misiniz?</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteCard(deleteConfirmId)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Evet, Sil</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition">Vazgeç</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;




