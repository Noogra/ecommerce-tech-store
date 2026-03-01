import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/logo';
import MegaMenu from './MegaMenu';
import { fetchCategories } from '../../api/categories';
import { useCart } from '../../hooks/useCart';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMenu = () => { setMobileOpen(false); setMobileExpanded(null); };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" onClick={closeMenu}>
              <Logo />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {categories.map((cat) => (
                <div key={cat.slug} className="relative group">
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
            <div className="flex items-center gap-1">
              {/* Language Switcher (desktop) */}
              <LanguageSwitcher className="hidden lg:flex border-gray-200 text-gray-600 hover:border-accent hover:text-accent" />

              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 hover:text-accent transition-colors rounded-lg hover:bg-gray-50"
                aria-label={t('nav.openCart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 end-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-700 hover:text-accent transition-colors rounded-lg"
                aria-label={t('nav.toggleMenu')}
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
      </header>

      {/* Mobile Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Side Drawer — slides from end (right in LTR, left in RTL) */}
      <div
        className={`lg:hidden fixed top-0 end-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0 rtl:-translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 h-16">
          <Link to="/" onClick={closeMenu}>
            <Logo />
          </Link>
          <button
            onClick={closeMenu}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-primary rounded-lg transition-colors"
            aria-label={t('nav.closeMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {categories.map((cat) => (
            <div key={cat.slug}>
              <div className="flex items-center justify-between rounded-xl hover:bg-gray-50 transition-colors">
                <Link
                  to={`/category/${cat.slug}`}
                  onClick={closeMenu}
                  className="flex-1 py-3 px-3 text-base font-medium text-primary"
                >
                  {cat.name}
                </Link>
                {cat.subcategories.length > 0 && (
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === cat.slug ? null : cat.slug)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted"
                    aria-label={t('nav.expandCategory', { name: cat.name })}
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 rtl:rotate-180 ${
                        mobileExpanded === cat.slug ? 'rotate-90 rtl:rotate-90' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {mobileExpanded === cat.slug && cat.subcategories.length > 0 && (
                <div className="ms-4 mb-2 space-y-0.5">
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      to={`/category/${cat.slug}?sub=${sub.slug}`}
                      onClick={closeMenu}
                      className="flex items-center min-h-[44px] px-3 text-sm text-muted hover:text-accent hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Drawer Footer — Language Switcher */}
        <div className="p-4 border-t border-gray-100">
          <LanguageSwitcher className="w-full justify-center border-gray-200 text-gray-600 hover:border-accent hover:text-accent" />
        </div>
      </div>
    </>
  );
}
