import React from 'react';
import { createPageUrl } from './utils';
import { Book, Settings, User, Palette, ShoppingBag, Trophy, Upload, Shield, MessageSquare, Sparkles, Users, Menu, Image, BookOpen, Route, FileText, Bug } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import OfflineSyncIndicator from '@/components/offline/OfflineSyncIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import BugReportForm from '@/components/moderation/BugReportForm';

export default function Layout({ children, currentPageName }) {
  const [showBugReportModal, setShowBugReportModal] = React.useState(false);
  const currentProfileId = localStorage.getItem('currentProfileId');
  const menuItems = [
    { 
      category: 'Main',
      items: [
        { name: 'Home', path: 'Home', icon: Book },
        { name: 'Dashboard', path: 'Dashboard', icon: Sparkles },
        { name: 'Library', path: 'Library', icon: Book },
        { name: 'Perfis', path: 'UserProfileManagement', icon: Users },
        { name: 'Settings', path: 'ProfileSettings', icon: Settings },
        { name: 'Shop', path: 'Shop', icon: ShoppingBag }
      ]
    },
    {
      category: 'Community',
      items: [
        { name: 'My Gallery', path: 'ArtGallery', icon: Image },
        { name: 'AI Art Studio', path: 'AIArtStudio', icon: Sparkles },
        { name: 'Custom Books', path: 'CustomBookStudio', icon: BookOpen },
        { name: 'Published Books', path: 'PublishedBooks', icon: Sparkles },
        { name: 'Showcase', path: 'Showcase', icon: Sparkles },
        { name: 'Forum', path: 'Forum', icon: MessageSquare },
        { name: 'Stories', path: 'CollaborativeStories', icon: BookOpen },
        { name: 'Paths', path: 'ReadingPaths', icon: Route },
        { name: 'Submit', path: 'SubmitContent', icon: Upload }
      ]
      },
    {
      category: 'Gamification',
      items: [
        { name: 'Leaderboard', path: 'Leaderboard', icon: Trophy },
        { name: 'Events', path: 'Events', icon: Sparkles },
        { name: 'Rewards', path: 'RewardsShop', icon: ShoppingBag }
      ]
    },
    {
      category: 'Admin',
      items: [
        { name: 'Manage', path: 'ManageBooks', icon: Settings },
        { name: 'Users', path: 'ManageUsers', icon: Users },
        { name: 'Moderate', path: 'ContentModeration', icon: Shield },
        { name: 'Parent', path: 'ParentPortal', icon: FileText }
      ]
    }
  ];

  return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #FFF8F0, #A8DADC)' }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-2" style={{ borderColor: '#FF6B35' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={createPageUrl('Home')} className="flex items-center gap-2">
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
            </a>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              {/* Main Navigation Items */}
              {menuItems[0].items.map(({ name, path, icon: Icon }) => (
                <a
                  key={path}
                  href={createPageUrl(path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    currentPageName === path
                      ? 'font-semibold shadow-md'
                      : 'hover:shadow-sm hover:bg-gray-50'
                  }`}
                  style={currentPageName === path ? {
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                    color: '#FFFFFF'
                  } : {
                    color: '#6C757D'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{name}</span>
                </a>
              ))}

              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="w-4 h-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {menuItems.slice(1).map((category, idx) => (
                    <div key={category.category}>
                      {idx > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                        {category.category}
                      </DropdownMenuLabel>
                      {category.items.map(({ name, path, icon: Icon }) => (
                        <DropdownMenuItem key={path} asChild>
                          <a
                            href={createPageUrl(path)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{name}</span>
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBugReportModal(true)}
                className="gap-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                title="Reportar Bug"
              >
                <Bug className="w-4 h-4" />
                <span className="hidden xl:inline">Bug</span>
              </Button>
              </nav>
              </div>
              </div>
              </header>

              {/* Main Content */}
              <main className="container mx-auto px-4 py-8">
              {children}
              </main>

              {/* Offline Sync Indicator */}
              <OfflineSyncIndicator />

              {/* Bug Report Modal */}
              <Dialog open={showBugReportModal} onOpenChange={setShowBugReportModal}>
              <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-500" />
              Reportar Bug ou Problema
              </DialogTitle>
              <DialogDescription>
              Ajude-nos a melhorar! Descreva o problema e anexe um screenshot se possível.
              </DialogDescription>
              </DialogHeader>
              <BugReportForm 
              onClose={() => setShowBugReportModal(false)} 
              profileId={currentProfileId}
              currentUrl={typeof window !== 'undefined' ? window.location.href : ''}
              />
              </DialogContent>
              </Dialog>

              {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg" style={{ borderTop: '2px solid #FF6B35' }}>
        <div className="grid grid-cols-4 gap-1 py-2">
          {menuItems[0].items.map(({ name, path, icon: Icon }) => (
            <a
              key={path}
              href={createPageUrl(path)}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all"
              style={{ color: currentPageName === path ? '#FF6B35' : '#6C757D' }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{name}</span>
            </a>
          ))}
          <button 
            onClick={() => setShowBugReportModal(true)}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all"
            style={{ color: '#6C757D' }}
          >
            <Bug className="w-6 h-6" />
            <span className="text-xs font-medium">Bug</span>
          </button>
        </div>
      </nav>
    </div>
  );
}