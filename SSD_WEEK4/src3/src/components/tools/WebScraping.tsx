
import { useState } from "react";
import { FileText, Link, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function WebScraping() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<null | {
    url: string;
    subdomains: string[];
    exposedFiles: { path: string; type: string; sensitivity: string }[];
  }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setResults({
        url,
        subdomains: [
          "api.example.com",
          "dev.example.com",
          "staging.example.com",
          "mail.example.com",
          "admin.example.com",
        ],
        exposedFiles: [
          { path: "/robots.txt", type: "Configuration", sensitivity: "low" },
          { path: "/sitemap.xml", type: "Configuration", sensitivity: "low" },
          { path: "/backup/database.sql", type: "Backup", sensitivity: "high" },
          { path: "/.git/config", type: "Source Control", sensitivity: "high" },
          { path: "/wp-content/uploads/2023/", type: "Media", sensitivity: "medium" },
        ],
      });
      setLoading(false);
    }, 2000);
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case "high":
        return "text-red-500 border-red-500";
      case "medium":
        return "text-amber-500 border-amber-500";
      case "low":
        return "text-green-500 border-green-500";
      default:
        return "text-blue-500 border-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Web Scraping Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Detect exposed files, subdomains, and website intelligence
        </p>
      </div>

      <Tabs defaultValue="subdomains" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subdomains">Subdomain Discovery</TabsTrigger>
          <TabsTrigger value="exposedfiles">Exposed Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subdomains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subdomain Discovery</CardTitle>
              <CardDescription>
                Find subdomains and hidden services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">Domain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      placeholder="Enter domain (e.g., example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Scanning..." : "Scan"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {results && (
            <div className="result-card space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Subdomain Results</h3>
                </div>
                <Badge variant="outline">
                  {results.subdomains.length} Subdomains Found
                </Badge>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Discovered Subdomains</CardTitle>
                    <CardDescription>
                      The following subdomains were discovered for {url}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {results.subdomains.map((subdomain, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                          <Link className="h-4 w-4 text-primary" />
                          <span>{subdomain}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {results.exposedFiles.length > 0 && (
                  <div className="p-4 border rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <div className="flex gap-2 items-center">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">
                        {results.exposedFiles.length} potentially sensitive files detected!
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Switch to the Exposed Files tab to see the details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="exposedfiles">
          <Card>
            <CardHeader>
              <CardTitle>Exposed Files Detection</CardTitle>
              <CardDescription>
                Find potentially sensitive files and directories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input id="domain" placeholder="Enter domain (e.g., example.com)" />
                </div>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Find Exposed Files
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {results && results.exposedFiles.length > 0 && (
            <div className="result-card mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Exposed Files Results</h3>
                </div>
                <Badge variant="outline" className="text-amber-500">
                  {results.exposedFiles.length} Files Found
                </Badge>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                {results.exposedFiles.map((file, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{file.path}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Type: {file.type}</div>
                      </div>
                      <Badge variant="outline" className={getSensitivityColor(file.sensitivity)}>
                        {file.sensitivity.charAt(0).toUpperCase() + file.sensitivity.slice(1)} Risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
