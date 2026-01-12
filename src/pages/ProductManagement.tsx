import { useState, useEffect } from "react";
import { Config } from "../helpers/Config";
import {  useAppDispatch } from "../redux/hooks";
import { updateLoading } from "../redux/features/homeSlice";
 //import { addProducts } from "../redux/features/productSlice";

type ProductBody = {
  id?: number; // Ekleme yaparken id olmayabilir
  title: string;
  description: string;
  price: number;
  stock: number;
  categorySlug: string;
  brand: string;
  sku: string;
  discountPercentage: number;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  images: string[];
  size : string; 
};

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<ProductBody[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
    const dispatch = useAppDispatch();


  // Boş form şablonu
  const emptyForm: ProductBody = {
    title: "", description: "", price: 0, stock: 0,
    categorySlug: "", brand: "", sku: "", discountPercentage: 0,
    weight: 0, dimensions: { width: 0, height: 0, depth: 0 }, images: [] 
    , size : ""
  };

  const [form, setForm] = useState<ProductBody>(emptyForm);


useEffect(() => {
  dispatch(updateLoading(true));

  fetch(`${Config.api.baseUrl}/api/v1/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(res => res.json())
    .then((data: Category[]) => {
      setCategories(data);
      localStorage.setItem("categories", JSON.stringify(data));
    })
    .catch(err => {
      console.error("Kategoriler yüklenirken hata:", err);
    })
    .finally(() => {
      dispatch(updateLoading(false));
    });
}, [dispatch]);






 /* 
 useEffect(() => {
  const cached = localStorage.getItem("categories");
  if (cached) {
    setCategories(JSON.parse(cached));
  } else {
    fetch(`${Config.api.baseUrl}/api/v1/categories`)
      .then(res => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        localStorage.setItem("categories", JSON.stringify(data));
      })
      .catch(err => console.error("Kategori yüklenemedi", err));
  }
}, []);  */ 



  // Verileri Yükle Local Storage ile  
  /*
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("products") || "[]");
    setProducts(stored);
  }, []);      */ 


  useEffect(() => {
  dispatch(updateLoading(true));

  fetch(`${Config.api.baseUrl}/api/v1/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(res => res.json())
    .then((data: { content: ProductBody[] }) => {
      const productIds = data.content.map(p => p.id);

      localStorage.setItem("productIds", JSON.stringify(productIds));
      localStorage.setItem("products", JSON.stringify(data.content));

      setProducts(data.content); // local state
 
    })
    .finally(() => {
      dispatch(updateLoading(false));
    });

}, [dispatch]);





  
  // Modal Açma (Ekleme veya Güncelleme için)
const openModal = (product?: ProductBody) => {
  if (product) {
    // Düzenleme modunda formun tüm alanlarını (categorySlug dahil) dolduruyoruz
    setForm({
      ...product,
      // Eğer product içindeki kategori bilgisi boşsa veya farklı bir isimdeyse 
      // burada eşleştiğinden emin olmalısın
      categorySlug: product.categorySlug || "" 
    });
    setIsEditing(true);
  } else {
    setForm(emptyForm);
    setIsEditing(false);
  }
  setIsModalOpen(true);
};




  // Silme İşlemi
  const deleteProduct = async (id: number) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch(`${Config.api.baseUrl}/api/v1/products/${id}`, { method: "DELETE" });
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
  };

  // Kaydetme İşlemi (Hem Ekleme Hem Güncelleme)
  const handleSave = async () => {
    const url = isEditing 
      ? `${Config.api.baseUrl}/api/v1/products/${form.id}`
      : `${Config.api.baseUrl}/api/v1/products`;
    
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      // Local storage ve state güncelleme simülasyonu
      const updatedList = isEditing 
        ? products.map(p => p.id === form.id ? form : p)
        : [...products, { ...form, id: Math.random() }]; // Gerçek API'de id dönecektir
      
      setProducts(updatedList);
      localStorage.setItem("products", JSON.stringify(updatedList));
      setIsModalOpen(false);
    }
  };




  

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left">Ürün Yönetim Paneli</h1>
            <p className="text-gray-500 text-sm">Toplam {products.length} kayıtlı ürün bulundu.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Yeni Ürün Ekle
          </button>
        </div>

        {/* Tablo Konteynırı (Responsive için overflow-x-auto) */}
     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    {/* Burada max-h ekliyoruz */}
    <div className="max-h-[720px] overflow-y-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            <th className="px-6 py-4">Ürün</th>
            <th className="px-6 py-4 hidden md:table-cell">Kategori/Marka</th>
            <th className="px-6 py-4 text-center">Fiyat & Stok</th>
            <th className="px-6 py-4 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-800">{p.title}</div>
                <div className="text-xs text-gray-500 md:hidden">{p.brand}</div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <div className="text-sm text-gray-700">{p.categorySlug}</div>
                <div className="text-xs text-gray-400">{p.brand}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="text-sm font-bold text-indigo-600">{p.price} TL</div>
                <div
                  className={`text-[10px] font-bold uppercase ${
                    p.stock < 5 ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  Stok: {p.stock}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal(p)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => p.id && deleteProduct(p.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

      </div>

      {/* Dinamik Modal (Ekle/Güncelle) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Ürünü Güncelle' : 'Yeni Ürün Ekle'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form Alanları */}
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ürün Başlığı</label>
                <input className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Fiyat</label>
                <input type="number" className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Stok</label>
                <input type="number" className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={form.stock} onChange={e => setForm({...form, stock: +e.target.value})} />
              </div>

<div className="space-y-1">
  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
    Beden / Size
  </label>
  <input
    type="text"
    className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
    value={form.size}
    onChange={(e) => setForm({ ...form, size: e.target.value })}
    placeholder="S, M, L, XL"
  />
</div>




<div className="space-y-1">
  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Kategori</label>
  <div className="relative"> {/* Ok ikonu için sarmalayıcı */}
<select
  className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
  value={form.categorySlug}
  onChange={(e) => {
    setForm({ ...form, categorySlug: e.target.value });
    e.target.blur(); // Seçim yapınca listeyi kapat
  }}
  // 8'den fazla kategori varsa ve kutuya tıklandıysa boyutu 8 yap, yoksa normal kalsın
  onFocus={(e) => (e.target.size = categories.length > 8 ? 8 : 1)}
  onBlur={(e) => (e.target.size = 1)}
>
  <option value="">Kategori Seçiniz</option>
  {categories.map((c) => (
    <option key={c.id} value={c.slug} className="py-2">
      {c.name}
    </option>
  ))}
</select>

    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>

 {/*------------------------------------- */} 

<div className="col-span-1 md:col-span-2 space-y-1">
  <label className="text-xs font-bold text-gray-400 uppercase ml-1">
    Ürün Fotoğrafları ({form.images?.length || 0} / 5)
  </label>
  <div className="flex flex-wrap gap-2 border border-gray-200 p-2 rounded-xl bg-gray-50/50">
    {/* Önizleme Resimleri */}
    {form.images?.map((img, index) => (
      <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-indigo-200">
        <img src={img} className="w-full h-full object-cover" />
        <button 
          onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })}
          className="absolute top-0 right-0 bg-red-500 text-white text-[10px] p-0.5"
        >✕</button>
      </div>
    ))}
    
    {/* Ekleme Butonu */}
    {(!form.images || form.images.length < 5) && (
      <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
        <span className="text-gray-400 text-xl">+</span>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
  onChange={(e) => {
  const files = Array.from(e.target.files || []);
  const limit = 5 - (form.images?.length || 0);
  
  files.slice(0, limit).forEach(file => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // "as string" ekleyerek TypeScript hatasını gideriyoruz
      const base64String = reader.result as string; 
      
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), base64String]
      }));
    };
    reader.readAsDataURL(file);
  });
}}
        />
      </label>
    )}
  </div>
</div>
{/* Resimleri Listeleme ve Silme Butonu */}
<div className="flex flex-wrap gap-2 mb-4">
  {form.images?.map((img, index) => (
    <div key={index} className="relative group w-20 h-20 shadow-sm border rounded-lg overflow-hidden">
      <img src={img} className="w-full h-full object-cover" />
      
      {/* Silme Butonu: Sadece diziden çıkarır */}
      <button
        type="button"
        onClick={() => {
          const filteredImages = form.images.filter((_, i) => i !== index);
          setForm({ ...form, images: filteredImages });
        }}
        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  ))}
</div>



 {/*------------------------------------- */} 






              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Marka</label>
                <input className="w-full border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
  <label className="text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">
    Ürün Açıklaması
  </label>

  <textarea
    rows={4}
    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 resize-none"
    placeholder="Ürün detaylarını, özelliklerini ve kullanım alanlarını belirtiniz..."
    value={form.description} // State'deki mevcut açıklamayı buraya bağladık
    onChange={(e) => setForm({ ...form, description: e.target.value })}
  />
</div>
              {/* Daha fazla alan eklenebilir... */}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-semibold text-gray-500">Vazgeç</button>
              <button onClick={handleSave} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
                {isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement ;