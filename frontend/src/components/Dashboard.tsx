import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Plus, 
  MessageCircle, 
  Star, 
  MapPin, 
  Calendar,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Heart,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner";
import { api } from '../lib/api';

const mockProducts = [
  {
    id: 1,
    title: "Study Desk with Drawer",
    price: 1200,
    images: ["https://images.unsplash.com/photo-1646596549459-9ccf652c5d23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZG9ybSUyMHJvb20lMjBmdXJuaXR1cmV8ZW58MXx8fHwxNzU4OTkyNzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    seller: "John Smith",
    rating: 4.8,
    hostelBlock: "Block A",
    condition: "Excellent",
    category: "Furniture",
    postedAt: "2 hours ago",
    description: "Perfect study desk with storage drawer. Used for 6 months.",
    isFavorited: false
  },
  {
    id: 2,
    title: "Gaming Chair",
    price: 800,
    images: ["https://images.unsplash.com/photo-1626548799742-ae94bc09c165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRwbGFjZSUyMHNlbGxpbmclMjBpdGVtc3xlbnwxfHx8fDE3NTg5OTI3NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"],
    seller: "Sarah Wilson",
    rating: 4.9,
    hostelBlock: "Block B",
    condition: "Good",
    category: "Furniture",
    postedAt: "5 hours ago",
    description: "Comfortable gaming chair with lumbar support.",
    isFavorited: true
  },
  {
    id: 3,
    title: "Mini Refrigerator",
    price: 2500,
    images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop"],
    seller: "Mike Johnson",
    rating: 4.7,
    hostelBlock: "Block A",
    condition: "Like New",
    category: "Appliances",
    postedAt: "1 day ago",
    description: "Compact fridge perfect for hostel rooms. Energy efficient.",
    isFavorited: false
  },
  {
    id: 4,
    title: "Study Lamp",
    price: 300,
    images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop"],
    seller: "Emma Davis",
    rating: 4.6,
    hostelBlock: "Block C",
    condition: "Good",
    category: "Electronics",
    postedAt: "3 days ago",
    description: "Adjustable LED study lamp with multiple brightness levels.",
    isFavorited: false
  }
];

export function Dashboard() {
  const { setCurrentPage, setSelectedProduct } = useApp();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Furniture', 'Electronics', 'Appliances', 'Books', 'Clothing', 'Sports', 'Kitchen', 'Decor', 'Others'];
  const conditions = ['All', 'Like New', 'Excellent', 'Good', 'Fair'];
  const hostelBlocks = ['All', 'Block A', 'Block B', 'Block C', 'Block D', 'Block E'];

  useEffect(() => {
    const mapListing = (l: any) => ({
      id: l.id,
      sellerId: l.sellerId,
      title: l.title,
      price: l.price,
      images: l.images,
      seller: user?.name || 'Seller',
      rating: 4.8,
      hostelBlock: l.hostelBlock,
      condition: l.condition,
      category: l.category,
      postedAt: new Date(l.createdAt || Date.now()).toLocaleDateString(),
      description: l.description,
      isFavorited: false,
    });

    const load = async () => {
      try {
        const { data } = await api.listings.getAll();
        const items = data.items || [];
        setProducts(items.map((l: any) => mapListing(l)));
      } catch (e: any) {
        console.error(e);
        toast.error('Failed to load listings');
      }
    };
    load();

    // Real-time updates via Socket.IO
    let cleanup = () => {};
    (async () => {
      try {
        const socket = await (await import('../lib/socket')).socketManager.connect();
        const { socketManager } = await import('../lib/socket');

        const handleNew = (l: any) => {
          setProducts(prev => [mapListing(l), ...prev]);
        };
        const handleUpdate = (l: any) => {
          setProducts(prev => prev
            .map(p => (p.id === l.id ? mapListing(l) : p))
            .filter(p => !(l.id === p.id && (l.isSold || l.isActive === false))));
        };
        const handleDelete = ({ id }: { id: string }) => {
          setProducts(prev => prev.filter(p => p.id !== id));
        };

        socketManager.onNewListing(handleNew);
        socketManager.onListingUpdate(handleUpdate);
        socketManager.onListingDeleted(handleDelete);

        const handlePurchaseConfirmed = ({ listingId, status }: { listingId: string; status: string }) => {
          if (status === 'confirmed') {
            toast.success('Purchase confirmed');
          }
        };
        socketManager.on('purchase_confirmed', handlePurchaseConfirmed as any);

        cleanup = () => {
          socketManager.off('new_listing', handleNew);
          socketManager.off('listing_update', handleUpdate);
          socketManager.off('listing_delete', handleDelete);
          socketManager.off('purchase_confirmed', handlePurchaseConfirmed as any);
        };
      } catch (e) {
        console.warn('Realtime connection failed, continuing without realtime', e);
      }
    })();

    return () => cleanup();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesCondition = selectedCondition === 'All' || product.condition === selectedCondition;
    const matchesBlock = selectedBlock === 'All' || product.hostelBlock === selectedBlock;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesBlock;
  });

  const toggleFavorite = (productId: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isFavorited: !product.isFavorited }
        : product
    ));
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items, categories, or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/80 border-gray-200"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/80"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center border rounded-lg bg-white/80">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sticky category strip */}
          <div className="sticky top-20 z-20 bg-white/90 backdrop-blur border-y py-2 -mx-4 px-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedCondition('All');
                    setSelectedBlock('All');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/80 rounded-lg p-4 border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Hostel Block</label>
                    <select
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white"
                    >
                      {hostelBlocks.map(block => (
                        <option key={block} value={block}>{block}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
<Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
                onClick={() => setCurrentPage('sell')}
              >
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6" />
                  <span className="font-medium">Sell Item</span>
                </div>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="p-4 cursor-pointer hover:shadow-lg transition-all bg-white/80 border-gray-200"
                onClick={() => {
                  const favoriteItems = products.filter(p => p.isFavorited);
                  toast.success(`You have ${favoriteItems.length} favorite items`);
                }}
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-red-500" />
                  <span className="font-medium">Favorites</span>
                </div>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="p-4 cursor-pointer hover:shadow-lg transition-all bg-white/80 border-gray-200"
                onClick={() => setCurrentPage('profile')}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-6 h-6 text-green-500" />
                  <span className="font-medium">My Listings</span>
                </div>
              </Card>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-all bg-white/80 border-gray-200" onClick={() => setCurrentPage('settings')}>
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-gray-500" />
                  <span className="font-medium">Settings</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Items</h2>
            <span className="text-gray-600">{filteredProducts.length} items found</span>
          </div>

<div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
          }>
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
<Card 
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 bg-white border border-gray-200 overflow-hidden ${
                      viewMode === 'list' ? 'flex flex-row' : ''
                    }`}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      <div className="relative">
<ImageWithFallback
                          src={product.images[0]}
                          alt={product.title}
                          className={`object-cover ${
                            viewMode === 'list' ? 'w-full h-32' : 'w-full h-48'
                          } group-hover:scale-105 transition-transform duration-300`}
                        />
                        <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">₹{product.price}</Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              product.isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'
                            }`} 
                          />
                        </button>
<Badge className="absolute top-2 right-2 bg-white/90 text-gray-700">
                          {product.condition}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                      <div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h3>
<p className="text-lg font-semibold text-emerald-700 mb-2 hidden md:block">₹{product.price}</p>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{product.hostelBlock}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{product.postedAt}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
<div className="flex items-center space-x-2">
                            <Badge variant="outline" className="border-emerald-600 text-emerald-700">Verified Seller</Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}