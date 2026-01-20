import { FC, useState, useEffect } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { updateModal } from "../redux/features/authSlice";
import { Link } from "react-router-dom";
import CustomPopup from "./CustomPopup";
import { updateDarkMode } from "../redux/features/homeSlice";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import SearchBar from "./SearchBar";
import { Config } from "../helpers/Config";

const Navbar: FC = () => {
    const dispatch = useAppDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // API'den gelecek sepet sayısı için yerel state
    const [dynamicCartCount, setDynamicCartCount] = useState(0);

    const { username, role } = useAppSelector((state) => state.authReducer);
    const isDarkMode = useAppSelector((state) => state.homeReducer.isDarkMode);

    // localStorage'dan userId alıyoruz
    const storedUserId = localStorage.getItem("userId");

    // DİNAMİK SEPET VERİSİ ÇEKME
    useEffect(() => {
        const fetchCartCount = async () => {
            if (!storedUserId) {
                setDynamicCartCount(0);
                return;
            }

            try {
                const res = await fetch(`${Config.api.baseUrl}/api/v1/carts/${storedUserId}`);
                if (res.ok) {
                    const data = await res.json();
                    // items dizisinin uzunluğunu sepet sayısı olarak belirliyoruz
                    setDynamicCartCount(data.items?.length || 0);
                }
            } catch (err) {
                console.error("Navbar sepet sayısı çekme hatası:", err);
            }
        };

        fetchCartCount();

        // Sepet sayfasında yapılan değişiklikleri yakalamak için
        // bir event listener veya interval eklenebilir. Şimdilik giriş/sayfa yüklemesi bazlı.
    }, [storedUserId, username]); // Kullanıcı değiştiğinde veya giriş yaptığında tetiklenir

    const toggleTheme = () => {
        dispatch(updateDarkMode(!isDarkMode));
        document.body.classList.toggle("dark");
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="py-4 bg-white dark:bg-slate-800 top-0 sticky z-50 shadow-lg font-karla">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-2xl md:text-3xl font-bold dark:text-white" data-test="main-logo">
                        Demiray Hidrolik
                    </Link>

                    <div className="hidden sm:block flex-1 max-w-xs md:max-w-md mx-4">
                        <SearchBar onSearch={() => setIsMenuOpen(false)} />
                    </div>

                    <div className="hidden sm:flex gap-4 md:gap-6 items-center dark:text-white">
                        <Link to="/products" className="text-lg font-bold hover:text-blue-500">Ürünler</Link>
                        <Link to="/categories" className="text-lg font-bold hover:text-blue-500">Kategoriler</Link>

                        {role === "ADMIN" && (
                            <Link to="/admin" className="text-lg font-bold text-red-500 hover:text-red-400">Admin</Link>
                        )}

                        <div className="text-gray-500 text-xl dark:text-white">
                            {username !== "" ? <CustomPopup /> : (
                                <span className="cursor-pointer hover:text-blue-500 font-bold" onClick={() => dispatch(updateModal(true))}>
                                    Giriş
                                </span>
                            )}
                        </div>

                        <Link to="/cart" className="text-gray-500 text-[32px] relative" data-test="cart-btn">
                            <AiOutlineShoppingCart className="dark:text-white" />
                            {/* Dinamik Sayı Burada Gösteriliyor */}
                            <div className="absolute top-[-10px] right-[-10px] bg-red-600 w-5 h-5 rounded-full text-white text-xs grid place-items-center">
                                {dynamicCartCount}
                            </div>
                        </Link>

                        <div onClick={toggleTheme} className="cursor-pointer">
                            {isDarkMode ? <MdOutlineLightMode size={25} /> : <MdOutlineDarkMode size={25} />}
                        </div>
                    </div>

                    <button className="sm:hidden text-3xl dark:text-white z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? "✕" : "☰"}
                    </button>
                </div>

                {/* Mobil Menü */}
                {isMenuOpen && (
                    <div className="sm:hidden fixed inset-0 top-0 bg-white dark:bg-slate-900 z-40">
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-xl font-bold dark:text-white">
                            <div className="w-full px-8 mb-4">
                                <SearchBar onSearch={() => setIsMenuOpen(false)} />
                            </div>

                            <div className="mb-2">
                                {username !== "" ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-sm text-gray-400 font-normal">Hesabım</span>
                                        <CustomPopup />
                                    </div>
                                ) : (
                                    <button
                                        className="bg-blue-600 text-white px-10 py-2 rounded-lg text-lg"
                                        onClick={() => { dispatch(updateModal(true)); setIsMenuOpen(false); }}
                                    >
                                        Giriş Yap
                                    </button>
                                )}
                            </div>

                            <Link to="/products" onClick={handleLinkClick}>Ürünler</Link>
                            <Link to="/categories" onClick={handleLinkClick}>Kategoriler</Link>
                            {/* Mobil Sepet Sayısı */}
                            <Link to="/cart" onClick={handleLinkClick}>Sepet ({dynamicCartCount})</Link>

                            {role === "ADMIN" && (
                                <Link to="/admin" onClick={handleLinkClick} className="text-red-500">Admin Paneli</Link>
                            )}

                            <div onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer text-sm font-normal mt-4">
                                {isDarkMode ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
                                {isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}
                            </div>

                            <button onClick={() => setIsMenuOpen(false)} className="mt-8 text-gray-400 text-sm font-normal">Kapat</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;