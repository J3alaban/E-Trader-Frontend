import { FC } from "react";
import { Product } from "../models/Product";
import RatingStar from "./RatingStar";
import { useAppDispatch } from "../redux/hooks";
import toast from "react-hot-toast";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Link } from "react-router-dom";
import PriceSection from "./PriceSection";
import { Config } from "../helpers/Config";
import { addToCart } from "../redux/features/cartSlice";

type ProductCardProps = Product & {
  showDelete?: boolean;
  onDelete?: () => void;
};

const ProductCard: FC<ProductCardProps> = ({
  id,
  price,
  thumbnail,
  title,
  category,
  rating,
  discountPercentage = 0,
  images,
  showDelete = false,
  onDelete,
}) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    const storedUserId = localStorage.getItem("userId");

    // Redux'a her halükarda eklenecek obje
    const itemData = {
      id,
      title,
      price,
      quantity: 1,
      thumbnail: thumbnail || images?.[0],
      category,
      rating,
      discountPercentage,
    };

    // SENARYO 1: Kullanıcı Giriş Yapmış (DB ile eşitle)
    if (storedUserId) {
      try {
        const res = await fetch(
          `${Config.api.baseUrl}/api/v1/carts/${storedUserId}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, quantity: 1 }),
          }
        );

        if (!res.ok) throw new Error("API hatası");

        // API başarılıysa Redux'ı güncelle
        dispatch(addToCart(itemData));
        toast.success("Ürün sepete eklendi (Senkronize)");
      } catch (error) {
        // API hatası olsa bile kullanıcıyı mağdur etmemek için yerel sepete ekle
        dispatch(addToCart(itemData));
        toast.error("Bağlantı hatası, ürün yerel sepete eklendi.");
      }
    }
    // SENARYO 2: Misafir Kullanıcı (Sadece yerel hafıza)
    else {
      dispatch(addToCart(itemData));
      toast.success("Ürün sepete eklendi (Misafir)");
    }
  };

  return (
    <div className="border border-gray-200 font-lato rounded-lg overflow-hidden relative">
      <div className="text-center border-b">
        <Link to={`/product/${id}`}>
          <img
            src={thumbnail || images?.[0]}
            alt={title}
            className="h-60 mx-auto transition-transform duration-200 hover:scale-105"
          />
        </Link>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-gray-500 text-sm">{category}</p>
        <Link to={`/product/${id}`} className="font-semibold hover:underline block truncate">
          {title}
        </Link>
        <RatingStar rating={rating ?? 0} />
        <div className="flex items-center justify-between">
          <PriceSection price={price} discountPercentage={discountPercentage} />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
            >
              <AiOutlineShoppingCart />
              <span className="hidden sm:inline">Sepete Ekle</span>
            </button>
            {showDelete && (
              <button onClick={onDelete} className="text-red-600 bg-red-50 p-2 rounded">Sil</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;