import { Link } from 'react-router-dom'

const footerSections = [
  {
    title: 'Platform',
    links: ['Core Features', 'Security & Compliance', 'Multi-Tenant Architecture', 'Role-Based Access'],
  },
  {
    title: 'Resources',
    links: ['API Documentation', 'Integration Guides', 'System Status', 'Help Center'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Data Processing Agreement', 'Cookie Policy'],
  },
]

const socialItems = ['X', 'GH', 'IN']

const Footer = () => {
  return (
    <footer className="mt-16 w-full" style={{ backgroundColor: '#141d31' }}>
      <div className="w-full px-6 py-12">
        <div className="mx-auto w-[82%] max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--color-primary)' }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1 0-2h3V7a1 1 0 0 1 1-1z" />
                </svg>
              </div>
              <div>
                <span className="text-base font-bold text-white">SwasthyaConsent</span>
                <p className="mt-1 text-sm text-slate-300">तपाईंको स्वास्थ्य, तपाईंको सहमति</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Empowering patients, securing medical records, and enabling trusted care through explicit consent.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-bold text-white">{section.title}</h3>
                <ul className="mt-5 space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link to="/" className="text-sm text-slate-300 transition-colors hover:text-white">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-slate-800 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-400">
            {'\u00A9'} 2024 Consent-Based Secure Health Information Exchange System. Academic Project.
          </p>
          <div className="flex items-center gap-3">
            {socialItems.map((item) => (
              <Link
                key={item}
                to="/"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
