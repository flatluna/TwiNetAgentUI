import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiService, TwinProfile } from "@/services/api";
import { ChevronLeft, User, Mail, Phone, Globe, MessageSquare } from "lucide-react";

interface TwinProfileDetailsProps {
  twinId: string;
  onBack: () => void;
  onStartChat: (twin: TwinProfile) => void;
}

export default function TwinProfileDetails({ twinId, onBack, onStartChat }: TwinProfileDetailsProps) {
  const [twin, setTwin] = useState<TwinProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTwinDetails();
  }, [twinId]);

  const loadTwinDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const twinData = await apiService.getTwin(twinId);
      setTwin(twinData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Twin profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Profile</h3>
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={loadTwinDetails} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-800 font-medium mb-2">Profile Not Found</h3>
          <p className="text-yellow-600">The requested Twin profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {twin.firstName} {twin.lastName}
          </h2>
          <Badge variant="secondary">
            {twin.countryId}
          </Badge>
        </div>
        
        <Button onClick={() => onStartChat(twin)} className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Start Voice Chat
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {twin.firstName} {twin.lastName}
              </h3>
              <p className="text-gray-500">Twin Profile ID: {twin.id}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Contact Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{twin.email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{twin.telephoneNumber}</p>
                    <p className="text-xs text-gray-500">Phone Number</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{twin.countryId}</p>
                    <p className="text-xs text-gray-500">Country Code</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Profile Details
              </h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString()} {/* Placeholder - add timestamp to backend */}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Partition</p>
                  <p className="text-sm font-medium text-gray-900">{twin.countryId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Agent Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">AI Agent Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">Voice Chat</p>
                <p className="text-xs text-gray-500">Real-time conversation</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">Profile Aware</p>
                <p className="text-xs text-gray-500">Knows personal details</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">Context Aware</p>
                <p className="text-xs text-gray-500">Location & preferences</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline">
              Edit Profile
            </Button>
            <Button onClick={() => onStartChat(twin)} className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Start Voice Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
