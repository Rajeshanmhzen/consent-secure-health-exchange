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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
                H
              </div>
              <span className="text-base font-bold text-white">HealthSync HX</span>
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
                      <a href="/" className="text-sm text-slate-300 transition-colors hover:text-white">
                        {link}
                      </a>
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
              <a
                key={item}
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
