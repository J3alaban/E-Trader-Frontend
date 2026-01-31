import { motion } from "framer-motion";
import { CheckCircle2, History, Target, Eye, Users2, ShieldCheck } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Yıllık Deneyim", value: "25+", icon: <History className="text-blue-500" /> },
    { label: "Mutlu Müşteri", value: "10K+", icon: <Users2 className="text-blue-500" /> },
    { label: "Ürün Çeşidi", value: "500+", icon: <ShieldCheck className="text-blue-500" /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-karla">
      {/* --- Section 1: Hero & Giriş --- */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="z-10"
          >
            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
              Biz Kimiz?
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 dark:text-white leading-[1.1]">
              Hidroliğe <br />
              <span className="text-blue-600">Yeni Bir Soluk.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 italic border-l-4 border-blue-500 pl-6">
              "1999'dan beri bu sektörde hizmet vermekteyiz. Hidrolik bizim için bir ek iş değil, tek iş."
            </p>
            <div className="space-y-4">
              {[
                "1999'dan beri sektörel tecrübe",
                "Hidrolik sistemlerde uzman mühendislik",
                "Tek işimiz, tek odak noktamız"
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="text-blue-500 w-6 h-6" />
                  <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
              <img
                src="/banner.jpg"
                alt="Hakkımızda"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Arka plan dekorasyon */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full -z-0 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* --- Section 2: İstatistikler --- */}
      <section className="bg-slate-50 dark:bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
              >
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Misyon & Vizyon --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-500/5">
              <Target className="text-blue-600 mb-6" size={48} />
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Misyonumuz</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                Kaliteli ürünleri, güvenli ödeme altyapısı ve hızlı teslimat anlayışıyla
                kullanıcılarımıza en iyi alışveriş deneyimini sunmak. Endüstriyel ihtiyaçlara
                profesyonel ve kalıcı çözümler üretmek için her gün gelişiyoruz.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 dark:bg-blue-600 p-10 rounded-[2.5rem] shadow-xl text-white">
              <Eye className="text-blue-400 dark:text-white mb-6" size={48} />
              <h2 className="text-3xl font-bold mb-4">Vizyonumuz</h2>
              <p className="opacity-90 leading-relaxed text-lg">
                Hidrolik sektöründe dijital dönüşümün öncüsü olmak ve Türkiye'nin en güvenilen
                endüstriyel tedarik platformu haline gelmek. Küresel standartlarda hizmeti
                yerel samimiyetle birleştiriyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 4: Alt Mesaj --- */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-8">
            Müşteri memnuniyeti bizim için sadece bir slogan değil, bir önceliktir.
          </h2>
          <div className="w-24 h-1 bg-white/30 mx-auto rounded-full mb-8" />
          <p className="text-xl opacity-80">
            Sorularınız mı var? Uzman ekibimiz size destek olmak için burada.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;