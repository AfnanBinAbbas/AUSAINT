
import { Link } from "react-router-dom";
import { ArrowRight, File, Globe, Mail, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tools = [
  {
    title: "Social Media Intelligence",
    description: "Find profiles, detect leaked credentials, and analyze social presence.",
    icon: Users,
    path: "/dashboard/social",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "IP & Domain Intelligence",
    description: "WHOIS lookup, geolocation data, and DNS analysis.",
    icon: Globe,
    path: "/dashboard/ip-domain",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Email & Phone Intelligence",
    description: "Breach checks, data validation, and contact analysis.",
    icon: Mail,
    path: "/dashboard/email-phone",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "Web Scraping",
    description: "Detect exposed files, subdomains, and website intelligence.",
    icon: File,
    path: "/dashboard/web-scraping",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Secure Reporting",
    description: "Export data as structured and encrypted reports.",
    icon: Shield,
    path: "/dashboard/reporting",
    color: "bg-red-500/10 text-red-500",
  },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to AUSAINT</h1>
        <p className="text-muted-foreground mt-2">
          A comprehensive OSINT platform for intelligence gathering and analysis
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.title} className="tool-card">
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color}`}>
                <tool.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-4">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button asChild variant="ghost" className="w-full justify-start p-0 hover:bg-transparent">
                <Link to={tool.path} className="flex items-center gap-2 text-primary">
                  <span>Open Tool</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="border rounded-lg p-4 bg-card">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <p className="text-muted-foreground">Your recent investigations will appear here.</p>
      </div>
    </div>
  );
}
