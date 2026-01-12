import { FC, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { updateModal } from "../redux/features/authSlice";
import { Link } from "react-router-dom";
import CustomPopup from "./CustomPopup";
import { updateDarkMode } from "../redux/features/homeSlice";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import SearchBar from "./SearchBar";

const Navbar: FC = () => {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Verileri Redux'tan alıyoruz
  const { username, role } = useAppSelector((state) => state.authReducer);
  const isDarkMode = useAppSelector((state) => state.homeReducer.isDarkMode);
  const cartCount = useAppSelector((state) => state.cartReducer.cartItems.length);

  const toggleTheme = () => {
    dispatch(updateDarkMode(!isDarkMode));
    document.body.classList.toggle("dark");
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="py-4 bg-white dark:bg-slate-800 top-0 sticky z-10 shadow-lg font-karla">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-4xl font-bold dark:text-white" data-test="main-logo">
      Demiray Hidrolik & Yapı Market
          </Link>

          <div className="hidden sm:block">
            <SearchBar onSearch={() => setIsMenuOpen(false)} />
          </div>

          <div className="hidden sm:flex gap-4 md:gap-8 items-center dark:text-white">
            <Link to="/products" className="text-xl font-bold hover:text-blue-500">
    Ürünler
            </Link>
            <Link to="/categories" className="text-xl font-bold hover:text-blue-500">
              Kategoriler
            </Link>

            {/* ADMIN KONTROLÜ: Sadece rol ADMIN ise görünür */}
            {role === "ADMIN" && (
              <Link to="/admin" className="text-xl font-bold text-red-500 hover:text-violet-300 transition-colors">
                Admin Paneli
              </Link>
            )}

            <div className="text-gray-500 text-2xl dark:text-white">
              {username !== "" ? (
                <CustomPopup />
              ) : (
                <span
                  className="cursor-pointer hover:opacity-85"
                  onClick={() => dispatch(updateModal(true))}
                  data-test="login-btn"
                >
                  Giriş
                </span>
              )}
            </div>

            <Link to="/cart" className="text-gray-500 text-[32px] relative hover:opacity-80" data-test="cart-btn">
              <AiOutlineShoppingCart className="dark:text-white" />
              <div className="absolute top-[-15px] right-[-10px] bg-red-600 w-[25px] h-[25px] rounded-full text-white text-[14px] grid place-items-center">
                {cartCount}
              </div>
            </Link>

            <div onClick={toggleTheme} className="cursor-pointer">
              {isDarkMode ? <MdOutlineLightMode size={30} /> : <MdOutlineDarkMode size={30} />}
            </div>
          </div>

          <button className="sm:hidden text-3xl dark:text-white z-30" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>

        {/* Mobil Menü */}
        {isMenuOpen && (
          <div className="sm:hidden fixed inset-0 top-0 bg-black bg-opacity-50 z-20">
            <div className="bg-white dark:bg-slate-800 h-full flex flex-col items-center justify-center gap-8 dark:text-white">
              <SearchBar onSearch={() => setIsMenuOpen(false)} />
              <Link to="/products" onClick={handleLinkClick}>Ürünler</Link>
              <Link to="/categories" onClick={handleLinkClick}>Kategoriler</Link>
              {role === "ADMIN" && (
                <Link to="/admin" onClick={handleLinkClick} className="text-red-500 font-bold">
                  Admin Paneli
                </Link>
              )}
              <Link to="/cart" onClick={handleLinkClick}>Sepet ({cartCount})</Link>
              <div onClick={toggleTheme}>{isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}</div>
              <button onClick={() => setIsMenuOpen(false)} className="mt-4 text-sm underline">Kapat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;