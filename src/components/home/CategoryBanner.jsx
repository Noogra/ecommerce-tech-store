import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"

const bannerCategories = [
  {
    slug: "mobile-phones",
    nameKey: "categories.mobilePhones",
    descKey: "categories.mobilePhonesDesc",
    image:
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-40-17pro-202509_FMT_WHH?wid=508&hei=472&fmt=p-jpg&qlt=95&.v=WVVFRzUzVk1oblJhbW9PbGNSU25ja3doNjVzb1FWSTVwZWJJYThYTHlrNzQzbUlIR1RvazhDRHNOQlYvM3g2dFIwdkZSSnBZYjhOaHBpM2lkYTFBUEZHTmVoMWFVZloyU3lqdmZCOUFEeDF6K2N6UFd4K21VWHNnbWZBQ3hSanQ",
  },
  {
    slug: "accessories",
    nameKey: "categories.accessories",
    descKey: "categories.accessoriesDesc",
    image:
      "https://images.ctfassets.net/fltupc9ltp8m/6PdSeIXCPJz2iO8NF8SvHK/e1cd291febcdabf950ac2740ec559408/Accessories_-_Sale_-_666x400_1__1_.png?fm=webp&w=1900&q=80",
  },
  {
    slug: "computers-tablets",
    nameKey: "categories.computersTablets",
    descKey: "categories.computersTabletsDesc",
    image:
      "https://cdn.mos.cms.futurecdn.net/21f2d0ae54387c85a3f40eb8b478372f.jpg",
  },
]

export default function CategoryBanner() {
  const { t } = useTranslation()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          {t('categories.title')}
        </h2>
        <p className="text-muted mt-2">{t('categories.subtitle')}</p>
      </div>

      {/* Mobile: horizontal snap-scroll; sm+: grid */}
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {bannerCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="flex-none w-[78vw] sm:w-auto snap-start group relative overflow-hidden rounded-2xl aspect-[3/2] block"
          >
            <img
              src={cat.image}
              alt={t(cat.nameKey)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 start-0 p-6 text-white">
              <h3 className="text-xl font-bold">{t(cat.nameKey)}</h3>
              <p className="text-sm text-gray-300 mt-1">{t(cat.descKey)}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-blue-300 group-hover:text-white transition-colors">
                {t('categories.browse')}{" "}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
