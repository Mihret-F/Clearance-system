import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center justify-center gap-1">
        <span>© {new Date().getFullYear()} Digital Clearance System. Made with</span>
        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      </div>
    </footer>
  )
}
