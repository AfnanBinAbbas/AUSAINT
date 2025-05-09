import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function DownloadReport({ 
  isGenerating = false, 
  onGenerate 
}: { 
  isGenerating?: boolean;
  onGenerate: () => void;
}) {
  return (
    <Button
      onClick={onGenerate}
      disabled={isGenerating}
      className="w-full sm:w-auto"
    >
      {isGenerating ? (
        <>Generating...</>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Generate Report
        </>
      )}
    </Button>
  );
}

export default DownloadReport;
