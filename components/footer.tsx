import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-4 border-t text-center text-sm text-gray-600">
      <div className="container mx-auto px-4">
        <p>Visas tiesības aizsargātas.</p>
        <p>
          <Link href="/cookies" className="underline">
            Sīkdatņu politika
          </Link>
        </p>
      </div>
    </footer>
  )
}