import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/logo';

export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    [t('footer.shop')]: [
      { nameKey: 'footer.mobilePhones', to: '/category/mobile-phones' },
      { nameKey: 'footer.accessories', to: '/category/accessories' },
      { nameKey: 'footer.computersTablets', to: '/category/computers-tablets' },
    ],
    [t('footer.support')]: [
      { nameKey: 'footer.contactUs', to: '#' },
      { nameKey: 'footer.faqs', to: '#' },
      { nameKey: 'footer.shippingInfo', to: '#' },
      { nameKey: 'footer.returns', to: '#' },
    ],
    [t('footer.company')]: [
      { nameKey: 'footer.aboutUs', to: '#' },
      { nameKey: 'footer.careers', to: '#' },
      { nameKey: 'footer.privacyPolicy', to: '#' },
      { nameKey: 'footer.termsOfService', to: '#' },
    ],
  };

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Logo className="[&_span]:text-white [&_svg]:text-accent" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.nameKey}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {t(link.nameKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PhoneStop. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="text-xs">{t('footer.builtWith')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
