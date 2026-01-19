import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-800 py-16 bg-[#08080c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-serif font-bold text-xl mb-4 text-white">Innovatr</h3>
            <p className="text-sm text-gray-400 mb-3">
              Smart research in 24 hours. AI-powered insights for decision-makers.
            </p>
            <p className="text-xs text-gray-500">
              South Africa • Global work
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/#services" className="hover:text-white hover:underline transition-colors">
                  Innovatr Intelligence
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white hover:underline transition-colors">
                  Test24 Basic
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white hover:underline transition-colors">
                  Test24 Pro
                </Link>
              </li>
              <li>
                <Link href="/consult" className="hover:text-white hover:underline transition-colors">
                  Consulting
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Pricing</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/#pricing" className="hover:text-white hover:underline transition-colors">
                  Pay-as-you-go
                </Link>
              </li>
              <li>
                <Link href="/#membership" className="hover:text-white hover:underline transition-colors">
                  Membership plans
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-white hover:underline transition-colors">
                  Contact sales
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/#contact" className="hover:text-white hover:underline transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} Innovatr. All rights reserved.</p>
          <p className="text-gray-600 italic">Built for decisions.</p>
        </div>
      </div>
    </footer>
  );
}
