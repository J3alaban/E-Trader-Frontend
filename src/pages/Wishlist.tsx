import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setWishlist } from "../redux/features/productSlice";
import ProductList from "../components/ProductList";
import { Config } from "../helpers/Config";

const Wishlist: FC = () => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.productReducer.wishlist);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const fetchWishlist = async () => {
      const res = await fetch(
        `${Config.api.baseUrl}/api/v1/wishlist/${userId}`
      );
      const data = await res.json();
      dispatch(setWishlist(data));
    };

    fetchWishlist();
  }, [dispatch, userId]);


const handleDelete = async (productId: number) => {
  if (!userId) return;

  // localStorage'daki productIds (opsiyonel kontrol)
  const storedProductIds = JSON.parse(
    localStorage.getItem("productIds") || "[]"
  );

  if (!storedProductIds.includes(productId)) return;

  await fetch(
    `${Config.api.baseUrl}/api/v1/wishlist/${userId}/${productId}`,
    { method: "DELETE" }
  );

  dispatch(  setWishlist(
    (() => {
      const copy = [...wishlist];
      const index = copy.findIndex(p => p.id === productId);
      if (index !== -1) copy.splice(index, 1);
      return copy;
    })()
  ));
};

  return (
    <div className="container mx-auto font-karla min-h-[83vh]">
      {wishlist.length > 0 ? (
        <ProductList
          title="Favorilerim"
          products={wishlist}
          isWishlist
          onDelete={handleDelete}
        />
      ) : (
        <div className="flex flex-col justify-center items-center p-8">
          <img src="/emptyCart.jpg" className="w-60" alt="empty" />
          <p className="text-center text-xl font-semibold my-2 dark:text-white">
            Favorileriniz boş görünüyor. Eklemek için ürünlerin
            yanında bulunan kalp simgesine tıklayın.
          </p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
