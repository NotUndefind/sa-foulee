export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: '#F9F6F1' }}
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold"
          style={{ background: 'linear-gradient(135deg, #1E3A14 0%, #3A6B2A 100%)', boxShadow: '0 4px 12px rgba(30,58,20,0.25)' }}
        >
          sF
        </div>
        <span className="text-lg font-semibold" style={{ color: '#1E3A14' }}>sa Foulée</span>
      </div>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8"
        style={{ boxShadow: '0 2px 16px rgba(30,58,20,0.08)', border: '1px solid rgba(30,58,20,0.1)' }}
      >
        {children}
      </div>
      <p className="mt-6 text-xs" style={{ color: '#7A9E6E' }}>
        © {new Date().getFullYear()} sa Foulée — La Neuville
      </p>
    </div>
  )
}
