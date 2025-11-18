import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import intelligenceIcon from "@assets/generated_images/Intelligence_service_icon_fb8072d6.png";
import basicIcon from "@assets/generated_images/Test24_Basic_icon_bad099f3.png";
import proIcon from "@assets/generated_images/Test24_Pro_icon_6504cdb7.png";
import consultIcon from "@assets/generated_images/Consulting_service_icon_640b13d0.png";

const services = [
  {
    icon: intelligenceIcon,
    title: "Innovatr Intelligence",
    description: "Real-time AI-powered market signals",
    features: [
      "Real-time AI-powered market, trend & competitor signals",
      "Monthly curated reports",
      "Downloadable trend reports (members)",
      '"Ask Anything" research answers (coming soon)',
    ],
  },
  {
    icon: basicIcon,
    title: "Innovatr Test24 Basic",
    description: "24hr Pay Per Idea Testing",
    features: [
      "Lite quant testing",
      "X100 consumer reach",
      "Automated briefing",
      "24hr report delivery",
      "Flexible, affordable pay-per-idea model",
    ],
  },
  {
    icon: proIcon,
    title: "Innovatr Test24 Pro",
    description: "Enterprise Quant + AI Qual",
    features: [
      "Custom audiences",
      "Full quant (10–15 min surveys)",
      "+100 AI Qual VOC videos",
      "Private dashboards (members)",
      "Strategic recommendations",
    ],
  },
  {
    icon: consultIcon,
    title: "Innovatr Consult",
    description: "Growth Consulting",
    features: [
      "Portfolio strategy",
      "Positioning & ideation",
      "Packaging & design",
      "GTM planning",
    ],
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, AI-powered research solutions designed for decision-makers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300"
              data-testid={`service-card-${index}`}
            >
              <CardHeader>
                <div className="w-16 h-16 mb-4 rounded-md bg-primary/10 p-3 flex items-center justify-center">
                  <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
