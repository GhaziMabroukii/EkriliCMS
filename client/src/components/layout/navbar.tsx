import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, Heart, User, Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const [language, setLanguage] = useState("fr");
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Rechercher", href: "/listings", icon: Search },
    { name: "Carte", href: "/maps", icon: Search },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-mediterranean rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">Ekrili</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
            />
            
            {isAuthenticated ? (
              <>
                <Link href="/post-listing">
                  <Button className="bg-mediterranean hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Publier
                  </Button>
                </Link>
                
                <Link href={user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.firstName}
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-mediterranean hover:bg-blue-700 text-white">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location === item.href
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="px-4 mb-4">
                      <LanguageSelector 
                        currentLanguage={language} 
                        onLanguageChange={setLanguage}
                        variant="compact"
                      />
                    </div>
                    
                    {isAuthenticated ? (
                      <>
                        <Link
                          href="/post-listing"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <Plus className="h-5 w-5 mr-3" />
                          Publier une annonce
                        </Link>
                        
                        <Link
                          href={user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <User className="h-5 w-5 mr-3" />
                          Mon tableau de bord
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          Connexion
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          Inscription
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
