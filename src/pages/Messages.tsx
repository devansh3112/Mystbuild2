
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Send, PaperclipIcon, CheckCheck, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for messages
const conversations = [
  {
    id: 1,
    with: {
      id: 101,
      name: "Emily Johnson",
      role: "editor",
      avatar: null,
      online: true
    },
    scriptTitle: "The Lost Chapter",
    lastMessage: "I've added some comments to Chapter 3. Could you review them?",
    timestamp: "10:35 AM",
    unread: 2
  },
  {
    id: 2,
    with: {
      id: 102,
      name: "Michael Smith",
      role: "editor",
      avatar: null,
      online: false
    },
    scriptTitle: "Midnight Dreams",
    lastMessage: "The changes for chapter 2 look great. I've approved them.",
    timestamp: "Yesterday",
    unread: 0
  },
  {
    id: 3,
    with: {
      id: 103,
      name: "Sarah Davis",
      role: "admin",
      avatar: null,
      online: true
    },
    scriptTitle: "General",
    lastMessage: "Your script has been scheduled for publication next month!",
    timestamp: "2 days ago",
    unread: 0
  }
];

// Sample messages for a conversation
const sampleMessages = [
  {
    id: 1,
    senderId: 101,
    text: "Hello! I've reviewed your manuscript and I have some suggestions.",
    timestamp: "10:20 AM",
    status: "read"
  },
  {
    id: 2,
    senderId: "me",
    text: "Great! I'm looking forward to hearing your thoughts.",
    timestamp: "10:22 AM",
    status: "read"
  },
  {
    id: 3,
    senderId: 101,
    text: "In Chapter 3, I think the character development could be stronger. The protagonist's motivation isn't clear in the second scene.",
    timestamp: "10:25 AM",
    status: "read"
  },
  {
    id: 4,
    senderId: "me",
    text: "That makes sense. I was struggling with that part. Do you have any specific suggestions?",
    timestamp: "10:30 AM",
    status: "read"
  },
  {
    id: 5,
    senderId: 101,
    text: "I'd suggest adding a brief flashback or internal monologue to reveal more about their past experiences that are driving their current actions.",
    timestamp: "10:32 AM",
    status: "read"
  },
  {
    id: 6,
    senderId: 101,
    text: "Also, I've added some comments directly in the Google Doc. Could you review them and let me know what you think?",
    timestamp: "10:35 AM",
    status: "delivered"
  }
];

const Messages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(sampleMessages);
  
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
