import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Send, PaperclipIcon, CheckCheck, Clock, User, Phone, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Sample data for conversations - This will be replaced with real data
const conversations = [];

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call to fetch user's conversations
        // const response = await supabase
        //   .from('conversations')
        //   .select('*')
        //   .eq('user_id', user.id);
        
        // For now, start with empty array
        setLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);
  
  const filteredConversations = search 
    ? conversations.filter(conv => 
        conv.with.name.toLowerCase().includes(search.toLowerCase()) || 
        conv.scriptTitle.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;
    
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      senderId: "me",
      text: messageText,
      timestamp: "Just now",
      status: "sent"
    };
    
    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || "writer"}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-writer-primary"></div>
          <span className="ml-2">Loading conversations...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Empty state when no conversations
  if (conversations.length === 0) {
    return (
      <DashboardLayout role={user?.role || "writer"}>
        <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
          <h1 className="text-3xl font-bold mb-6 font-playfair">Messages</h1>
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start collaborating with editors and publishers to see your conversations here.
              </p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="writer">
      <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 font-playfair">Messages</h1>
        
        <div className="flex flex-1 overflow-hidden border rounded-lg bg-background">
          {/* Sidebar */}
          <div className="w-full max-w-xs border-r flex flex-col">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search messages..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <div className="px-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1">
                <TabsContent value="all" className="m-0">
                  {filteredConversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={cn(
                        "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedConversation.id === conversation.id && "bg-muted"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.with.avatar || undefined} />
                            <AvatarFallback className={conversation.with.role === "editor" ? "bg-editor-primary" : "bg-admin-primary"}>
                              {conversation.with.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.with.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium truncate">{conversation.with.name}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{conversation.scriptTitle}</p>
                          <p className="text-sm truncate mt-1">{conversation.lastMessage}</p>
                          <div className="flex justify-between items-center mt-1">
                            <Badge variant="outline" className="text-[10px] h-5 bg-muted font-normal">
                              {conversation.with.role === "editor" ? "Editor" : "Admin"}
                            </Badge>
                            {conversation.unread > 0 && (
                              <Badge className="bg-writer-primary">{conversation.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="unread" className="m-0">
                  {filteredConversations.filter(c => c.unread > 0).map((conversation) => (
                    <div 
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={cn(
                        "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedConversation.id === conversation.id && "bg-muted"
                      )}
                    >
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={conversation.with.avatar || undefined} />
                          <AvatarFallback className={conversation.with.role === "editor" ? "bg-editor-primary" : "bg-admin-primary"}>
                            {conversation.with.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium truncate">{conversation.with.name}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{conversation.scriptTitle}</p>
                          <p className="text-sm truncate mt-1">{conversation.lastMessage}</p>
                          <div className="flex justify-between items-center mt-1">
                            <Badge variant="outline" className="text-[10px] h-5 bg-muted font-normal">
                              {conversation.with.role === "editor" ? "Editor" : "Admin"}
                            </Badge>
                            {conversation.unread > 0 && (
                              <Badge className="bg-writer-primary">{conversation.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredConversations.filter(c => c.unread > 0).length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="mx-auto mb-2 opacity-50" />
                      <p>No unread messages</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
          
          {/* Chat window */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedConversation.with.avatar || undefined} />
                      <AvatarFallback className={selectedConversation.with.role === "editor" ? "bg-editor-primary" : "bg-admin-primary"}>
                        {selectedConversation.with.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConversation.with.name}</p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] h-5 bg-muted font-normal">
                          {selectedConversation.with.role === "editor" ? "Editor" : "Admin"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          • {selectedConversation.scriptTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon">
                      <Search size={16} />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={cn(
                          "flex",
                          message.senderId === "me" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[75%] rounded-lg p-3",
                            message.senderId === "me" 
                              ? "bg-writer-primary text-white" 
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div 
                            className={cn(
                              "flex items-center gap-1 mt-1",
                              message.senderId === "me" ? "justify-end" : "justify-start"
                            )}
                          >
                            <span className="text-xs opacity-80">{message.timestamp}</span>
                            {message.senderId === "me" && (
                              message.status === "read" 
                                ? <CheckCheck size={12} className="opacity-80" /> 
                                : message.status === "delivered" 
                                  ? <CheckCheck size={12} className="opacity-50" /> 
                                  : <Clock size={12} className="opacity-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <div className="flex items-end gap-2">
                    <Textarea 
                      placeholder="Type a message..." 
                      className="resize-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={1}
                    />
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon">
                        <PaperclipIcon size={16} />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()} 
                        className="bg-writer-primary hover:bg-writer-accent"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col p-8 text-center text-muted-foreground">
                <MessageSquare size={48} className="mb-4 opacity-40" />
                <h3 className="text-xl font-medium">No Conversation Selected</h3>
                <p className="mt-1">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
