import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const bannerCategories = [
  {
    name: "Mobile Phones",
    slug: "mobile-phones",
    image:
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-40-17pro-202509_FMT_WHH?wid=508&hei=472&fmt=p-jpg&qlt=95&.v=WVVFRzUzVk1oblJhbW9PbGNSU25ja3doNjVzb1FWSTVwZWJJYThYTHlrNzQzbUlIR1RvazhDRHNOQlYvM3g2dFIwdkZSSnBZYjhOaHBpM2lkYTFBUEZHTmVoMWFVZloyU3lqdmZCOUFEeDF6K2N6UFd4K21VWHNnbWZBQ3hSanQ",
    description: "Latest smartphones from top brands",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image:
      "https://images.ctfassets.net/fltupc9ltp8m/6PdSeIXCPJz2iO8NF8SvHK/e1cd291febcdabf950ac2740ec559408/Accessories_-_Sale_-_666x400_1__1_.png?fm=webp&w=1900&q=80",
    description: "Cases, chargers, and audio gear",
  },
  {
    name: "Computers & Tablets",
    slug: "computers-tablets",
    image:
      "https://cdn.mos.cms.futurecdn.net/21f2d0ae54387c85a3f40eb8b478372f.jpg",
    description: "Powerful tablets and laptops",
  },
]

export default function CategoryBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Shop by Category
        </h2>
        <p className="text-muted mt-2">Find exactly what you're looking for</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bannerCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl aspect-[3/2] block"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-xl font-bold">{cat.name}</h3>
              <p className="text-sm text-gray-300 mt-1">{cat.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-blue-300 group-hover:text-white transition-colors">
                Browse{" "}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
