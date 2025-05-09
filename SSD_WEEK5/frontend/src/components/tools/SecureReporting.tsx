
import { useState } from "react";
import { Check, Download, FileDown, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DownloadReport from "../DownloadReport";

export function SecureReporting() {
  const [reportType, setReportType] = useState("standard");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const toggleModule = (module: string) => {
    if (selectedModules.includes(module)) {
      setSelectedModules(selectedModules.filter(m => m !== module));
    } else {
      setSelectedModules([...selectedModules, module]);
    }
  };

  const handleGenerateReport = () => {
    if (selectedModules.length === 0) return;
    
    setGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setGenerating(false);
      // In a real application, this would trigger a download or provide a link
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Secure Reporting</h1>
        <p className="text-muted-foreground mt-2">
          Export data as structured and encrypted reports
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="bg-primary/5 rounded-t-lg border-b">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Create Secure Report</CardTitle>
              </div>
              <CardDescription>
                Generate structured reports from your investigations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Report Type</h3>
                  <RadioGroup 
                    value={reportType} 
                    onValueChange={setReportType}
                    className="grid gap-4 grid-cols-1 md:grid-cols-3"
                  >
                    <div className={`border rounded-md p-4 ${reportType === "standard" ? "border-primary bg-primary/5" : ""}`}>
                      <RadioGroupItem value="standard" id="standard" className="sr-only" />
                      <Label htmlFor="standard" className="flex flex-col gap-2 cursor-pointer">
                        <span className="font-medium">Standard Report</span>
                        <span className="text-sm text-muted-foreground">Basic findings with key details</span>
                      </Label>
                    </div>
                    <div className={`border rounded-md p-4 ${reportType === "detailed" ? "border-primary bg-primary/5" : ""}`}>
                      <RadioGroupItem value="detailed" id="detailed" className="sr-only" />
                      <Label htmlFor="detailed" className="flex flex-col gap-2 cursor-pointer">
                        <span className="font-medium">Detailed Report</span>
                        <span className="text-sm text-muted-foreground">Comprehensive analysis with all data</span>
                      </Label>
                    </div>
                    <div className={`border rounded-md p-4 ${reportType === "executive" ? "border-primary bg-primary/5" : ""}`}>
                      <RadioGroupItem value="executive" id="executive" className="sr-only" />
                      <Label htmlFor="executive" className="flex flex-col gap-2 cursor-pointer">
                        <span className="font-medium">Executive Summary</span>
                        <span className="text-sm text-muted-foreground">High-level overview for stakeholders</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Include Modules</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="social" 
                        checked={selectedModules.includes("social")}
                        onCheckedChange={() => toggleModule("social")}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="social"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Social Media Intelligence
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Include social media profiles and findings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="ip" 
                        checked={selectedModules.includes("ip")}
                        onCheckedChange={() => toggleModule("ip")}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="ip"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          IP & Domain Intelligence
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Include IP and domain analysis data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="email" 
                        checked={selectedModules.includes("email")}
                        onCheckedChange={() => toggleModule("email")}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Email & Phone Intelligence
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Include breach data and contact analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="web" 
                        checked={selectedModules.includes("web")}
                        onCheckedChange={() => toggleModule("web")}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="web"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Web Scraping Data
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Include subdomain and exposed files data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="encrypt" 
                      checked={isEncrypted}
                      onCheckedChange={(checked) => setIsEncrypted(!!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="encrypt"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <Lock className="h-3.5 w-3.5 text-primary" />
                        Encrypt Report
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reports are encrypted with AES-256 encryption for maximum security
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedModules.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{selectedModules.length} modules selected</span>
                  </div>
                ) : (
                  <span>Select at least one module to include</span>
                )}
              </div>
              <Button 
                onClick={handleGenerateReport} 
                disabled={selectedModules.length === 0 || generating}
                className="w-full sm:w-auto"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <FileDown className="h-4 w-4 animate-pulse" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
          <Separator className="my-6" />
          <DownloadReport />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                View and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-8 text-center">
                <FileDown className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No reports generated yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your report history will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
