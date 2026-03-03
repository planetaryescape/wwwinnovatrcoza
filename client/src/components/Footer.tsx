import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12 bg-[#08080c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif font-bold text-xl mb-3 text-white">Innovatr</h3>
            <p className="text-sm text-gray-400 mb-2">
              Smart research in 24 hours.
            </p>
            <p className="text-xs text-gray-500">
              South Africa
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/#services" className="hover:text-white transition-colors">
                  Innovatr Intelligence
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white transition-colors">
                  Test24 Basic
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white transition-colors">
                  Test24 Pro
                </Link>
              </li>
              <li>
                <Link href="/consult" className="hover:text-white transition-colors">
                  Consulting
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Pricing</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/#pricing" className="hover:text-white transition-colors">
                  Pay-as-you-go
                </Link>
              </li>
              <li>
                <Link href="/#membership" className="hover:text-white transition-colors">
                  Membership plans
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="mailto:richard@innovatr.co.za" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  richard@innovatr.co.za
                </a>
              </li>
              <li>
                <a href="https://wa.me/27823012433" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  +27 (82) 301-2433
                </a>
              </li>
              <li>
                <Link href="/#newsletter" className="hover:text-white transition-colors">
                  Subscribe to Pulse
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-white transition-colors">
                  Get in touch
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Innovatr (Pty) Ltd. All rights reserved.</p>
          <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors" data-testid="link-privacy-policy">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
