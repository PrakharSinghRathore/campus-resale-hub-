import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../App';
import { 
  ArrowLeft, 
  Edit3, 
  Star, 
  ShoppingBag, 
  MessageCircle,
  Heart,
  Calendar,
  MapPin,
  Trophy,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner";
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// Removed mock listings; will load from API
const mockListings: any[] = [];

const mockReviews = [
  {
    id: 1,
    reviewer: "Sarah Wilson",
    rating: 5,
    comment: "Great seller! Item was exactly as described and pickup was smooth.",
    date: "2 weeks ago",
    item: "Gaming Chair"
  },
  {
    id: 2,
    reviewer: "Mike Johnson",
    rating: 4,
    comment: "Good communication and fair price. Would buy again.",
    date: "1 month ago",
    item: "Mini Fridge"
  }
];

export function Profile() {
  const { setCurrentPage } = useApp();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: 'Computer Science student passionate about sustainable living.',
    hostelBlock: user?.hostelBlock || '',
    joinedDate: 'September 2024'
  });

  const [myListings, setMyListings] = useState<any[]>([]);

  const stats = {
    itemsSold: myListings.filter(l => l.isSold).length,
    totalEarnings: 0,
    rating: user?.rating || 4.8,
    totalRatings: 47,
    responseRate: 98,
    activeListings: myListings.filter(l => l.isActive && !l.isSold).length
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.listings.getUserListings();
        const items = (data || []).map((l: any) => ({
          id: l.id || l._id,
          title: l.title,
          price: l.price,
          image: l.images?.[0],
          status: l.isSold ? 'Sold' : (l.isActive ? 'Active' : 'Inactive'),
          views: l.views || 0,
          likes: l.favoriteCount || 0,
          isActive: l.isActive,
          isSold: l.isSold,
          postedAt: new Date(l.createdAt || Date.now()).toLocaleDateString(),
        }));
        setMyListings(items);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load your listings');
      }
    };
    load();
  }, []);

  const markAsSold = async (id: string) => {
    const code = window.prompt('Enter the 6-digit OTP from the customer to confirm delivery:');
    if (!code) return;
    try {
      await api.listings.verifyPurchase(id, code.trim());
      setMyListings(prev => prev.map(l => l.id === id ? { ...l, isSold: true, isActive: false, status: 'Sold' } : l));
      toast.success('Purchase confirmed');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to verify OTP');
    }
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
            
            <Button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isEditing ? 'Save Changes' : <><Edit3 className="w-4 h-4 mr-2" />Edit Profile</>}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/80 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
            <CardContent className="p-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 mt-4 md:mt-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="text-2xl font-bold h-auto py-2"
                      />
                      <Input
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                      <p className="text-gray-600 mb-3">{profileData.bio}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.hostelBlock}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profileData.joinedDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{stats.rating} ({stats.totalRatings} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Button 
                    onClick={() => setCurrentPage('chat')}
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
<Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.itemsSold}</div>
              <div className="text-sm text-gray-600">Items Sold</div>
            </CardContent>
          </Card>
          
<Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">₹{stats.totalEarnings}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </CardContent>
          </Card>
          
<Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.rating}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80">
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Active Listings ({stats.activeListings})</h2>
<Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  Add New Listing
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <Card key={listing.id} className="bg-white/80 border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <ImageWithFallback
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          listing.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{listing.title}</h3>
<p className="text-lg font-bold text-emerald-700 mb-3">₹{listing.price}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>Posted {listing.postedAt}</span>
                        <div className="flex items-center space-x-3">
                          <span>{listing.views} views</span>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{listing.likes}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
<Button size="sm" variant="outline" className="flex-1 border-emerald-300 text-emerald-700">
                          Edit
                        </Button>
                        {listing.status === 'Active' && (
                          <Button size="sm" variant="outline" className="flex-1 border-amber-500 text-amber-600"
                            onClick={() => markAsSold(String(listing.id))}
                          >
                            Mark as Sold/Received
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="purchases" className="space-y-6">
              <h2 className="text-xl font-semibold">Purchase History</h2>
              <div className="text-center py-12 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No purchases yet</p>
                <p className="text-sm">Start browsing the marketplace to find great deals!</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <h2 className="text-xl font-semibold">Reviews ({mockReviews.length})</h2>
              
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="bg-white/80 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{review.reviewer}</div>
                              <div className="text-sm text-gray-600">Purchased: {review.item}</div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <div className="text-sm text-gray-600">{review.date}</div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <h2 className="text-xl font-semibold">Favorite Items</h2>
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No favorites yet</p>
                <p className="text-sm">Heart items you like to save them here!</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}