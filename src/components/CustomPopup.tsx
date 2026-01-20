import { FC, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  MdFavoriteBorder,
  MdOutlineAccountCircle,
  MdOutlineLogout,
} from "react-icons/md";
import { doLogout } from "../redux/features/authSlice";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../redux/AuthContext";

const CustomPopup: FC = () => {
  const dispatch = useAppDispatch();
  const [isVisible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Zamanlayıcı için ref

  const username = useAppSelector((state) => state.authReducer.username);
  const { setToken } = useContext(AuthContext)!;

  // Fare üzerine geldiğinde zamanlayıcıyı iptal et ve göster
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  // Fare ayrıldığında kısa bir gecikme ile kapat
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 200); // 200ms gecikme (kullanıcının menüye geçmesi için yeterli süre)
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    dispatch(doLogout());
    setVisible(false);
  };

  return (
      <div
          className="relative font-karla"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
      >
        {/* Kullanıcı İsmi */}
        <div
            className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-500 dark:text-white transition-colors py-2 font-bold"
            data-test="username-popup"
        >
          <MdOutlineAccountCircle className="text-xl" />
          <span className="truncate max-w-[120px]">{username}</span>
        </div>

        {/* Pop-up Menü */}
        {isVisible && (
            <div
                className="absolute right-0 md:left-[-50px] w-48 z-[100] mt-0 pt-2" // mt-0 ve pt-2 boşluğu kapatır
                onMouseEnter={handleMouseEnter} // Menüye girince açık tut
                onMouseLeave={handleMouseLeave} // Menüden çıkınca kapat
            >
              <div className="rounded-xl shadow-2xl bg-white border border-gray-100 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                <ul className="flex flex-col py-2 text-gray-700 dark:text-gray-200">
                  <li>
                    <Link
                        to="/account"
                        onClick={() => setVisible(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MdOutlineAccountCircle className="text-xl text-blue-500" />
                      <span className="font-medium">Hesabım</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                        to="/wishlist"
                        onClick={() => setVisible(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MdFavoriteBorder className="text-xl text-red-500" />
                      <span className="font-medium">Favorilerim</span>
                    </Link>
                  </li>
                  <li className="border-t border-gray-100 dark:border-slate-700 mt-1">
                    <div
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors cursor-pointer"
                    >
                      <MdOutlineLogout className="text-xl" />
                      <span className="font-medium">Çıkış Yap</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
        )}
      </div>
  );
};

export default CustomPopup;