import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import apiClient, { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Camera, 
  MapPin, 
  DollarSign,
  Package,
  FileText,
  Tag,
  ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner";

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  hostelBlock: string;
  contactMethod: string;
  images: File[];
}

export function SellItem() {
  const { setCurrentPage } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    hostelBlock: user?.hostelBlock || '',
    contactMethod: 'chat',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const categories = [
    'Furniture', 'Electronics', 'Books', 'Clothing', 'Appliances', 
    'Sports Equipment', 'Musical Instruments', 'Art Supplies', 'Other'
  ];

  const conditions = [
    'Like New', 'Excellent', 'Good', 'Fair', 'Poor'
  ];

  const hostelBlocks = [
    'Block A', 'Block B', 'Block C', 'Block D', 'Block E'
  ];

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).slice(0, 5 - formData.images.length);
    const newPreviews: string[] = [];
    
    newImages.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === newImages.filter(f => f.type.startsWith('image/')).length) {
            setPreviewImages(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.push('Valid price is required');
    }
    if (!formData.category) errors.push('Category is required');
    if (!formData.condition) errors.push('Condition is required');
    if (!formData.hostelBlock) errors.push('Hostel block is required');
    if (formData.images.length === 0) errors.push('At least one image is required');
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1) Request Cloudinary signature from backend
      const sigRes = await apiClient.post('/uploads/signature');
      const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

      // 2) Upload images directly to Cloudinary
      const uploadedUrls: string[] = [];
      for (const file of formData.images) {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', apiKey);
        form.append('timestamp', String(timestamp));
        form.append('signature', signature);
        form.append('folder', folder);

        const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadRes = await fetch(cloudUrl, { method: 'POST', body: form });
        const data = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(data.error?.message || 'Image upload failed');
        uploadedUrls.push(data.secure_url);
      }

      // 3) Create listing with the uploaded image URLs
      await api.listings.create({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        images: uploadedUrls,
        category: mapCategory(formData.category),
        condition: mapCondition(formData.condition),
        hostelBlock: formData.hostelBlock,
      });

      toast.success('Item listed successfully!');
      setCurrentPage('dashboard');
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || 'Failed to list item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper mappers to align UI labels with backend enums
  const mapCategory = (c: string) => {
    const map: Record<string,string> = {
      'Sports Equipment': 'Sports',
      'Musical Instruments': 'Others',
      'Art Supplies': 'Others',
      'Other': 'Others'
    };
    return (map[c] || c);
  };

  const mapCondition = (c: string) => {
    const allowed = ['Like New','Excellent','Good','Fair'];
    return allowed.includes(c) ? c : 'Good';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sell Your Item
          </h1>
          <p className="text-gray-600 mt-2">List your item on Campus Resale Hub</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-white/80 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Provide the essential details about your item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Study Desk with Drawer"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail. Include condition, age, reason for selling, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white min-h-[120px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="1500"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="pl-10 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-3 border border-input rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <select
                      id="condition"
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full p-3 border border-input rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select condition</option>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostelBlock">Hostel Block *</Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        id="hostelBlock"
                        value={formData.hostelBlock}
                        onChange={(e) => handleInputChange('hostelBlock', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select your block</option>
                        {hostelBlocks.map(block => (
                          <option key={block} value={block}>{block}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="bg-white/80 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Product Images *
                </CardTitle>
                <CardDescription>
                  Upload up to 5 high-quality images of your item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Drag and drop images here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-600">
                    PNG, JPG, GIF up to 10MB each. Maximum 5 images.
                  </p>
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <ImageWithFallback
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs bg-blue-600">
                            Main
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Guidelines */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Safety Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Only list items you actually own</li>
                      <li>• Use clear, honest photos and descriptions</li>
                      <li>• Meet buyers in public campus areas</li>
                      <li>• Verify payment before handing over items</li>
                      <li>• Report any suspicious behavior</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage('dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Listing Item...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    List Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}