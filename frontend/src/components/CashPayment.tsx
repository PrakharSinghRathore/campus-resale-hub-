import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  DollarSign, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Truck,
  Shield,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { useApp } from '../App';
import { toast } from "sonner";
import { api } from '../lib/api';
import { socketManager } from '../lib/socket';

interface CashPaymentProps {
  product: {
    id: string;
    title: string;
    price: number;
    seller: {
      name: string;
      avatar: string;
      hostelBlock: string;
      rating: number;
    };
  };
  onClose: () => void;
}

export function CashPayment({ product, onClose }: CashPaymentProps) {
  const { user } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('cod');
  const [deliveryAddress, setDeliveryAddress] = useState({
    hostelBlock: user?.hostelBlock || '',
    roomNumber: '',
    landmark: '',
    instructions: ''
  });
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);

  const deliveryFee = 20;
  const platformFee = Math.ceil(product.price * 0.02); // 2% platform fee
  const totalAmount = product.price + deliveryFee + platformFee;
  const advanceRequired = Math.ceil(product.price * 0.2); // 20% advance

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === 'cod') {
        // Initiate OTP purchase flow
        await api.listings.initiatePurchase(String(product.id));
        toast.success('OTP sent to you. Share it with the seller to confirm.');
      } else {
        // Simulate advance payment
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Advance payment completed! Remaining amount due on delivery.');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to start purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    const handleOtp = (payload: { listingId: string; otp: string; expiresAt: string }) => {
      if (String(product.id) === payload.listingId) {
        setOtpCode(payload.otp);
        setOtpExpiresAt(payload.expiresAt);
      }
    };
    socketManager.on('purchase_otp', handleOtp);
    return () => socketManager.off('purchase_otp', handleOtp as any);
  }, [product.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Cash Payment</h2>
              <p className="text-gray-600">Secure campus delivery</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-gray-600">
                    Sold by {product.seller.name} • {product.seller.hostelBlock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cod' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center space-x-3">
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium">Cash on Delivery</h4>
                      <p className="text-sm text-gray-600">Pay when you receive</p>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="mt-3 flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Selected</span>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'advance' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('advance')}
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Advance Payment</h4>
                      <p className="text-sm text-gray-600">Pay ₹{advanceRequired} now</p>
                    </div>
                  </div>
                  {paymentMethod === 'advance' && (
                    <div className="mt-3 flex items-center space-x-1 text-blue-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Selected</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {paymentMethod === 'advance' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-blue-50 p-4 rounded-lg"
                >
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Advance Payment Benefits</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• Guaranteed item reservation</li>
                        <li>• Priority delivery scheduling</li>
                        <li>• Seller verification boost</li>
                        <li>• Easy refund if item doesn't match</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostelBlock">Hostel Block</Label>
                  <select
                    id="hostelBlock"
                    value={deliveryAddress.hostelBlock}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, hostelBlock: e.target.value }))}
                    className="w-full p-3 border border-input rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select block</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                    <option value="Block E">Block E</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g., 205"
                    value={deliveryAddress.roomNumber}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, roomNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  placeholder="e.g., Near the cafeteria"
                  value={deliveryAddress.landmark}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific instructions for the delivery person..."
                  value={deliveryAddress.instructions}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Item Price</span>
                <span>₹{product.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-green-600">₹{totalAmount}</span>
              </div>

              {paymentMethod === 'advance' && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pay Now</span>
                    <span className="font-bold text-blue-600">₹{advanceRequired}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Remaining (on delivery)</span>
                    <span>₹{totalAmount - advanceRequired}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* OTP Section (visible after initiation) */}
          {otpCode && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Your Delivery OTP</h4>
                    <p className="text-2xl font-bold tracking-widest text-amber-700">{otpCode}</p>
                    <p className="text-sm text-amber-800 mt-1">Share this code with the seller to confirm you received the item. Expires at {new Date(otpExpiresAt!).toLocaleTimeString()}.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Timeline */}
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Expected Delivery</h4>
                  <p className="text-sm text-green-700">
                    Within 2-4 hours during campus hours (9 AM - 9 PM)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Guidelines */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Safety Guidelines</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Verify item condition before payment</li>
                    <li>• Check seller ID at delivery</li>
                    <li>• Report any issues immediately</li>
                    <li>• Only deal with verified campus members</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !deliveryAddress.hostelBlock || !deliveryAddress.roomNumber}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'cod' ? 'Place COD Order' : `Pay ₹${advanceRequired} Now`}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}