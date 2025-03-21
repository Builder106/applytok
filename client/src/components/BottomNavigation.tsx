import { Link, useLocation } from 'wouter';

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-secondary border-t border-gray-dark flex justify-around items-center z-50">
      <Link href="/">
        <div className={`nav-item flex flex-col items-center cursor-pointer ${location === '/' ? 'text-primary' : 'text-gray-medium'}`}>
          <i className={`${location === '/' ? 'ri-home-4-fill' : 'ri-home-4-line'} text-xl`}></i>
          <div className="nav-label text-xs mt-1">Home</div>
        </div>
      </Link>
      
      <Link href="/discover">
        <div className={`nav-item flex flex-col items-center cursor-pointer ${location === '/discover' ? 'text-primary' : 'text-gray-medium'}`}>
          <i className={`${location === '/discover' ? 'ri-search-fill' : 'ri-search-line'} text-xl`}></i>
          <div className="nav-label text-xs mt-1">Discover</div>
        </div>
      </Link>
      
      <Link href="/messages">
        <div className={`nav-item flex flex-col items-center cursor-pointer ${location === '/messages' ? 'text-primary' : 'text-gray-medium'}`}>
          <i className={`${location === '/messages' ? 'ri-mail-fill' : 'ri-mail-line'} text-xl`}></i>
          <div className="nav-label text-xs mt-1">Messages</div>
        </div>
      </Link>
      
      <Link href="/profile">
        <div className={`nav-item flex flex-col items-center cursor-pointer ${location === '/profile' ? 'text-primary' : 'text-gray-medium'}`}>
          <i className={`${location === '/profile' ? 'ri-user-fill' : 'ri-user-line'} text-xl`}></i>
          <div className="nav-label text-xs mt-1">Profile</div>
        </div>
      </Link>
    </nav>
  );
}
