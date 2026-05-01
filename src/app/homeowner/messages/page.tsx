"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Search } from "lucide-react";
import { AppHeader } from "@shared/components/app-header";
import { FallbackBanner } from "@shared/components/fallback-banner";
import { MessageListSkeleton } from "@shared/components/loading-skeleton";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { cn, getInitials } from "@shared/lib/utils";
import { useRealtimeChat } from "@shared/hooks/use-realtime";
import { usePageTitle } from "@shared/hooks/use-page-title";
import { fetchConversations } from "@shared/lib/data";

// ─── Types ───────────────────────────────────────────────────────────────────

type Sender = "homeowner" | "contractor";

interface Message {
  id: string;
  sender: Sender;
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  contractorId: string;
  contractorName: string;
  contractorCompany: string;
  jobTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

// ─── Mock fallback data ──────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1", contractorId: "c1", contractorName: "Marcus Johnson", contractorCompany: "Johnson & Sons Construction",
    jobTitle: "Kitchen Remodel - Full Gut & Rebuild", lastMessage: "I can be there Monday at 8am for the walkthrough.", lastTime: "10:42 AM", unread: 2,
    messages: [
      { id: "m1", sender: "homeowner", text: "Hi Marcus, I saw your bid on our kitchen remodel. Do you have time this week for a walkthrough?", time: "9:15 AM" },
      { id: "m2", sender: "contractor", text: "Thanks for reaching out! I'd love to walk the space — that's always my first step.", time: "9:31 AM" },
      { id: "m3", sender: "homeowner", text: "We're available Monday through Wednesday. Mornings work best.", time: "9:45 AM" },
      { id: "m4", sender: "contractor", text: "I can be there Monday at 8am for the walkthrough.", time: "10:42 AM" },
    ],
  },
  {
    id: "conv2", contractorId: "c2", contractorName: "Sarah Chen", contractorCompany: "Precision Electric LLC",
    jobTitle: "Electrical Panel Upgrade + EV Charger", lastMessage: "The Oncor disconnect is scheduled for Tuesday the 28th.", lastTime: "Yesterday", unread: 0,
    messages: [
      { id: "m5", sender: "homeowner", text: "Hi Sarah, we accepted your bid. When can we schedule the panel upgrade?", time: "Mar 17, 2:00 PM" },
      { id: "m6", sender: "contractor", text: "I've already submitted the city permit application and reached out to Oncor.", time: "Mar 17, 3:15 PM" },
      { id: "m7", sender: "contractor", text: "The Oncor disconnect is scheduled for Tuesday the 28th.", time: "Mar 18, 9:00 AM" },
    ],
  },
  {
    id: "conv3", contractorId: "c3", contractorName: "Robert Garcia", contractorCompany: "Garcia Plumbing Services",
    jobTitle: "Master Bathroom Full Renovation", lastMessage: "Can you confirm the Moen fixture model numbers?", lastTime: "Mar 16", unread: 1,
    messages: [
      { id: "m11", sender: "contractor", text: "I submitted a bid on your master bath renovation. Confirming Moen Brushed Gold fixtures?", time: "Mar 14, 11:00 AM" },
      { id: "m12", sender: "homeowner", text: "Good catch — we have the Moen Genta LX collection picked out.", time: "Mar 14, 1:30 PM" },
      { id: "m15", sender: "contractor", text: "Can you confirm the Moen fixture model numbers?", time: "Mar 16, 10:15 AM" },
    ],
  },
];

