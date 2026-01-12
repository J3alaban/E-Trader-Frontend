import { FC, useEffect, /*useContext*/ } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addCategories } from "../redux/features/productSlice";
import { Link } from "react-router-dom";
import { updateLoading } from "../redux/features/homeSlice";
import { Config } from "../helpers/Config";
 //

const AllCategories: FC = () => {
  const dispatch = useAppDispatch();

  const allCategories = useAppSelector(
    (state) => state.productReducer.categories
  );
  const isLoading = useAppSelector((state) => state.homeReducer.isLoading);

  // const API_URL = Config.api.baseUrl;
  

  useEffect(() => {
    if (allCategories.length > 0) return;

    dispatch(updateLoading(true));

    fetch(`${Config.api.baseUrl}/api/v1/categories`, {
      method : "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch(addCategories(data));
       localStorage.setItem("categories", JSON.stringify(data)); 
      })
      .finally(() => {
        dispatch(updateLoading(false));
      });
  }, [dispatch, allCategories.length]);
  console.log( "Bütün kategoriler" , allCategories)

  return (
    <div className="container mx-auto min-h-[83vh] p-6 font-karla">
      <h2 className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-6">
         Kategoriler
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin mt-32 rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-300"></div>
        </div>
      ) : (
        <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
          {allCategories &&
            allCategories.map((category) => (
              <div
                key={category.slug}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 
                           rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 
                           px-5 py-6 flex flex-col justify-between"
              >
                <div className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {category.name}
                </div>
                <Link
                  to={{ pathname: `/category/${category.slug}` }}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline mt-2"
                >
                  🔎 Ürünleri Gör
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AllCategories;

