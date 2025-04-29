import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Mail, Phone, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

export function EmailPhoneIntelligence() {
  const [emailQuery, setEmailQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (activeTab === "email") {
        setResults({
          email: emailQuery,
          valid: true,
          breached: true,
          breachCount: 3,
          firstSeen: "2019-05-12",
          lastSeen: "2023-01-18",
          sources: ["Adobe", "LinkedIn", "Canva"],
          associatedNames: ["John Smith", "J. Smith"],
          associatedIPs: ["192.168.1.1", "10.0.0.1"],
        });
      } else {
        setResults({
          phone: phoneQuery,
          valid: true,
          carrier: "Verizon",
          location: "New York, USA",
          type: "Mobile",
          owner: "John Smith",
          riskScore: 12,
        });
      }
      setIsLoading(false);
      toast({
        title: "Search completed",
        description: `Found results for ${activeTab === "email" ? emailQuery : phoneQuery}`,
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The information has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Email & Phone Intelligence</h1>
      <p className="text-muted-foreground mb-8">
        Investigate email addresses and phone numbers to discover associated accounts, data breaches, and ownership information.
      </p>

      <Tabs defaultValue="email" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="email">Email Investigation</TabsTrigger>
          <TabsTrigger value="phone">Phone Investigation</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Intelligence</CardTitle>
              <CardDescription>
                Check if an email has been involved in data breaches or is associated with other online accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    className="pl-8"
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading || !emailQuery}>
                  {isLoading ? "Searching..." : "Search"}
                  {!isLoading && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle>Phone Intelligence</CardTitle>
              <CardDescription>
                Analyze phone numbers to discover carrier information, location, and associated identities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    className="pl-8"
                    value={phoneQuery}
                    onChange={(e) => setPhoneQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading || !phoneQuery}>
                  {isLoading ? "Searching..." : "Search"}
                  {!isLoading && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <Card>
            <CardContent className="pt-6">
              {activeTab === "email" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{results.email}</h3>
                      <Badge variant={results.valid ? "default" : "destructive"}>
                        {results.valid ? "Valid" : "Invalid"}
                      </Badge>
                      {results.breached && (
                        <Badge variant="destructive">Breached</Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Breach Information</h4>
                      <p className="text-sm text-muted-foreground mb-1">Breach Count: {results.breachCount}</p>
                      <p className="text-sm text-muted-foreground mb-1">First Seen: {results.firstSeen}</p>
                      <p className="text-sm text-muted-foreground">Last Seen: {results.lastSeen}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Associated Data</h4>
                      <p className="text-sm text-muted-foreground mb-1">Names: {results.associatedNames.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">IPs: {results.associatedIPs.join(", ")}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Breach Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.sources.map((source: string) => (
                        <Badge key={source} variant="outline">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{results.phone}</h3>
                      <Badge variant={results.valid ? "default" : "destructive"}>
                        {results.valid ? "Valid" : "Invalid"}
                      </Badge>
                      <Badge variant={results.riskScore > 50 ? "destructive" : "default"}>
                        Risk: {results.riskScore}/100
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Phone Information</h4>
                      <p className="text-sm text-muted-foreground mb-1">Carrier: {results.carrier}</p>
                      <p className="text-sm text-muted-foreground mb-1">Type: {results.type}</p>
                      <p className="text-sm text-muted-foreground">Location: {results.location}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Owner Information</h4>
                      <p className="text-sm text-muted-foreground">Name: {results.owner}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
