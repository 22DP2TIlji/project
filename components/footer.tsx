import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-4 border-t text-center text-sm text-gray-600">
      <div className="container mx-auto px-4">
        <p>All rights reserved.</p>
        <p>
          Created with{" "}
          <Link href="https://www.webnode.com" className="underline">
            Webnode
          </Link>{" "}
          •{" "}
          <Link href="/cookies" className="underline">
            Cookie Policy
          </Link>
        </p>
      </div>
    </footer>
  )
}
