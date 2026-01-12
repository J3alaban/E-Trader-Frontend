import ProductManagement from "./ProductManagement";
import CategoryManagement from "./CategoryManagement";
const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sol Sütun: Ürün Yönetimi (%75 civarı) */}
        <div className="lg:col-span-8">
          <ProductManagement />
        </div>

        {/* Sağ Sütun: Kategori Yönetimi (%25 civarı) */}
        <div className="lg:col-span-4 space-y-6">
          <CategoryManagement />
          {/* İstersen buraya hızlı istatistik kartları da ekleyebiliriz */}
        </div>

      </div>
    </div>
  );
};
export default AdminPage; 