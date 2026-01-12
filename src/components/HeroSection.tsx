import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const images = [
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
  "/hero4.png",
  "/hero5.png",
  "/hero6.png",
  "/hero7.png",
  "/hero8.png",
  "/hero10.png",
];

const slides = [
  {
    title: "Siz nereye biz oraya...",
    subtitle: "Hidroliğin çözümler üreten lideri",
  },
  {
    title: "Güç her yerde",
    subtitle: "Endüstriyel hidrolik çözümler",
  },
  {
    title: "Dayanıklılık ve kalite",
    subtitle: "Uzun ömürlü sistemler",
  },
  {
    title: "Profesyonel çözümler",
    subtitle: "Sektörün güvenilir markası",
  },
];

const HeroSection: FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setIndex(i => (i - 1 + images.length) % images.length);

  const next = () =>
    setIndex(i => (i + 1) % images.length);

  return (
    <div className="bg-[#e3edf6] dark:bg-slate-600 font-lora relative">
      <div className="container px-4 grid md:grid-cols-2 py-8 mx-auto">
        <div className="flex items-center">
          <div className="max-w-[450px] space-y-4">
            <h2 className="text-black font-bold text-4xl md:text-5xl dark:text-white transition-all duration-500">
              {slides[index % slides.length].title}
            </h2>
            <h3 className="text-2xl dark:text-white transition-all duration-500">
              {slides[index % slides.length].subtitle}
            </h3>
            <Link
              to="/products"
              className="inline-block bg-white rounded-md px-6 py-3 hover:bg-blue-500 hover:text-white"
            >
              Şimdi Al
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src={images[index]}
            alt="hero"
            className="ml-auto transition-opacity duration-500"
          />

          <button onClick={prev} className="absolute left-0 top-1/2">‹</button>
          <button onClick={next} className="absolute right-0 top-1/2">›</button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
