export default function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Innovatr</h3>
            <p className="text-sm text-muted-foreground">
              Smart Research in 24 Hours. AI-powered insights for decision-makers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-primary transition-colors">Innovatr Intelligence</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Test24 Basic</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Test24 Pro</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Consulting</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Pricing</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pay-As-You-Go</a></li>
              <li><a href="#membership" className="hover:text-primary transition-colors">Membership Plans</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact Sales</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Innovatr. All rights reserved.</p>
          <p>
            Powered by <span className="text-primary font-semibold">Just Design Group</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
