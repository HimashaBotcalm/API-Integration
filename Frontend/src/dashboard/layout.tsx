import { Sidebar } from "./sidebar"

interface LayoutProps {
  children: React.ReactNode
  onNavigate: (view: string) => void
}

export function Layout({ children, onNavigate }: LayoutProps) {
  return (
    <div className="flex">
      <Sidebar onNavigate={onNavigate} />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}