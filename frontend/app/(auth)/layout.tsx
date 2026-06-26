export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-background flex items-start justify-center px-4 py-6 sm:items-center sm:p-6">
      {children}
    </div>
  )
}
