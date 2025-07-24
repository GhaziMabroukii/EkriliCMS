import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send, Phone, Video, MoreVertical, Paperclip, Image as ImageIcon,
  Smile, ArrowLeft, MapPin, Calendar
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, User, Property } from "@shared/schema";
import { Link } from "wouter";

export default function Chat() {
  const [, params] = useRoute("/chat/:userId");
  const otherUserId = parseInt(params?.userId || "0");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages between users
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", otherUserId],
    queryFn: async () => {
      if (!isAuthenticated || !otherUserId) return [];
      const response = await fetch(`/api/messages/${otherUserId}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Message[];
    },
    enabled: !!isAuthenticated && !!otherUserId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Fetch other user details
  const { data: otherUser } = useQuery({
    queryKey: ["/api/users", otherUserId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/owner/${otherUserId}`);
      if (!response.ok) return null;
      const properties = await response.json();
      if (properties.length > 0) {
        // Get owner info from the first property
        const propertyResponse = await fetch(`/api/properties/${properties[0].id}`);
        if (propertyResponse.ok) {
          const propertyData = await propertyResponse.json();
          return propertyData.owner;
        }
      }
      return null;
    },
    enabled: !!otherUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        receiverId: otherUserId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-8">
            Vous devez être connecté pour accéder au chat.
          </p>
          <Link href="/auth/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto bg-white shadow-lg">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/tenant">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-mediterranean text-white font-bold">
                    {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    {otherUser?.firstName} {otherUser?.lastName}
                    {otherUser?.isVerified && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        ✅ Vérifié
                      </Badge>
                    )}
                  </h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span>En ligne • Répond en 12 min en moyenne</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex">
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 shimmer ${i % 2 === 0 ? '' : 'ml-auto'}`} style={{ height: '60px' }} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Démarrez une conversation
                      </h3>
                      <p className="text-gray-600 max-w-sm">
                        Envoyez un message à {otherUser?.firstName} pour commencer votre conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg chat-message ${
                            isOwn 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isOwn && message.isRead && (
                                <span className="ml-2">✓✓</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-12 chat-input"
                    />
                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-mediterranean hover:bg-blue-700 text-white btn-mediterranean"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Appuyez sur Entrée pour envoyer • {otherUser?.firstName} est en ligne
                </p>
              </div>
            </div>

            {/* Property Sidebar */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 p-4">
              <Card>
                <div className="relative h-32">
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                    alt="Property"
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Villa Moderne avec Piscine - Sidi Bou Said
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    Sidi Bou Said, Tunis
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix par nuit</span>
                      <span className="font-semibold">150 TND</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix par mois</span>
                      <span className="font-semibold">3,800 TND</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full bg-mediterranean hover:bg-blue-700 text-white btn-mediterranean">
                      Voir les détails
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Voir les disponibilités
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler {otherUser?.firstName}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir sur la carte
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
