import { useEffect, useState } from "react";
import { Config } from "../helpers/Config";

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function ProfileAddress() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Address | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [showNewForm, setShowNewForm] = useState<boolean>(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const storedUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!storedUserId) {
        setErrorMessage("Kullanıcı ID bulunamadı.");
        setLoading(false);
        return;
      }
   try {
  const res = await fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`);
  if (!res.ok) throw new Error("Adresler alınırken bir hata oluştu.");
  const data = await res.json();
  setAddresses(Array.isArray(data) ? data : [data]);
} catch (err: unknown) {
  if (err instanceof Error) {
    setErrorMessage(err.message);
  } else {
    setErrorMessage("Adresler alınırken bir hata oluştu.");
  }
} finally {
  setLoading(false);
}
    };
    fetchAddresses();
  }, [storedUserId]);




  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData || !storedUserId) return;
    try {
      const res = await fetch(
        `${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Adres güncellenemedi.");
      setAddresses(prev => prev.map(a => (a.id === formData.id ? formData : a)));
      setEditingId(null);
      setSuccessMessage("Adres başarıyla güncellendi.");
    } catch (err: unknown) {
  if (err instanceof Error) setErrorMessage(err.message);
  else setErrorMessage("Beklenmeyen bir hata oluştu.");
}
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!storedUserId || deleteId === null) return;
    try {
      const res = await fetch(
        `${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses/${deleteId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Adres silinemedi.");
      setAddresses(prev => prev.filter(a => a.id !== deleteId));
      setSuccessMessage("Adres başarıyla silindi.");
    } catch (err: unknown) {
  if (err instanceof Error) setErrorMessage(err.message);
  else setErrorMessage("Beklenmeyen bir hata oluştu.");
}
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleNewSave = async () => {
    if (!storedUserId) return;
    try {
      const res = await fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (!newAddress.street || !newAddress.city) return;
      if (!res.ok) throw new Error("Yeni adres eklenemedi.");
      const created = await res.json();
      setAddresses(prev => [...prev, created]);
      setSuccessMessage("Yeni adres başarıyla eklendi.");
      setShowNewForm(false);
      setNewAddress({ street: "", city: "", state: "", zipCode: "", country: "" });
    } catch (err: unknown) {
  if (err instanceof Error) {
    setErrorMessage(err.message);
  } else {
    setErrorMessage("Adres ekleme sırasında hata oluştu.");
  }
}
    

  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      <h2 className="text-2xl font-extrabold text-indigo-700">📍 Adres Bilgilerim</h2>

      {successMessage && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700 font-semibold shadow flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-green-600 rounded-full"></span>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-100 text-red-700 font-semibold shadow flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-red-600 rounded-full"></span>
          {errorMessage}
        </div>
      )}

      <button
        onClick={() => setShowNewForm(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        ➕ Yeni Adres Ekle
      </button>

      {showNewForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="street" placeholder="Mahalle" value={newAddress.street || ""} onChange={handleNewChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
            <input name="city" placeholder="Şehir" value={newAddress.city || ""} onChange={handleNewChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
            <input name="state" placeholder="İlçe" value={newAddress.state || ""} onChange={handleNewChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
            <input name="zipCode" placeholder="Tam Adres" value={newAddress.zipCode || ""} onChange={handleNewChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
            <input name="country" placeholder="Türkiye" value={newAddress.country || ""} onChange={handleNewChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={handleNewSave} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
              Kaydet
            </button>
            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition">
              İptal
            </button>
          </div>
        </div>
      )}

      {addresses.length === 0 && (
        <div className="text-gray-500 italic">Kayıtlı adres bulunamadı.</div>
      )}

      {addresses.map(addr => (
        <div
          key={addr.id}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-md space-y-2 hover:shadow-lg transition"
        >
          {editingId === addr.id ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="street" value={formData?.street || ""} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
                <input name="city" value={formData?.city || ""} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
                <input name="state" value={formData?.state || ""} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
                <input name="zipCode" value={formData?.zipCode || ""} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
                <input name="country" value={formData?.country || ""} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">Kaydet</button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition">İptal</button>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-lg text-gray-800">{addr.street}</p>
              <p className="text-sm text-gray-600">{addr.state} / {addr.city}</p>
              <p className="text-sm text-gray-500">{addr.zipCode} · {addr.country}</p>
              <div className="flex gap-4 mt-3">
                <button onClick={() => handleEdit(addr)} className="text-indigo-600 text-sm font-medium hover:underline">✏️ Düzenle</button>
                <button onClick={() => confirmDelete(addr.id)} className="text-red-600 text-sm font-medium hover:underline">🗑️ Sil</button>
              </div>
            </>
          )}
        </div>
      ))}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Silmek istediğine emin misin?</h3>
            <p className="text-sm text-gray-600">Bu işlem geri alınamaz.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}















/*import { useEffect, useState } from "react";
import { Config } from "../helpers/Config";

interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function ProfileAddress() {
 const [addresses, setAddresses] = useState<Address[]>([]);
   const [loading, setLoading] = useState(true);

  const storedUserId = localStorage.getItem("userId");
  console.log("Apiden dönen adres verisi:", addresses);
  console.log("Apiden dönen userid verisi:"+  storedUserId)  ;

useEffect(() => {
  if (!storedUserId) return;

  fetch(`${Config.api.baseUrl}/api/v1/users/${storedUserId}/addresses`)
    .then(res => res.json())
    .then(data => setAddresses(data))
    .finally(() => setLoading(false));
}, [storedUserId]);

  

if (loading) return <div>Yükleniyor...</div>;
if (addresses.length === 0) return <div>Adres bulunamadı</div>;
return (
  <div>
    {addresses.map(addr => (
      <div key={addr.id}>
        <p>{addr.street}</p>
        <p>{addr.state} / {addr.city}</p>
        <p>{addr.zipCode} - {addr.country}</p>
      </div>
    ))}
  </div>
);
}
*/

