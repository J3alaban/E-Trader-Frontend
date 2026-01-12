import { useEffect, useState } from "react";
import { Config } from "../helpers/Config";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string; // ➤ API için gerekli
}

export default function ProfileUser() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const storedUserId = localStorage.getItem("userId");  //başka bileşenlerde kullnamk üzere userId
   

  // Profil verisini çek
  useEffect(() => {
    if (!storedUserId) return;
    fetch(`${Config.api.baseUrl}/api/v1/auth/${storedUserId}/profile`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFormData(data);
      })
      .catch(() => setError("Profil yüklenirken bir sorun oluştu"));
  }, [storedUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    if (!formData || !storedUserId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(
        `${Config.api.baseUrl}/api/v1/auth/${storedUserId}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), // ➤ password dahil
        }
      );

      if (!response.ok) throw new Error("Update failed");

      const updatedUser = await response.json();
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditing(false);
      setSaved(true);
    } catch {
      setError("Güncelleme sırasında bir hata oluştu , şifrenizi girip yeniden deneyin.");
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600 text-lg">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-800">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-indigo-600 font-medium">{user.email}</p>
        </div>

        <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4 shadow-inner">
          {isEditing ? (
            <>
              <input
                type="text"
                name="firstName"
                value={formData?.firstName || ""}
                onChange={handleChange}
                placeholder="Ad"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="lastName"
                value={formData?.lastName || ""}
                onChange={handleChange}
                placeholder="Soyad"
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                name="email"
                value={formData?.email || ""}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="phone"
                value={formData?.phone || ""}
                onChange={handleChange}
                placeholder="Telefon"
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                name="password"
                value={formData?.password || ""}
                onChange={handleChange}
                placeholder="Şifre"
                className="w-full p-2 border rounded"
              />
            </>
          ) : (
            <>
              <p><span className="font-semibold">Ad:</span> {user.firstName}</p>
              <p><span className="font-semibold">Soyad:</span> {user.lastName}</p>
              <p><span className="font-semibold">Email:</span> {user.email}</p>
              <p><span className="font-semibold">Telefon:</span> {user.phone ?? "-"}</p>
            </>
          )}
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {saved && <div className="text-green-600">Bilgiler güncellendi.</div>}

        <div className="flex justify-center space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-colors"
            >
             Düzenle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}




