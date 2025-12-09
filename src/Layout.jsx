import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Book, Settings, User, Palette } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Library', path: 'Library', icon: Book },
    { name: 'Profile', path: 'Profile', icon: User },
    { name: 'Manage Books', path: 'ManageBooks', icon: Settings },
    { name: 'Settings', path: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Colour Me Brazil
                </h1>
                <p className="text-xs text-gray-500">Explore Culture Through Art</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(({ name, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={createPageUrl(path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPageName === path
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-3">
          {navItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={createPageUrl(path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentPageName === path
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
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