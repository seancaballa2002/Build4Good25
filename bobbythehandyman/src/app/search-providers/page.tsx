"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Phone, User, MapPin, Clock, DollarSign, Star, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuoteResponse, FormData, Quote, Request } from "@/types"
import { useRouter, useSearchParams } from "next/navigation"

export default function SearchProvidersPage() {
  const [progress, setProgress] = useState(0)
  const [providersFound, setProvidersFound] = useState(0)
  const [providers, setProviders] = useState<Quote[]>([])
  const [searching, setSearching] = useState(true)
  const [userData, setUserData] = useState<FormData | null>(null)
  const [requestDetails, setRequestDetails] = useState<Request | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('requestId')

  useEffect(() => {
    const loadUserData = () => {
      try {
        // Check if window is defined (client-side only)
        if (typeof window === 'undefined') return;
        
        const savedData = sessionStorage.getItem('parsedFormData')
        if (!savedData) return;
        
        try {
          const userData = JSON.parse(savedData);
          if (userData && typeof userData === 'object') {
            setUserData(userData);
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    // Load request and quotes data from API
    const fetchQuotesData = async () => {
      if (!requestId) {
        // Try to load from session storage if no request ID in URL
        return loadFromSessionStorage();
      }
      
      setSearching(true);
      
      try {
        // Call our fetch-quotes API with the request ID
        const response = await fetch('/api/fetch-quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            requestId,
            refreshFromRetell: true // Always refresh on initial load
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        
        const result = await response.json();
        
        if (result.quotes && result.quotes.length > 0) {
          setProviders(result.quotes);
          setProvidersFound(result.quotes.length);
          setRequestDetails(result.request);
          setProgress(100);
          setSearching(false);
          setLastRefreshed(new Date());
          
          // Store in session storage for faster reloads
          try {
            sessionStorage.setItem('quoteResponses', JSON.stringify(result.quotes));
            sessionStorage.setItem('requestDetails', JSON.stringify(result.request));
          } catch (storageError) {
            console.error('Error storing quotes in session:', storageError);
          }
          
          return true;
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
      
      return false;
    };
    
    const loadFromSessionStorage = () => {
      try {
        // Check if window is defined (client-side only)
        if (typeof window === 'undefined') return false;
        
        const savedQuotes = sessionStorage.getItem('quoteResponses');
        const savedRequest = sessionStorage.getItem('requestDetails');
        
        if (!savedQuotes) return false;
        
        try {
          const quotes = JSON.parse(savedQuotes);
          
          // Make sure quotes is an array
          if (Array.isArray(quotes) && quotes.length > 0) {
            setProviders(quotes);
            setProvidersFound(quotes.length);
            setProgress(100);
            setSearching(false);
            
            if (savedRequest) {
              setRequestDetails(JSON.parse(savedRequest));
            }
            
            return true;
          }
        } catch (parseError) {
          console.error('Error parsing quote data:', parseError);
        }
        
        return false;
      } catch (error) {
        console.error('Error loading quote data:', error);
        return false;
      }
    };
    
    // Load user data for the summary section
    loadUserData();
    
    // Try to load request/quotes data
    fetchQuotesData().then(hasQuotes => {
      if (!hasQuotes) {
        // If we don't have quotes, simulate the search process
        const providerInterval = setInterval(() => {
          setProvidersFound((prev) => {
            if (prev >= 3) {
              clearInterval(providerInterval);
              return 3;
            }
            return prev + 1;
          });
        }, 2000);

        // Simulate progress bar
        const progressInterval = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(progressInterval);
              setSearching(false);
              return 100;
            }
            return prevProgress + 1;
          });
        }, 200);

        return () => {
          clearInterval(providerInterval);
          clearInterval(progressInterval);
        };
      }
    });
    
    // Set up periodic refresh interval
    const refreshInterval = setInterval(() => {
      if (requestId && !searching && !refreshing) {
        refreshQuotes();
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [requestId]);
  
  // Function to manually refresh quotes
  const refreshQuotes = async () => {
    if (!requestId || refreshing) return;
    
    console.log('Refreshing quotes for request:', requestId);
    setRefreshing(true);
    
    try {
      const response = await fetch('/api/fetch-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          requestId,
          refreshFromRetell: true
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.quotes && result.quotes.length > 0) {
          console.log('Received updated quotes:', result.quotes);
          setProviders(result.quotes);
          setProvidersFound(result.quotes.length);
          setLastRefreshed(new Date());
          
          // Update session storage
          try {
            sessionStorage.setItem('quoteResponses', JSON.stringify(result.quotes));
            sessionStorage.setItem('requestDetails', JSON.stringify(result.request));
          } catch (storageError) {
            console.error('Error storing quotes in session:', storageError);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing quotes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Setup auto-refresh interval - increase frequency to 5 seconds
  useEffect(() => {
    if (!requestId || searching) return;
    
    console.log('Setting up quote refresh interval');
    const interval = setInterval(() => {
      if (!refreshing) {
        console.log('Auto-refreshing quotes...');
        refreshQuotes();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [requestId, searching, refreshing]);

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Finding Handymen</CardTitle>
            <CardDescription>
              {searching 
                ? "We're contacting local providers to get quotes for your job." 
                : `${providersFound} quotes received for your job`}
            </CardDescription>
          </div>
          {!searching && requestId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshQuotes} 
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {searching && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{searching ? "Searching..." : "Search complete"}</span>
                <span>{providersFound} providers found</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Your Request Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Issue</p>
                  <p className="text-sm text-muted-foreground">
                    {requestDetails?.issue || userData?.issue || "Unknown issue"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {userData?.name || "Guest"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {requestDetails?.address || userData?.address || "No address provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-sm text-muted-foreground">
                    {requestDetails?.times_available || 
                     (userData?.timesAvailable && userData.timesAvailable.join(", ")) || 
                     "Flexible"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:col-span-2">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Price Range</p>
                  <p className="text-sm text-muted-foreground">
                    {requestDetails?.desired_price_range || 
                     userData?.desiredPriceRange || 
                     "$50-$150"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {searching && (
            <p className="text-sm text-center text-muted-foreground">
              This process typically takes 1-2 minutes. Please don't close this page.
            </p>
          )}
          
          {lastRefreshed && !searching && (
            <p className="text-xs text-center text-muted-foreground">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Provider Cards Section */}
      {providers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Service Providers</h2>

          {providers.map((provider, index) => (
            <Card key={index} className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{provider.handyman_name}</h3>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm">{provider.handyman_rating?.toFixed(1) || "4.5"}</span>
                      </div>
                    </div>
                    
                    {/* Call Status Badge */}
                    {provider.call_status && (
                      <div className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${refreshing ? 'bg-blue-100 text-blue-800' :
                        provider.call_status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                        provider.call_status === 'completed' ? 'bg-green-100 text-green-800' : 
                        provider.call_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {refreshing ? 'Refreshing...' :
                         provider.call_status === 'in-progress' ? 'Call in progress' : 
                         provider.call_status === 'completed' ? 'Call completed' : 
                         provider.call_status === 'failed' ? 'Call failed' :
                         provider.call_status}
                      </div>
                    )}
                    
                    {/* Call Summary */}
                    {provider.call_summary && (
                      <p className="text-sm italic bg-gray-50 p-2 rounded">
                        "{provider.call_summary}"
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Today at {new Date().getHours() + 1}:00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${provider.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>1-2 hours</span>
                      </div>
                      {provider.handyman_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{provider.handyman_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button className="w-full md:w-auto">Book Now</Button>
                    <Button variant="outline" className="w-full md:w-auto flex items-center gap-1">
                      Details <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


