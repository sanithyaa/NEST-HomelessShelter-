import { ShelterNavbar } from '@/components/shelter/ShelterNavbar'
import { ShelterSidebar } from '@/components/shelter/ShelterSidebar'

export default function ShelterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#FEF7F0] dark:bg-dark-bg overflow-hidden">
      <ShelterSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <ShelterNavbar />
        {children}
      </main>
    </div>
  )
}
