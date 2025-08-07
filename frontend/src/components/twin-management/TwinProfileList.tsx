import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiService, TwinProfile } from "@/services/api";
import { Plus, Search, User, Phone, Mail, Globe } from "lucide-react";

interface TwinProfileListProps {
  onSelectTwin: (twin: TwinProfile) => void;
  onCreateNew: () => void;
}

export default function TwinProfileList({ onSelectTwin, onCreateNew }: TwinProfileListProps) {
  const [twins, setTwins] = useState<TwinProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTwins();
  }, []);

  const loadTwins = async () => {
    try {
      setLoading(true);
      setError(null);
      const twinList = await apiService.getAllTwins();
      setTwins(twinList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Twin profiles");
    } finally {
      setLoading(false);
    }
  };

  const filteredTwins = twins.filter(twin =>
    twin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    twin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    twin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading Twin profiles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Profiles</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button 
            onClick={loadTwins} 
            className="mt-3 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Twin Profiles</h2>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Twin
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search twins by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Twin List */}
      <div className="space-y-3">
        {filteredTwins.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching profiles found" : "No Twin profiles yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Create your first Twin profile to get started"}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Twin
              </Button>
            )}
          </div>
        ) : (
          filteredTwins.map((twin) => (
            <div
              key={twin.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTwin(twin)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {twin.firstName} {twin.lastName}
                  </h3>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {twin.email}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {twin.telephoneNumber}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      {twin.countryId}
                    </div>
                  </div>
                  
                  {twin.createdAt && (
                    <div className="mt-3 text-xs text-gray-500">
                      Created: {new Date(twin.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTwin(twin);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={loadTwins}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh List"}
        </Button>
      </div>
    </div>
  );
}
