import { FC, FormEvent, useContext, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { doLogin, updateModal } from "../redux/features/authSlice";
import { AuthContext } from "../redux/AuthContext";
import { FaUnlock } from "react-icons/fa";
import { RiLockPasswordFill, RiUser3Fill } from "react-icons/ri";
import { RxCross1 } from "react-icons/rx";
import { Config } from "../helpers/Config";
import { Link } from "react-router-dom";

const LoginModal: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const open = useAppSelector(state => state.authReducer.modalOpen);
  const { setToken } = useContext(AuthContext)!;

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const API_URL = Config.api.baseUrl;

      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Giriş başarısız! Şifrenizi kontrol edin.");
        return;
      }

      const data = await res.json();
      console.log("Login verisi : ", data);

      // Token ve localStorage işlemleri
      setToken(data.token);
      if (data.id) localStorage.setItem("userId", data.id);
      if (data.role) localStorage.setItem("role", data.role);
      if (data.token) localStorage.setItem("token", data.token);

      // Redux güncelleme
      dispatch(doLogin({ email: data.email || email, role: data.role }));
      dispatch(updateModal(false));
    } catch (err) {
      console.error("Login Error:", err);
      alert("Bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-[#0000007d] w-full min-h-screen fixed inset-0 z-30 flex items-center justify-center font-karla">
      <div className="relative border shadow rounded p-8 bg-white max-w-md w-full z-40 dark:bg-slate-800 dark:text-white">
        <RxCross1
          className="absolute cursor-pointer right-5 top-5 hover:opacity-85"
          onClick={() => dispatch(updateModal(false))}
        />

        <div className="flex mb-4 justify-center items-center gap-2">
          <FaUnlock />
          <h3 className="font-bold text-2xl">Giriş</h3>
          <FaUnlock />
        </div>

        <form onSubmit={submitForm} className="flex flex-col space-y-3">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="border w-full border-black py-2 px-8 rounded dark:bg-slate-600"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <RiUser3Fill className="absolute top-3 left-2 text-lg" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="border w-full border-black py-2 px-8 rounded dark:bg-slate-600"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <RiLockPasswordFill className="absolute top-3 left-2 text-lg" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Giriş yap"}
          </button>

          {/* Şifremi Unuttum linki */}
          <p className="text-sm text-center mt-2">
            <button
              type="button"
              onClick={() => {
                dispatch(updateModal(false));
                window.location.href = "/forgotpassword";
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Şifremi Unuttum?
            </button>
          </p>

          {/* Hesap yoksa kayıt linki */}
          <p className="text-sm text-center">
            Hesabın yok mu?{" "}
            <Link
              to="/register"
              onClick={() => dispatch(updateModal(false))}
              className="text-blue-600 hover:underline font-semibold"
            >
              Buradan kayıt ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;


