import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../App';
import { 
  ArrowLeft, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp,
  MessageSquare,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  DollarSign,
  Star,
  Download
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner";

const mockReports = [
  {
    id: 1,
    type: 'listing',
    title: 'Inappropriate item description',
    reportedItem: 'Gaming Laptop',
    reportedBy: 'John Doe',
    reason: 'Misleading information',
    status: 'pending',
    date: '2 hours ago',
    priority: 'high'
  },
  {
    id: 2,
    type: 'user',
    title: 'Suspicious seller behavior',
    reportedUser: 'fake_seller123',
    reportedBy: 'Sarah Wilson',
    reason: 'Not responding after payment',
    status: 'investigating',
    date: '1 day ago',
    priority: 'critical'
  }
];

const mockUsers = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@university.edu',
    hostelBlock: 'Block A',
    joinDate: '2024-09-15',
    status: 'active',
    itemsSold: 12,
    rating: 4.8,
    reports: 0
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@university.edu',
    hostelBlock: 'Block B',
    joinDate: '2024-09-10',
    status: 'suspended',
    itemsSold: 3,
    rating: 2.1,
    reports: 5
  }
];

const mockListings = [
  {
    id: 1,
    title: 'Study Desk',
    seller: 'Alice Johnson',
    price: 1200,
    status: 'active',
    reports: 0,
    views: 45,
    date: '2024-09-20'
  },
  {
    id: 2,
    title: 'Gaming Laptop',
    seller: 'Bob Smith',
    price: 45000,
    status: 'flagged',
    reports: 2,
    views: 120,
    date: '2024-09-18'
  }
];

export function AdminDashboard() {
  const { user, setCurrentPage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = {
    totalUsers: 2547,
    activeListings: 1234,
    totalSales: 156789,
    pendingReports: 8,
    monthlyGrowth: 12.5,
    avgRating: 4.6
  };

  const handleReportAction = (reportId: number, action: 'approve' | 'reject') => {
    toast.success(`Report ${action}d successfully`);
  };

  const handleUserAction = (userId: number, action: 'suspend' | 'activate' | 'ban') => {
    toast.success(`User ${action}d successfully`);
  };

  const handleListingAction = (listingId: number, action: 'approve' | 'remove') => {
    toast.success(`Listing ${action}d successfully`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage('dashboard')}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Campus Resale Hub Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                {stats.pendingReports} Pending Reports
              </Badge>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          <Card className="bg-white/80 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold">₹{stats.totalSales}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Content Reports</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-white/80"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => toast.success('Export functionality coming soon!')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {mockReports.map((report) => (
                  <Card key={report.id} className="bg-white/80 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{report.title}</h3>
                            <Badge 
                              variant={report.priority === 'critical' ? 'destructive' : 
                                      report.priority === 'high' ? 'default' : 'secondary'}
                            >
                              {report.priority}
                            </Badge>
                            <Badge variant="outline">
                              {report.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Reported {report.type}:</strong> {report.reportedItem || report.reportedUser}</p>
                            <p><strong>Reported by:</strong> {report.reportedBy}</p>
                            <p><strong>Reason:</strong> {report.reason}</p>
                            <p><strong>Date:</strong> {report.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReportAction(report.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">User Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 w-64 bg-white/80"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="bg-white/80 border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-4">User</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Hostel Block</th>
                          <th className="p-4">Join Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Items Sold</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4">Reports</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{user.email}</td>
                            <td className="p-4 text-sm">{user.hostelBlock}</td>
                            <td className="p-4 text-sm">{user.joinDate}</td>
                            <td className="p-4">
                              <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm">{user.itemsSold}</td>
                            <td className="p-4 text-sm">{user.rating}</td>
                            <td className="p-4">
                              <Badge variant={user.reports > 0 ? 'destructive' : 'secondary'}>
                                {user.reports}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {user.status === 'active' ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUserAction(user.id, 'activate')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Listing Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search listings..."
                      className="pl-10 w-64 bg-white/80"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="bg-white/80 border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-4">Title</th>
                          <th className="p-4">Seller</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Reports</th>
                          <th className="p-4">Views</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockListings.map((listing) => (
                          <tr key={listing.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{listing.title}</td>
                            <td className="p-4 text-sm">{listing.seller}</td>
                            <td className="p-4 text-sm font-medium">₹{listing.price}</td>
                            <td className="p-4">
                              <Badge variant={listing.status === 'active' ? 'default' : 'destructive'}>
                                {listing.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={listing.reports > 0 ? 'destructive' : 'secondary'}>
                                {listing.reports}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm">{listing.views}</td>
                            <td className="p-4 text-sm">{listing.date}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleListingAction(listing.id, 'approve')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleListingAction(listing.id, 'remove')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-xl font-semibold">Platform Analytics</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white/80 border-gray-200">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Monthly new user registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      📈 Chart would be rendered here with real data
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 border-gray-200">
                  <CardHeader>
                    <CardTitle>Sales Volume</CardTitle>
                    <CardDescription>Total sales over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      📊 Chart would be rendered here with real data
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}