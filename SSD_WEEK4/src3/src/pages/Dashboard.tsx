
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { SocialMediaIntelligence } from "@/components/tools/SocialMediaIntelligence";
import { IPDomainIntelligence } from "@/components/tools/IPDomainIntelligence";
import { EmailPhoneIntelligence } from "@/components/tools/EmailPhoneIntelligence";
import { WebScraping } from "@/components/tools/WebScraping";
import { SecureReporting } from "@/components/tools/SecureReporting";

export default function Dashboard() {
  // Remove the children prop! The Outlet is used for nested routes.
  return (
    <DashboardLayout />
  );
}

// Export tool components for route configuration
export const DashboardTools = {
  Overview: DashboardOverview,
  SocialMedia: SocialMediaIntelligence,
  IPDomain: IPDomainIntelligence,
  EmailPhone: EmailPhoneIntelligence,
  WebScraping: WebScraping,
  SecureReporting: SecureReporting,
};
