import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

export function Navbar() {
  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 shadow-sm">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* Logo moderne */}
        <Link href="/home" className="flex items-center space-x-3 mr-8">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TS
              </span>
            </div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            TimeScope
          </span>
        </Link>
        
        <div className="flex items-center space-x-2 ml-auto">
          {/* Navigation moderne */}
          <div className="hidden md:flex items-center space-x-1 mr-4">
            <Link href="/home">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                Accueil
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                À propos
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                Contact
              </Button>
            </Link>
          </div>
          
          {/* User Dropdown moderne */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-50 transition-colors">
                <Avatar className="h-9 w-9 border-2 border-gray-200 shadow-sm">
                  <AvatarImage src="/avatars/01.png" alt="John Doe" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center space-x-3 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/01.png" alt="John Doe" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-gray-900">John Doe</p>
                    <p className="text-xs leading-none text-gray-500">
                      Développeur Senior
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      john.doe@timescope.app
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center py-2 cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium">Administration</span>
                    <p className="text-xs text-gray-500">Gérer le système</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 hover:bg-gray-50 transition-colors">
                <div className="p-1.5 bg-gray-100 rounded-lg mr-3">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <span className="font-medium">Mon Profil</span>
                  <p className="text-xs text-gray-500">Paramètres personnels</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2 hover:bg-red-50 text-red-600 transition-colors">
                <div className="p-1.5 bg-red-100 rounded-lg mr-3">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <span className="font-medium">Se déconnecter</span>
                  <p className="text-xs text-red-400">Fermer la session</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
