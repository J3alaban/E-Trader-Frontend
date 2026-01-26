import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, PackageCheck } from "lucide-react";
import { Config } from "../helpers/Config.tsx";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const storedUserId = localStorage.getItem("userId");

    useEffect(() => {
        // Ödeme başarılı → sepet temizle
        if (storedUserId) {
            fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}`, {
                method: "DELETE",
            }).catch(() => {});
        }
    }, [storedUserId]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 font-karla">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full bg-white shadow-2xl rounded-[3rem] p-10 text-center relative"
            >
                <div className="flex justify-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="bg-green-100 p-5 rounded-full relative"
                    >
                        <CheckCircle size={64} className="text-green-600" />
                        <PackageCheck
                            size={22}
                            className="absolute -top-1 -right-1 text-green-500"
                        />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4">
                    Ödeme Başarıyla Tamamlandı
                </h1>

                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    Ödemeniz güvenli bir şekilde alındı.
                    Siparişiniz işleme alındı ve kısa süre içinde hazırlanacaktır.
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all"
                >
                    Ana Sayfaya Dön <ArrowRight size={18} />
                </button>

                <div className="mt-6 text-xs text-gray-400 font-semibold tracking-wide uppercase">
                    Güvenli ödeme • iyzico
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
