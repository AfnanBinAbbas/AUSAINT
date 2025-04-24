
import { useState } from "react";
import { GlobeIcon, Info, MapPin, Network, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function IPDomainIntelligence() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<null | {
    type: "ip" | "domain";
    info: Record<string, string>;
  }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    
    // Determine if input is IP or domain (simple check)
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(query);
    
    // Simulate API call with timeout
    setTimeout(() => {
      if (isIP) {
        setResults({
          type: "ip",
          info: {
            "IP Address": query,
            "Location": "San Francisco, CA, United States",
            "ISP": "Cloudflare, Inc.",
            "Organization": "Cloudflare, Inc.",
            "ASN": "AS13335",
            "Timezone": "America/Los_Angeles",
            "Status": "Active",
          },
        });
      } else {
        setResults({
          type: "domain",
          info: {
            "Domain": query,
            "Registrar": "GoDaddy.com, LLC",
            "Created Date": "2005-03-28",
            "Updated Date": "2023-03-28",
            "Expiry Date": "2027-03-28",
            "Name Servers": "ns1.example.com, ns2.example.com",
            "Status": "clientDeleteProhibited, clientRenewProhibited, clientTransferProhibited, clientUpdateProhibited",
          },
        });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IP & Domain Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          WHOIS lookup, geolocation data, and DNS analysis
        </p>
      </div>

      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lookup">IP/Domain Lookup</TabsTrigger>
          <TabsTrigger value="dns">DNS Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lookup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP/Domain Lookup</CardTitle>
              <CardDescription>
                Get detailed information about an IP address or domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="query">IP Address or Domain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="query"
                      placeholder="Enter IP address or domain"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {results && (
            <div className="result-card">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {results.type === "ip" ? (
                    <Network className="h-5 w-5 text-primary" />
                  ) : (
                    <GlobeIcon className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {results.type === "ip" ? "IP Information" : "Domain Information"}
                  </h3>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              {results.type === "ip" && (
                <div className="mb-4 rounded-md bg-muted p-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Located in: {results.info["Location"]}</span>
                </div>
              )}
              
              <div className="grid gap-2">
                {Object.entries(results.info).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                    <div className="font-medium">{key}</div>
                    <div className="col-span-2">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="dns">
          <Card>
            <CardHeader>
              <CardTitle>DNS Records Analysis</CardTitle>
              <CardDescription>
                Get DNS records for a domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input id="domain" placeholder="Enter domain name" />
                </div>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup DNS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
