import { FileText, Download, Eye, Gavel } from 'lucide-react';

const documents = [
    { id: 1, name: 'Mesafeli Satış Sözleşmesi', fileName: 'demiray Mesafeli Satış Sözleşmesi.docx' },
    { id: 2, name: 'Kargo ve Teslimat', fileName: 'demiray Kargo ve Teslimat.docx' },
    { id: 3, name: 'Kullanım Koşulları', fileName: 'demiray Üyelik ve Kullanım Şartları.docx' },
    { id: 4, name: 'İptal ve İade Koşulları', fileName: 'demiray İptal ve İade Şartları.docx' },
    { id: 5, name: 'Gizlilik Politikası', fileName: 'demiray Gizlilik Politikası.docx' },
];

const Documents = () => {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <Gavel className="text-blue-600" size={32} />
                    <h2 className="text-2xl font-bold text-gray-800">Hukuki Belgeler ve Sözleşmeler</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="group flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-700">{doc.name}</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider italic">DOCX Belgesi</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <a
                                    href={`/${doc.fileName}`}
                                    download
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="İndir"
                                >
                                    <Download size={20} />
                                </a>
                                <a
                                    href={`/${doc.fileName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                    title="Görüntüle"
                                >
                                    <Eye size={20} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-sm text-center text-gray-500 italic">
                    * Yukarıdaki belgeler en son 2024 mevzuatına uygun olarak güncellenmiştir.
                </p>
            </div>
        </div>
    );
};

export default Documents;