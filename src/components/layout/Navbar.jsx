import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import Logo from '../../assets/logo';
import MegaMenu from './MegaMenu';
import { fetchCategories } from '../../api/categories';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const { dispatch, cartCount } = useCart();

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="relative group"
              >
                <Link
                  to={`/category/${cat.slug}`}
                  onMouseEnter={() => setActiveMenu(cat.slug)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent rounded-lg transition-colors"
                >
                  {cat.name}
                  {cat.subcategories.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-2 text-gray-700 hover:text-accent transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-accent transition-colors rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        {activeMenu && (
          <div
            className="absolute top-full left-0 right-0 pt-1"
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <MegaMenu
              category={categories.find(c => c.slug === activeMenu)}
              onClose={() => setActiveMenu(null)}
            />
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {categories.map((cat) => (
              <div key={cat.slug}>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                    className="flex-1 py-3 text-base font-medium text-primary"
                  >
                    {cat.name}
                  </Link>
                  {cat.subcategories.length > 0 && (
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === cat.slug ? null : cat.slug)}
                      className="p-2 text-muted"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          mobileExpanded === cat.slug ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {mobileExpanded === cat.slug && cat.subcategories.length > 0 && (
                  <div className="ml-4 space-y-1 pb-2">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        to={`/category/${cat.slug}?sub=${sub.slug}`}
                        onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                        className="block py-2 text-sm text-muted hover:text-accent transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
