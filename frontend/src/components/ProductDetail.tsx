import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { CashPayment } from './CashPayment';
import { useApp } from '../App';
import { 
  ArrowLeft, 
  MessageCircle, 
  Star, 
  MapPin, 
  Calendar,
  Heart,
  Share2,
  Flag,
  ShieldCheck,
  Clock,
  Package,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { OtpModal } from './OtpModal';
import { BarcodeScanner } from './BarcodeScanner';

export function ProductDetail() {
  const { selectedProduct, setCurrentPage } = useApp();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(selectedProduct?.isFavorited || false);
  const [showFullDescription, setShowFullDescription] = useState(false);
const [showCashPayment, setShowCashPayment] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  if (!selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const handleContact = () => {
    setCurrentPage('chat');
toast.success('Opening community chat');
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleReport = () => {
    toast.success('Report submitted. We will review this listing.');
  };

const handleMarkSold = async (code: string) => {
    try {
      await api.listings.verifyPurchase(String(selectedProduct.id), code.trim());
      toast.success('Purchase confirmed');
      setShowOtp(false);
      setCurrentPage('dashboard');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to verify OTP');
    }
  };

  const sellerRating = selectedProduct.rating || 4.8;
  const totalReviews = 23;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
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
              Back to Marketplace
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
              >
                <Heart 
                  className={`w-5 h-5 ${
                    isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'
                  }`} 
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReport}
              >
                <Flag className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-[500px] object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-gray-700">
                  {selectedProduct.condition}
                </Badge>
              </div>
              
              {selectedProduct.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={image}
                        alt={`${selectedProduct.title} ${index + 2}`}
                        className="w-full h-24 object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{selectedProduct.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold text-green-600">₹{selectedProduct.price}</span>
                <Badge variant="secondary">{selectedProduct.category}</Badge>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedProduct.hostelBlock}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {selectedProduct.postedAt}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{selectedProduct.condition}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="bg-white/80 border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {showFullDescription 
                    ? selectedProduct.description + " This item has been well maintained and is in excellent working condition. Perfect for any student looking for quality items at affordable prices. The seller is responsive and can arrange for convenient pickup times."
                    : selectedProduct.description
                  }
                </p>
                {!showFullDescription && (
                  <button
                    onClick={() => setShowFullDescription(true)}
                    className="text-blue-600 hover:text-blue-700 mt-2 text-sm font-medium"
                  >
                    Read more
                  </button>
                )}
              </CardContent>
            </Card>

{/* Seller Info (anonymized) */}
            <Card className="bg-white/80 border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Seller</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-lg">Verified Seller</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{sellerRating}</span>
                        <span className="text-gray-500">({totalReviews} reviews)</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium text-lg">47</div>
                    <div className="text-gray-600">Items Sold</div>
                  </div>
                  <div>
                    <div className="font-medium text-lg">98%</div>
                    <div className="text-gray-600">Response Rate</div>
                  </div>
                  <div>
                    <div className="font-medium text-lg">2h</div>
                    <div className="text-gray-600">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                  Safety Tips
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Meet in public areas within the campus</li>
                  <li>• Inspect the item before making payment</li>
                  <li>• Use the in-app chat for all communications</li>
                  <li>• Report any suspicious behavior</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact & Verification */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowCashPayment(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Now (Cash)
                </Button>
                <Button 
                  onClick={handleContact}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                  size="lg"
                >
<MessageCircle className="w-5 h-5 mr-2" />
                  Ask in Community
                </Button>
                <Button 
                  variant="outline"
                  className="py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  size="lg"
                  onClick={() => setShowScanner(true)}
                >
                  Verify via Barcode
                </Button>
                {user && (
                  <Button 
                    onClick={() => setShowOtp(true)}
                    variant="outline"
                    className="py-3 border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
                    size="lg"
                  >
                    Mark as Sold/Received
                  </Button>
                )}
              </div>
              <Button 
                variant="outline"
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50"
                size="lg"
                onClick={() => toast.success('Purchase request sent to seller')}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Make Offer
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Items */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Study Chair', price: 600, rating: 4.7 },
              { title: 'Desk Organizer', price: 250, rating: 4.9 },
              { title: 'Table Lamp', price: 400, rating: 4.5 },
              { title: 'File Cabinet', price: 800, rating: 4.6 }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all bg-white/80 border-gray-200"
                onClick={() => toast.success(`Viewing ${item.title}`)}
              >
                <div className="relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1646596549459-9ccf652c5d23?w=400&h=200&fit=crop"
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700">
                    Good
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-lg font-bold text-green-600 mb-2">₹{item.price}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Block B</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cash Payment Modal */}
      {showCashPayment && (
        <CashPayment
          product={{
            id: selectedProduct.id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            seller: {
              name: selectedProduct.seller,
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
              hostelBlock: selectedProduct.hostelBlock,
              rating: 4.8
            }
          }}
          onClose={() => setShowCashPayment(false)}
        />
      )}
      {/* Barcode Scanner */}
      <BarcodeScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onDetected={async (code) => {
          try {
            const res = await (await import('../lib/api')).api.listings.verifyBarcode(String(selectedProduct.id), code);
            if (res.data.verified) {
              toast.success('Barcode verified for this item');
            } else {
              toast.error('Barcode does not match this item');
            }
          } catch (e:any) {
            toast.error('Failed to verify barcode');
          } finally {
            setShowScanner(false);
          }
        }}
      />

      {/* OTP Modal */}
      <OtpModal open={showOtp} title="Confirm Delivery (OTP)" onSubmit={handleMarkSold} onClose={() => setShowOtp(false)} />
    </div>
  );
}
