import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  ShoppingBag, 
  Plus, 
  User, 
  Settings, 
  LogOut,
  Home,
  Store,
  Heart,
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";

export function Navbar() {
  const { currentPage, setCurrentPage } = useApp();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"`);
      setCurrentPage('dashboard');
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'sell', label: 'Sell', icon: Plus },
    { id: 'profile', label: 'My Items', icon: ShoppingBag },
  ];

  const notifications = [
    { id: 1, message: 'New message from buyer', time: '2m ago', unread: true },
    { id: 2, message: 'Your item was favorited', time: '1h ago', unread: true },
    { id: 3, message: 'Price drop alert', time: '3h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  if (!user) return null;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage('dashboard')}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Campus Resale
                </span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
<div className="hidden md:flex items-center space-x-16">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Search Bar */}
<div className="flex-1 max-w-2xl mx-12 hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search items, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full bg-gray-50 border-gray-200 focus:bg-white"
              />
            </form>
          </div>

          {/* Right Side Actions */}
<div className="flex items-center space-x-8">
            {/* Cash Balance */}
            <motion.div 
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg cursor-pointer border border-green-100 shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={() => toast.success('Cash balance: ₹2,450')}
            >
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">₹2,450</span>
</motion.div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => toast.success(`${unreadCount} unread notifications`)}
className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 hover:bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </motion.button>
            </div>

            {/* Messages */}
            <motion.button
              onClick={() => setCurrentPage('chat')}
className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="w-5 h-5" />
</motion.button>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
className="flex items-center space-x-3 pl-1 pr-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.hostelBlock}</p>
                </div>
              </motion.button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <button
              onClick={() => {
                setCurrentPage('profile');
                setShowProfileMenu(false);
              }}
              className="flex items-center space-x-4 pl-2 pr-4 py-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Favorites</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('settings');
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  {user.isAdmin && (
                    <button
                      onClick={() => {
                        setCurrentPage('admin');
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <hr className="my-2" />
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4 space-y-2"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full bg-gray-50 border-gray-200"
              />
            </form>

            {/* Mobile Navigation Items */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Mobile Cash Balance */}
            <div className="flex items-center justify-between w-full px-4 py-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-600">Cash Balance</span>
              </div>
              <span className="font-bold text-green-600">₹2,450</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}