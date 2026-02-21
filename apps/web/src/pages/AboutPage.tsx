import { Card, CardContent } from "../components/ui/card";

export function AboutPage() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-12 px-4 space-y-12 text-center">
      
      {/* Intro */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-primary">About Made in Middle-East</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Made in Middle-East is the first dedicated B2B platform connecting trusted suppliers from the Middle East with buyers across the world.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
        
        <Card className="border-l-4 border-l-primary hover:-translate-y-1 hover:scale-105 transition-all duration-300">
           <CardContent className="p-8 space-y-4">
              <h4 className="text-xl font-bold text-primary">🌍 Our Mission</h4>
              <p className="text-muted-foreground leading-relaxed">
                To empower local businesses by giving them a digital platform to expand beyond borders and reach international markets with ease.
              </p>
           </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:-translate-y-1 hover:scale-105 transition-all duration-300">
           <CardContent className="p-8 space-y-4">
              <h4 className="text-xl font-bold text-primary">🤝 Who We Help</h4>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a supplier looking for buyers or a business sourcing regional goods, we bring both sides together with powerful tools and trust.
              </p>
           </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:-translate-y-1 hover:scale-105 transition-all duration-300">
           <CardContent className="p-8 space-y-4">
              <h4 className="text-xl font-bold text-primary">🚀 Our Vision</h4>
              <p className="text-muted-foreground leading-relaxed">
                 We envision a thriving digital ecosystem where Middle-Eastern products are recognized globally for their quality and cultural value.
              </p>
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
