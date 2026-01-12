import { FC } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"; // Yeni ikonlar eklendi

const Footer: FC = () => {
  return (
    <footer className="bg-black text-white p-6 mt-auto relative">
      {/* Orta Kısım: Telif Hakkı */}
      <div className="text-center mb-4">
        &copy; {new Date().getFullYear()} Telif Hakkı | Tüm Hakları Saklıdır
      </div>

      <div className="text-center mb-10">
        <Link
          to="https://www.linkedin.com/in/balaban58/"
          className="hover:underline hover:font-bold opacity-85 hover:opacity-100"
        >
        Sayfa Tasarımı için |  İletişime Geçin | Balaban
        </Link>
      </div>

      {/* Sol Alt Köşe: Gmail ve Konum Butonları */}
      <div className="absolute left-6 bottom-6 flex gap-4">
        <a
          href="mailto:demirayhidrolik06@gmail.com"
          className="flex items-center gap-2 bg-[#EA4335] hover:bg-white hover:text-black px-3 py-2 rounded-lg transition-colors text-sm"
          title="Gmail ile iletişime geçin"
        >
          <FaEnvelope className="text-xl" />
          <span className="hidden md:inline">Gmail</span>
        </a>

        <a
          href="https://www.google.com/maps/place/DEM%C4%B0RAY+H%C4%B0DROL%C4%B0K,+NO:51,+Saray,+2.+Cd.+No:11,+06980+Kahramankazan%2FAnkara/data=!4m2!3m1!1s0x14d333e365994bc7:0xa53edfa0b1e70a8e?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI1LjQ5LjYYACDXggMqdSw5NDI2NzcyNyw5NDI3NTQwNyw5NDI5MjE5NSw5NDI5OTUzMiw5NDI4NDUxMSw5NDI4MDU3Niw5NDIwNzM5NCw5NDIwNzUwNiw5NDIwODUwNiw5NDIxODY1Myw5NDIyOTgzOSw5NDI3NTE2OCw5NDI3OTYxOUICVFI%3D&skid=b7198ffb-4307-4f14-bc9e-974ae222b83d" // Buraya gerçek Google Maps linkini ekle
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 hover:bg-white hover:text-black px-3 py-2 rounded-lg transition-colors text-sm"
          title="Konumu görüntüle"
        >
          <FaMapMarkerAlt className="text-xl" />
          <span className="hidden md:inline">Konum</span>
        </a>
      </div>

   
      <a
        href="https://wa.me/905546028489"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 bottom-6 z-50 text-6xl text-[#25D366] drop-shadow-lg hover:scale-125 hover:bg-green-100 rounded-full transition-transform active:scale-95"
        aria-label="WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </footer>
  );
};

export default Footer;