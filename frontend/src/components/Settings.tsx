import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download
} from 'lucide-react';
import { toast } from "sonner";

export function Settings() {
  const { setCurrentPage, user } = useApp();
  const { logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: 'Computer Science student passionate about sustainable living.',
    hostelBlock: user?.hostelBlock || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newMessages: true,
    priceDrops: true,
    itemSold: true,
    itemLiked: false,
    weeklyDigest: true,
    marketingEmails: false
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showLastSeen: true,
    showOnlineStatus: true,
    allowMessages: 'everyone',
    showRating: true,
    showItemCount: true
  });

  // App Preferences State
  const [appPreferences, setAppPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'INR',
    timeZone: 'Asia/Kolkata',
    itemsPerPage: 12,
    defaultSort: 'newest'
  });

  const handleAccountUpdate = () => {
    // Validate passwords if changing
    if (accountSettings.newPassword) {
      if (accountSettings.newPassword !== accountSettings.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (accountSettings.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }
    }
    
    toast.success('Account settings updated successfully');
  };

  const handleNotificationUpdate = () => {
    toast.success('Notification preferences saved');
  };

  const handlePrivacyUpdate = () => {
    toast.success('Privacy settings updated');
  };

  const handlePreferencesUpdate = () => {
    toast.success('App preferences saved');
  };

  const handleDeleteAccount = () => {
    // This would show a confirmation dialog in a real app
    toast.error('Account deletion is not available in this demo');
  };

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('dashboard')}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-xl font-semibold">Settings</h1>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 h-12">
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <Card className="bg-white/80 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-xl">{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={accountSettings.name}
                        onChange={(e) => setAccountSettings({...accountSettings, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={accountSettings.email}
                        onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={accountSettings.phone}
                        onChange={(e) => setAccountSettings({...accountSettings, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostel">Hostel Block</Label>
                      <Select value={accountSettings.hostelBlock} onValueChange={(value) => setAccountSettings({...accountSettings, hostelBlock: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hostel block" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A-Block">A-Block</SelectItem>
                          <SelectItem value="B-Block">B-Block</SelectItem>
                          <SelectItem value="C-Block">C-Block</SelectItem>
                          <SelectItem value="D-Block">D-Block</SelectItem>
                          <SelectItem value="E-Block">E-Block</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={accountSettings.bio}
                        onChange={(e) => setAccountSettings({...accountSettings, bio: e.target.value})}
                        placeholder="Tell others about yourself..."
                      />
                    </div>
                  </div>

                  <Button onClick={handleAccountUpdate} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={accountSettings.currentPassword}
                        onChange={(e) => setAccountSettings({...accountSettings, currentPassword: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={(e) => setAccountSettings({...accountSettings, newPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={(e) => setAccountSettings({...accountSettings, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAccountUpdate} variant="outline">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/80 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-green-600" />
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                        </div>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'newMessages', label: 'New Messages', desc: 'When someone sends you a message' },
                        { key: 'priceDrops', label: 'Price Drops', desc: 'When items in your wishlist drop in price' },
                        { key: 'itemSold', label: 'Item Sold', desc: 'When your listed items are sold' },
                        { key: 'itemLiked', label: 'Item Liked', desc: 'When someone likes your items' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of your activity' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <Label htmlFor={item.key}>{item.label}</Label>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                          <Switch
                            id={item.key}
                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, [item.key]: checked})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleNotificationUpdate} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/80 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and contact you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select value={privacySettings.profileVisibility} onValueChange={(value) => setPrivacySettings({...privacySettings, profileVisibility: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                          <SelectItem value="students">Students Only - Only verified students</SelectItem>
                          <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Who can message you?</Label>
                      <Select value={privacySettings.allowMessages} onValueChange={(value) => setPrivacySettings({...privacySettings, allowMessages: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="students">Verified Students Only</SelectItem>
                          <SelectItem value="following">People I Follow</SelectItem>
                          <SelectItem value="none">No One</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'showLastSeen', label: 'Show Last Seen', desc: 'Let others see when you were last active' },
                      { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you are online' },
                      { key: 'showRating', label: 'Show Rating', desc: 'Display your seller rating publicly' },
                      { key: 'showItemCount', label: 'Show Item Count', desc: 'Display how many items you have sold' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={item.key}>{item.label}</Label>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <Switch
                          id={item.key}
                          checked={privacySettings[item.key as keyof typeof privacySettings] as boolean}
                          onCheckedChange={(checked) => setPrivacySettings({...privacySettings, [item.key]: checked})}
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handlePrivacyUpdate} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    These actions are permanent and cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h3 className="font-medium text-red-800">Export Your Data</h3>
                      <p className="text-sm text-red-600">Download a copy of all your data</p>
                    </div>
                    <Button onClick={handleExportData} variant="outline" className="border-red-300 text-red-600">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h3 className="font-medium text-red-800">Delete Account</h3>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <Button onClick={handleDeleteAccount} variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* App Preferences */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-white/80 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>App Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={appPreferences.theme} onValueChange={(value) => setAppPreferences({...appPreferences, theme: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={appPreferences.language} onValueChange={(value) => setAppPreferences({...appPreferences, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={appPreferences.currency} onValueChange={(value) => setAppPreferences({...appPreferences, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                          <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Items Per Page</Label>
                      <Select value={appPreferences.itemsPerPage.toString()} onValueChange={(value) => setAppPreferences({...appPreferences, itemsPerPage: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8">8 items</SelectItem>
                          <SelectItem value="12">12 items</SelectItem>
                          <SelectItem value="16">16 items</SelectItem>
                          <SelectItem value="24">24 items</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Sort Order</Label>
                      <Select value={appPreferences.defaultSort} onValueChange={(value) => setAppPreferences({...appPreferences, defaultSort: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handlePreferencesUpdate} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}