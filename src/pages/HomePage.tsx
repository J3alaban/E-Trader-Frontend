 import { FC, useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import {
  addProducts,
  updateFeaturedList,
 
} from "../redux/features/productSlice";
import { Product } from "../models/Product";

import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import TrendingProducts from "../components/TrendingProducts";
import Banner from "../components/Banner";
import LatestProducts from "../components/LatestProducts";
import { Config } from "../helpers/Config";

const HomePage: FC = () => {
  const dispatch = useAppDispatch();

useEffect(() => {
  fetch(`${Config.api.baseUrl}/api/v1/products`)
    .then(res => res.json())
    .then((data: { content: Product[] }) => {
      const products: Product[] = (data.content ?? []).map(p => ({
        ...p,
        thumbnail: p.images?.[0], // null YOK
      }));

      const productIds = products.map(p => p.id);
      localStorage.setItem("productIds", JSON.stringify(productIds));
      localStorage.setItem("products", JSON.stringify(products));

      dispatch(addProducts(products));
      dispatch(updateFeaturedList(products.slice(0, 8)));
       // dispatch(updateNewList(products.slice(0, 8)));
    });
}, [dispatch]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-800 transition-colors duration-300">
      <section className="w-full">
        <HeroSection />
      </section>

      <div className="container mx-auto px-4 py-8">
        <Features />
      </div>

      <section className="py-10">
        <TrendingProducts />
      </section>

      <div className="container mx-auto px-4 my-12">
        <Banner />
      </div>

      <section className="pb-20">
        <LatestProducts />
      </section>
    </main>
  );
};

export default HomePage;  
