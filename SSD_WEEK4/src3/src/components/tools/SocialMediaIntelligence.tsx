
import { useState } from "react";
import { Search, Share, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SocialMediaIntelligence() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<null | {
    found: { name: string; url: string; category: string }[];
  }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setResults({
        found: [
          { name: "Twitter", url: `https://twitter.com/${username}`, category: "social" },
          { name: "GitHub", url: `https://github.com/${username}`, category: "tech" },
          { name: "Instagram", url: `https://instagram.com/${username}`, category: "social" },
          { name: "LinkedIn", url: `https://linkedin.com/in/${username}`, category: "professional" },
          { name: "Reddit", url: `https://reddit.com/user/${username}`, category: "forum" },
        ],
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Media Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Find social media profiles and analyze digital footprint
        </p>
      </div>

      <Tabs defaultValue="username" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="username">Username Search</TabsTrigger>
          <TabsTrigger value="leaks">Credential Leaks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="username" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Username Lookup</CardTitle>
              <CardDescription>
                Find user profiles across multiple platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      placeholder="Enter username to search"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
            <div className="result-card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Results for "{username}"</h3>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.found.map((profile) => (
                    <Card key={profile.name} className="overflow-hidden">
                      <div className="bg-primary/10 p-4">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{profile.name}</h4>
                            <a 
                              href={profile.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate block"
                            >
                              {profile.url}
                            </a>
                          </div>
                          <Badge variant="secondary">{profile.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="leaks">
          <Card>
            <CardHeader>
              <CardTitle>Credential Leak Check</CardTitle>
              <CardDescription>
                Search for leaked credentials in data breaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="Enter email to check for breaches" />
                </div>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Check Breaches
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
