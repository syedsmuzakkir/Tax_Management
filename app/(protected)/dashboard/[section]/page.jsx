import { OverviewSection } from "@/components/dashboard/sections/overview-section"
import { UsersSection } from "@/components/dashboard/sections/users-section"
import { ReturnsSection } from "@/components/dashboard/sections/returns-section"
import { DocumentsSection } from "@/components/dashboard/sections/documents-section"
import { InvoicesSection } from "@/components/dashboard/sections/invoices-section"
import { ActivitySection } from "@/components/dashboard/sections/activity-section"
import { SettingsSection } from "@/components/dashboard/sections/settings-section"

import CustomersSection from "@/components/dashboard/sections/customers-section"
import PaymentsSection from "@/components/dashboard/sections/payments-section"

export default function DashboardSectionPage({ params }) {
  const section = params.section

  switch (section) {
    case "overview":
      return <OverviewSection />
    case "customers":
      return <CustomersSection />
    case "users":
      return <UsersSection />
    case "returns":
      return <ReturnsSection />
    case "documents":
      return <DocumentsSection />
    case "invoices":
      return <InvoicesSection />
    case "payments":
      return <PaymentsSection />
    case "activity":
      return <ActivitySection />
    case "settings":
      return <SettingsSection />
    default:
      return <OverviewSection />
  }
}
