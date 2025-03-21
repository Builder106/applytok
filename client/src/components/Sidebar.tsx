import { Link, useLocation } from 'wouter';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const [location] = useLocation();
  const { collapsed, toggleSidebar } = useSidebar();

  const sidebarWidth = collapsed ? "w-20" : "w-64";
  
  return (
    <div className={`hidden lg:flex flex-col h-screen ${sidebarWidth} bg-secondary border-r border-gray-dark fixed left-0 top-0 z-40 transition-all duration-300`}>
      <div className="p-4 border-b border-gray-dark flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold text-primary">JobTok</h1>}
        {collapsed && <span className="text-xl font-bold text-primary">JT</span>}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-dark/10 text-gray-medium"
        >
          <i className={`${collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} text-xl`}></i>
        </button>
      </div>

      <nav className="flex flex-col flex-1 p-4 space-y-6">
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
      </nav>

      <div className="p-4 border-t border-gray-dark">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-medium flex items-center justify-center text-white">
              <i className="ri-user-line"></i>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-medium flex items-center justify-center text-white">
              <i className="ri-user-line"></i>
            </div>
            <div>
              <p className="font-medium">Guest User</p>
              <p className="text-xs text-gray-medium">Sign in to continue</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}