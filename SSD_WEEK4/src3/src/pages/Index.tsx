import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/90">
      <header className="container py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-md" />
            </div>
            <span className="font-bold text-lg">AUSAINT</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-16 md:py-24 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>Free OSINT Platform</span>
              </div>
              <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Open-Source Intelligence
                </span>{" "}
                Simplified
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-md">
                A secure, comprehensive platform for intelligence gathering from publicly available sources.
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Create Free Account
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
                  <span>View Demo</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="border rounded-xl overflow-hidden bg-background/50 shadow-xl">
              <div className="p-3 bg-muted/30 border-b flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs rounded-full bg-background px-3 py-1 border">
                  VigilantEye OSINT Suite
                </div>
              </div>
              <div className="grid grid-cols-5">
                <div className="col-span-1 bg-muted/30 border-r p-3 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 rounded-md bg-background animate-pulse-slow" />
                  ))}
                </div>
                <div className="col-span-4 p-4 space-y-4">
                  <div className="h-8 w-48 rounded-md bg-muted animate-pulse-slow" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-40 rounded-md bg-muted/60 animate-pulse-slow" />
                    <div className="h-40 rounded-md bg-muted/60 animate-pulse-slow" />
                    <div className="h-40 rounded-md bg-muted/60 animate-pulse-slow" />
                    <div className="h-40 rounded-md bg-muted/60 animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="container py-16 md:py-24 lg:py-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">Comprehensive OSINT Tools</h2>
            <p className="text-muted-foreground mt-4 md:text-lg max-w-md mx-auto">
              AUSAINT offers a complete toolkit for security professionals and researchers
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Social Media Intelligence",
                description: "Find profiles and detect leaked credentials across platforms",
                icon: "👤"
              },
              {
                title: "IP & Domain Intel",
                description: "WHOIS lookups, geolocation data, and DNS analysis",
                icon: "🌐"
              },
              {
                title: "Email & Phone OSINT",
                description: "Breach checks and data validation for contact info",
                icon: "📧"
              },
              {
                title: "Web Scraping Tools",
                description: "Detect exposed files, subdomains, and more",
                icon: "🔎"
              },
              {
                title: "Secure Reporting",
                description: "Export data as structured and encrypted reports",
                icon: "🔒"
              },
              {
                title: "Secure Authentication",
                description: "Role-based access control and secure data storage",
                icon: "🛡️"
              }
            ].map((feature, index) => (
              <div key={index} className="border rounded-xl p-6 bg-card">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="container py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative h-6 w-6 bg-primary rounded-md flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-md" />
                </div>
                <span className="font-bold">AUSAINT</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A free and secure Open-Source Intelligence platform for researchers and security professionals.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li>Social Media Intelligence</li>
                <li>IP & Domain Analysis</li>
                <li>Email & Phone OSINT</li>
                <li>Web Scraping</li>
                <li>Secure Reporting</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community Forums</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>GitHub</li>
                <li>Twitter</li>
                <li>Discord</li>
                <li>Support</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AUSAINT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
