import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Book, Settings, User, Palette, ShoppingBag } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Library', path: 'Library', icon: Book },
    { name: 'Shop', path: 'Shop', icon: ShoppingBag },
    { name: 'Profile', path: 'Profile', icon: User },
    { name: 'Settings', path: 'Settings', icon: Settings }
  ];

  const adminItems = [
    { name: 'Manage', path: 'ManageBooks', icon: Settings },
    { name: 'Brand', path: 'BrandGuidelines', icon: Palette }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #FFF8F0, #A8DADC)' }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-2" style={{ borderColor: '#FF6B35' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl('Library')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69383fc9e0a81f2fec355d14/fb45bdf53_A_beautiful_watercolor_toucan_bird_illustration_in-1765301342087.png"
                alt="Colour Me Brazil Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold" style={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Colour Me Brazil
                </h1>
                <p className="text-xs" style={{ color: '#6C757D' }}>Explore Culture Through Art</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={createPageUrl(path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === path
                      ? 'font-semibold shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  style={currentPageName === path ? {
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                    color: '#FFFFFF'
                  } : {
                    color: '#1A2332'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{name}</span>
                </Link>
              ))}
              
              <div className="w-px h-6 bg-gray-300 mx-2" />
              
              {adminItems.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={createPageUrl(path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    currentPageName === path
                      ? 'font-semibold shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  style={currentPageName === path ? {
                    background: 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
                    color: '#FFFFFF'
                  } : {
                    color: '#6C757D'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg" style={{ borderTop: '2px solid #FF6B35' }}>
        <div className="grid grid-cols-4 gap-1 py-2">
          {navItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={createPageUrl(path)}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all"
              style={{ color: currentPageName === path ? '#FF6B35' : '#6C757D' }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}