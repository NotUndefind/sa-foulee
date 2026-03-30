import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: '#FAFAFA' }}
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo-removebg-preview.png"
            alt="La Neuville TAF sa Foulée"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
          <span className="text-lg font-semibold" style={{ color: '#FB3936' }}>La Neuville TAF sa Foulée</span>
        </Link>
      </div>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8"
        style={{ boxShadow: '0 2px 16px rgba(251,57,54,0.08)', border: '1px solid rgba(251,57,54,0.1)' }}
      >
        {children}
      </div>
      <p className="mt-6 text-xs" style={{ color: '#9CA3AF' }}>
        © {new Date().getFullYear()} La Neuville TAF sa Foulée
      </p>
    </div>
  )
}
