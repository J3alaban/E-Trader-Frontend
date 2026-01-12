import { FC } from "react";
import { Product } from "../models/Product";
import RatingStar from "./RatingStar";
import { useAppDispatch } from "../redux/hooks";
import toast from "react-hot-toast";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Link } from "react-router-dom";
import PriceSection from "./PriceSection";
import useAuth from "../hooks/useAuth";
import { Config } from "../helpers/Config";
import { addToCart } from "../redux/features/cartSlice";

type ProductCardProps = Product & {
  showDelete?: boolean;
  onDelete?: () => void;
};

interface CartItem {
  productId: number;
  productTitle: string;
  price: number;
  quantity: number;
}

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
  const { requireAuth } = useAuth();

  const handleAddToCart = () => {
    requireAuth(async () => {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        toast.error("User bulunamadı");
        return;
      }

      try {
        const res = await fetch(
          `${Config.api.baseUrl}/api/v1/carts/${storedUserId}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, quantity: 1 }),
          }
        );

        if (!res.ok) throw new Error();

        const cart = (await res.json()) as { items: CartItem[] };
        const addedItem = cart.items.find(i => i.productId === id);

        if (!addedItem) throw new Error("Ürün sepete eklenemedi");

        dispatch(
          addToCart({
            id: addedItem.productId,
            title: addedItem.productTitle,
            price: addedItem.price,
            quantity: addedItem.quantity,
            thumbnail: thumbnail || images?.[0],
            category,
            rating,
            discountPercentage,
          })
        );

        toast.success("Ürün sepete eklendi");
      } catch {
        toast.error("Sepete eklenemedi");
      }
    });
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

        <Link
          to={`/product/${id}`}
          className="font-semibold hover:underline block truncate"
          title={title}
        >
          {title}
        </Link>

        <RatingStar rating={rating ?? 0} />

        <div className="flex items-center justify-between">
          <PriceSection
            price={price}
            discountPercentage={discountPercentage}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 
                         text-white px-4 py-2 rounded"
            >
              <AiOutlineShoppingCart />
              <span className="hidden sm:inline">Sepete Ekle</span>
            </button>

            {showDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete?.();
                }}
                className="px-3 py-1 rounded-md text-xs font-medium 
                           text-red-600 bg-red-50 hover:bg-red-100 
                           hover:text-red-700 transition-colors duration-200 
                           shadow-sm"
              >
                Sil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