// ─── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["bg-brand-600", "bg-blue-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600"];
function avatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeownerMessagesPage() {
  usePageTitle("Messages");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState("");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversations from API
  useEffect(() => {
    fetchConversations().then(({ data, isMock: mock }) => {
      if (!mock && data.length > 0) {
        const mapped: Conversation[] = data.map((c: any) => ({
          id: c.id,
          contractorId: c.other_user?.id || c.id,
          contractorName: c.other_user?.name || "Contractor",
          contractorCompany: c.other_user?.company || "",
          jobTitle: c.job_title || "",
          lastMessage: c.last_message?.body || "",
          lastTime: c.last_message?.sent_at
            ? new Date(c.last_message.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : "",
          unread: c.unread_count || 0,
          messages: [],
        }));
        setConversations(mapped);
        if (mapped.length > 0) setActiveConvId(mapped[0].id);
      } else {
        setConversations(MOCK_CONVERSATIONS);
        setActiveConvId(MOCK_CONVERSATIONS[0].id);
        setIsMock(true);
      }
      setLoading(false);
    });
  }, []);

  const { messages: realtimeMessages, sendMessage, sendTyping, typingUsers } = useRealtimeChat(activeConvId || null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Merge realtime messages
  const displayMessages: Message[] = React.useMemo(() => {
    const mockMsgs = activeConv?.messages ?? [];
    if (realtimeMessages.length === 0) return mockMsgs;

    const rtMsgs: Message[] = realtimeMessages.map((m) => ({
      id: m.id,
      sender: ((typeof m.sender === "string" ? m.sender : m.sender?.role ?? "contractor") === "homeowner" ? "homeowner" : "contractor") as Sender,
      text: m.body,
      time: new Date(m.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }));

    const existingIds = new Set(mockMsgs.map((m) => m.id));
    const newMsgs = rtMsgs.filter((m) => !existingIds.has(m.id));
    return [...mockMsgs, ...newMsgs];
  }, [activeConv, realtimeMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !activeConvId) return;

    if (isMock) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "homeowner",
        text,
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: "Just now" }
            : c
        )
      );
    }

    sendMessage({ body: text });
    sendTyping(false);
    setInputText("");
  };

  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);
      if (value.trim()) {
        sendTyping(true);
        if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = setTimeout(() => sendTyping(false), 2000);
      } else {
        sendTyping(false);
      }
    },
    [sendTyping]
  );

  const filteredConvs = conversations.filter(
    (c) =>
      c.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title="Messages" subtitle="Conversations with contractors about your jobs" />
      {isMock && <FallbackBanner />}

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Left panel */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-white overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search conversations..." className="pl-8 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <MessageListSkeleton />
            ) : (
              filteredConvs.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 transition-colors",
                    conv.id === activeConvId ? "bg-brand-50 border-l-2 border-l-brand-600" : "hover:bg-gray-50"
                  )}
                >
                  <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm text-white text-xs font-bold", avatarColor(conv.contractorId))}>
                    {getInitials(conv.contractorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{conv.contractorName}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-gray-600">{conv.lastTime}</span>
                        {conv.unread > 0 && (
                          <span className="w-4 h-4 rounded-sm bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{conv.unread}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 truncate mt-0.5">{conv.jobTitle}</p>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
          {activeConv ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-border flex-shrink-0">
                <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm text-white text-xs font-bold", avatarColor(activeConv.contractorId))}>
                  {getInitials(activeConv.contractorName)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{activeConv.contractorName}</p>
                  <p className="text-xs text-gray-700">{activeConv.contractorCompany}</p>
                </div>
                <div className="ml-3">
                  <span className="text-xs text-gray-600 bg-gray-100 rounded-sm px-2.5 py-1 border border-gray-200">Re: {activeConv.jobTitle}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {displayMessages.map((msg) => {
                  const isHomeowner = msg.sender === "homeowner";
                  return (
                    <div key={msg.id} className={cn("flex items-end gap-2.5", isHomeowner ? "flex-row-reverse" : "flex-row")}>
                      {!isHomeowner && (
                        <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm text-white text-[10px] font-bold", avatarColor(activeConv.contractorId))}>
                          {getInitials(activeConv.contractorName)}
                        </div>
                      )}
                      <div className={cn("max-w-[68%] rounded-sm px-4 py-2.5", isHomeowner ? "bg-brand-600 text-white" : "bg-white text-gray-900 border border-gray-200 shadow-sm")}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={cn("text-[11px] mt-1", isHomeowner ? "text-brand-200" : "text-gray-600")}>{msg.time}</p>
                      </div>
                    </div>
                  );
                })}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-3 rounded-sm bg-white border border-gray-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-sm bg-gray-400 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                      <span className="w-1.5 h-1.5 rounded-sm bg-gray-400 animate-bounce" style={{ animationDelay: "180ms", animationDuration: "1s" }} />
                      <span className="w-1.5 h-1.5 rounded-sm bg-gray-400 animate-bounce" style={{ animationDelay: "360ms", animationDuration: "1s" }} />
                    </div>
                    <span className="text-[11px] text-gray-500">{typingUsers[0]} is typing</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-border flex-shrink-0">
                <Input
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Message ${activeConv.contractorName}...`}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!inputText.trim()} size="sm" className="gap-1.5 px-4">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              {loading ? "Loading..." : "Select a conversation"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
