import { Link, useLocation } from 'wouter';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSupabase } from '@/hooks/use-supabase';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';
import { useState } from 'react';

export default function Sidebar() {
  const [location] = useLocation();
  const { collapsed, toggleSidebar } = useSidebar();
  const { user } = useSupabase();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const sidebarWidth = collapsed ? "w-20" : "w-64";
  
  return (
    <>
      <div className={`hidden lg:flex flex-col h-screen ${sidebarWidth} bg-secondary border-r border-gray-dark fixed left-0 top-0 z-40 transition-all duration-300`}>
        <div className="p-4 border-b border-gray-dark flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold text-primary">JobTok</h1>}
          {collapsed && <span className="text-xl font-bold text-primary">JT</span>}
        </div>

        <nav className="flex flex-col flex-1 p-4 space-y-6">
          <div
            onClick={toggleSidebar}
            className={`nav-item flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg transition-colors cursor-pointer text-gray-medium hover:bg-gray-dark/10`}
          >
            <i className="ri-menu-line text-xl"></i>
            {!collapsed && <span className="font-medium">Menu</span>}
          </div>

          <Link href="/">
            <div className={`nav-item flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg transition-colors cursor-pointer ${location === '/' ? 'bg-primary/10 text-primary' : 'text-gray-medium hover:bg-gray-dark/10'}`}>
              <i className={`${location === '/' ? 'ri-home-4-fill' : 'ri-home-4-line'} text-xl`}></i>
              {!collapsed && <span className="font-medium">Home</span>}
            </div>
          </Link>

          <Link href="/discover">
            <div className={`nav-item flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg transition-colors cursor-pointer ${location === '/discover' ? 'bg-primary/10 text-primary' : 'text-gray-medium hover:bg-gray-dark/10'}`}>
              <i className={`${location === '/discover' ? 'ri-search-fill' : 'ri-search-line'} text-xl`}></i>
              {!collapsed && <span className="font-medium">Discover</span>}
            </div>
          </Link>

          <Link href="/messages">
            <div className={`nav-item flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg transition-colors cursor-pointer ${location === '/messages' ? 'bg-primary/10 text-primary' : 'text-gray-medium hover:bg-gray-dark/10'}`}>
              <i className={`${location === '/messages' ? 'ri-mail-fill' : 'ri-mail-line'} text-xl`}></i>
              {!collapsed && <span className="font-medium">Messages</span>}
            </div>
          </Link>

          <Link href="/profile">
            <div className={`nav-item flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg transition-colors cursor-pointer ${location === '/profile' ? 'bg-primary/10 text-primary' : 'text-gray-medium hover:bg-gray-dark/10'}`}>
              <i className={`${location === '/profile' ? 'ri-user-fill' : 'ri-user-line'} text-xl`}></i>
              {!collapsed && <span className="font-medium">Profile</span>}
            </div>
          </Link>
          <ThemeToggle />
        </nav>

        <div className="p-4 border-t border-gray-dark">
          {collapsed ? (
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 rounded-full bg-gray-medium flex items-center justify-center text-foreground cursor-pointer"
                onClick={() => !user && setShowAuthModal(true)}
              >
                {user ? (
                  <img 
                    src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                    alt={user.user_metadata.full_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="ri-user-line"></i>
                )}
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => !user && setShowAuthModal(true)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-medium flex items-center justify-center text-foreground">
                {user ? (
                  <img 
                    src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                    alt={user.user_metadata.full_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="ri-user-line"></i>
                )}
              </div>
              <div>
                {user ? (
                  <>
                    <p className="font-medium">{user.user_metadata.full_name}</p>
                    <p className="text-xs text-gray-medium">{user.email}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Guest User</p>
                    <p className="text-xs text-gray-medium">Sign in to continue</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}