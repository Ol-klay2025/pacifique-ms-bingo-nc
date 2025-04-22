import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  GamepadIcon, 
  BarChart, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path ? "bg-primary text-primary-foreground" : "hover:bg-muted";
  };

  const menuItems = [
    { path: '/', label: 'Accueil', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/games', label: 'Parties', icon: <GamepadIcon className="mr-2 h-4 w-4" /> },
    { path: '/recommendations', label: 'Recommandations', icon: <BarChart className="mr-2 h-4 w-4" /> },
    { path: '/history', label: 'Historique', icon: <History className="mr-2 h-4 w-4" /> },
    { path: '/profile', label: 'Profil', icon: <User className="mr-2 h-4 w-4" /> }
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <Link href="/">
          <span className="text-xl font-bold cursor-pointer">MS BINGO</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background pt-16">
          <div className="flex flex-col p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`justify-start ${isActive(item.path)}`}
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href={item.path}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
            {user && (
              <Button
                variant="ghost"
                className="justify-start text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:flex h-screen flex-col border-r w-64">
        <div className="p-4 border-b">
          <Link href="/">
            <span className="text-xl font-bold cursor-pointer">MS BINGO</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isActive(item.path)}`}
                  asChild
                >
                  <Link href={item.path}>
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        {user && (
          <div className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full text-red-500" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default NavMenu;