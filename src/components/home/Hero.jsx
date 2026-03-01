import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section className="relative bg-gradient-to-br from-primary via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 end-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-10 start-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {t('hero.badge')}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {t('hero.titleLine1')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {t('hero.titleLine2')}
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/category/mobile-phones"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25"
              >
                {t('hero.shopNow')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link
                to="/category/accessories"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-medium px-8 py-3.5 rounded-xl transition-colors"
              >
                {t('hero.browseAccessories')}
              </Link>
            </div>
          </div>

          {/* Hero Image/Logo */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-cyan-400/20 rounded-3xl blur-2xl" />
              <img
                src="https://i.postimg.cc/x8CKts8N/Gemini-Generated-Image-pf050kpf050kpf05.png"
                alt="PhoneStop Logo"
                className="relative w-full h-auto object-contain rounded-3xl shadow-2xl bg-white/5 p-8"
              />
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "10K+", labelKey: "hero.happyCustomers" },
            { value: "500+", labelKey: "hero.products" },
            { value: t('checkout.free'), labelKey: "hero.freeShipping" },
            { value: "24/7", labelKey: "hero.support" },
          ].map((stat) => (
            <div key={stat.labelKey}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
