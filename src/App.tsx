import { Provider } from "react-redux";
import "./App.css";
import { store } from "./redux/store";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import SingleProduct from "./pages/SingleProduct";
import LoginModal from "./components/LoginModal";
import Wishlist from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import AllProducts from "./pages/AllProducts";
import ScrollToTopButton from "./components/ScrollToTopButton";
import BannerPopup from "./components/BannerPopup";
import AllCategories from "./pages/AllCategories";
import SingleCategory from "./pages/SingleCategory";
import SearchPage from "./pages/SearchPage";
import { AuthProvider } from "./redux/AuthContext";
import Login  from "./pages/Login";
import Register from "./pages/Register";
import PaymentPage from "./pages/PaymentPage";
import Cart from "./components/Cart";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import OrderPage from "./pages/OrderPage" ;
import  ForgotPassword  from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Iyzico from "./pages/Iyzico";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">

        <Navbar />
        <main className="flex-grow">
        <Routes>


          <Route path="/" element={<HomePage />} /> // Api den çekilmedi
          <Route path="/login" element={<Login />} />  // Api den çekildi
          <Route path="/search" element={<SearchPage />} /> Api den çekildi
          <Route path="/products" element={<AllProducts />} /> // Api den çekildi
          <Route path="/categories" element={<AllCategories />} /> // Api den çekildi
          <Route path="/product/:productID" element={<SingleProduct />} /> // Api den çekildi
          <Route path="/category/:slug" element={<SingleCategory />} />    // Api den çekildi
          <Route path="/register" element={<Register/>} /> // Api den çekildi
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/Iyzico" element={<Iyzico />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />


           <Route element={<ProtectedRoute />}>
            <Route path="/wishlist" element={<Wishlist />} /> Api den çekilmedi
            <Route path="/account" element={<Profile />} /> // Api den çekildi
          </Route>
        </Routes>
        </main>
        <Toaster position="bottom-center" reverseOrder={false} />
        <Footer />

        <LoginModal />
        <ScrollToTopButton />
        <BannerPopup />
        </div>
      </AuthProvider>
    </Provider>
  );
}

export default App;
