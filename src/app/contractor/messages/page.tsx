"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  ExternalLink,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
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

interface Message {
  id: string;
  sender: "homeowner" | "contractor";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  homeownerName: string;
  jobTitle: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: boolean;
  unreadCount?: number;
  online: boolean;
  messages: Message[];
}

// ─── Mock fallback data ──────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    homeownerName: "Robert Harmon",
    jobTitle: "Kitchen Remodel – Cedar Park",
    lastMessage: "Can you come by Tuesday for a walkthrough?",
    lastTimestamp: "10:42 AM",
    unread: true,
    unreadCount: 2,
    online: true,
    messages: [
      { id: "m1", sender: "homeowner", text: "Hi, I saw your bid on my kitchen remodel. Really liked your portfolio.", timestamp: "Yesterday 3:15 PM" },
      { id: "m2", sender: "contractor", text: "Thanks Robert, I appreciate that. The scope looks straightforward — demo, new cabinets, and countertops.", timestamp: "Yesterday 3:48 PM", status: "read" },
      { id: "m3", sender: "homeowner", text: "Good to hear. My main concern is the timeline. We're hosting family in late April.", timestamp: "Yesterday 4:02 PM" },
      { id: "m4", sender: "contractor", text: "Completely doable. With a crew of three I can finish the rough work in two weeks.", timestamp: "Yesterday 4:20 PM", status: "read" },
      { id: "m5", sender: "homeowner", text: "Can you come by Tuesday for a walkthrough?", timestamp: "10:42 AM" },
    ],
  },
  {
    id: "conv-2",
    homeownerName: "Linda Okafor",
    jobTitle: "Roof Replacement – Round Rock",
    lastMessage: "The insurance adjuster comes Friday. Can you be there?",
    lastTimestamp: "9:18 AM",
    unread: true,
    unreadCount: 1,
    online: false,
    messages: [
      { id: "m1", sender: "homeowner", text: "We had hail damage last week. The insurance company approved the claim.", timestamp: "Mon 8:30 AM" },
      { id: "m2", sender: "contractor", text: "I work insurance claims regularly. What's your shingle preference?", timestamp: "Mon 9:05 AM", status: "read" },
      { id: "m3", sender: "homeowner", text: "Whatever the adjuster recommends. I just want it done right.", timestamp: "Mon 9:22 AM" },
      { id: "m4", sender: "contractor", text: "Understood. I'll bring my own documentation and photos.", timestamp: "Mon 9:45 AM", status: "delivered" },
      { id: "m5", sender: "homeowner", text: "The insurance adjuster comes Friday. Can you be there?", timestamp: "9:18 AM" },
    ],
  },
  {
    id: "conv-3",
    homeownerName: "Marcus Dupree",
    jobTitle: "Deck Build – Austin",
    lastMessage: "Sounds good. I'll get the permit pulled this week.",
    lastTimestamp: "Yesterday",
    unread: false,
    online: true,
    messages: [
      { id: "m1", sender: "homeowner", text: "I want a 20x16 composite deck. How long does the permit process take?", timestamp: "Tue 11:00 AM" },
      { id: "m2", sender: "contractor", text: "Typically 2-3 weeks for a residential deck permit in Austin.", timestamp: "Tue 11:30 AM", status: "read" },
      { id: "m3", sender: "homeowner", text: "Sounds good. I'll get the permit pulled this week.", timestamp: "Yesterday" },
    ],
  },
  {
    id: "conv-4",
    homeownerName: "Cheryl Dawson",
    jobTitle: "HVAC Replacement – Pflugerville",
    lastMessage: "We're going with you. Send over the contract.",
    lastTimestamp: "Mon",
    unread: false,
    online: false,
    messages: [
      { id: "m1", sender: "homeowner", text: "The AC went out last night. It's a 2005 Carrier unit.", timestamp: "Mon 7:45 AM" },
      { id: "m2", sender: "contractor", text: "A 2005 unit is past its useful life — I'd recommend a 3-ton Trane 16 SEER.", timestamp: "Mon 8:10 AM", status: "read" },
      { id: "m3", sender: "homeowner", text: "We're going with you. Send over the contract.", timestamp: "Mon" },
    ],
  },
];

const QUICK_REPLIES: Record<string, string[]> = {
  "conv-1": ["I'll be there Tuesday", "Let me check my schedule", "Can you send photos?", "I'll send an estimate"],
  "conv-2": ["Yes, I can be there Friday", "What time works best?", "I'll bring my documentation"],
  "conv-3": ["Permit is ready to pull", "I'll send the auth form today", "Let me check my schedule"],
  "conv-4": ["Contract is on its way", "I'll send it over now", "When can we schedule install?"],
};

const DEFAULT_QUICK_REPLIES = ["I'll be there", "Let me check my schedule", "Can you send photos?", "I'll send an estimate"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-sm border-2 border-white", online ? "bg-emerald-700" : "bg-gray-300")} />
  );
}

function ConversationRow({ conv, isActive, onClick }: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors duration-100",
        isActive ? "bg-brand-50 border-l-2 border-l-brand-600" : "hover:bg-gray-50 border-l-2 border-l-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-sm bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-800">
            {getInitials(conv.homeownerName)}
          </div>
          <OnlineDot online={conv.online} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={cn("text-sm truncate", conv.unread ? "font-bold text-gray-900" : "font-semibold text-gray-900")}>{conv.homeownerName}</span>
            <span className="text-[11px] text-gray-600 flex-shrink-0">{conv.lastTimestamp}</span>
          </div>
          <p className="text-xs text-brand-700 font-medium truncate mb-0.5">{conv.jobTitle}</p>
          <div className="flex items-center gap-1.5">
            <p className={cn("text-xs truncate flex-1", conv.unread ? "text-gray-900 font-medium" : "text-gray-700")}>{conv.lastMessage}</p>
            {conv.unread && conv.unreadCount && conv.unreadCount > 0 && (
              <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-sm bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center px-1">{conv.unreadCount}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function ReadReceipt({ status }: { status?: "sent" | "delivered" | "read" }) {
  if (!status) return null;
  return (
    <div className="flex items-center gap-1 mt-0.5 px-1">
      <CheckCheck className={cn("w-3 h-3", status === "read" ? "text-brand-400" : "text-gray-600")} />
      <span className="text-[10px] text-gray-600">{status === "read" ? "Read" : "Delivered"}</span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isContractor = msg.sender === "contractor";
  return (
    <div className={cn("flex flex-col max-w-[70%]", isContractor ? "items-end self-end" : "items-start self-start")}>
      <div className={cn("px-4 py-2.5 rounded-sm text-sm leading-relaxed", isContractor ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-900")}>
        {msg.text}
      </div>
      <span className="text-[11px] text-gray-600 mt-1 px-1">{msg.timestamp}</span>
      {isContractor && <ReadReceipt status={msg.status} />}
    </div>
  );
}

function TypingIndicator({ names }: { names?: string[] }) {
  const label = names && names.length > 0 ? `${names[0]} is typing` : null;
  return (
    <div className="flex items-center gap-2 self-start max-w-[70%]">
      <div className="px-4 py-3 rounded-sm bg-gray-100 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-sm bg-gray-400 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
        <span className="w-1.5 h-1.5 rounded-sm bg-gray-400 animate-bounce" style={{ animationDelay: "180ms", animationDuration: "1s" }} />
        <span className="w-1.5 h-1.5 rounded-sm bg-gray-400 animate-bounce" style={{ animationDelay: "360ms", animationDuration: "1s" }} />
      </div>
      {label && <span className="text-[11px] text-gray-500">{label}</span>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center">
        <MessageSquare className="w-7 h-7 text-gray-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">No conversation selected</p>
        <p className="text-xs text-gray-600 leading-relaxed">Choose a conversation from the list to start messaging.</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContractorMessagesPage() {
  usePageTitle("Messages");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from API.
  useEffect(() => {
    fetchConversations().then(({ data, isMock: mock }) => {
      if (mock) {
        setConversations(MOCK_CONVERSATIONS);
        setSelectedId(MOCK_CONVERSATIONS[0]?.id ?? "");
        setIsMock(true);
        setLoading(false);
        return;
      }
      const mapped: Conversation[] = data.map((c: any) => ({
        id: c.id,
        homeownerName: c.other_user?.name || c.otherUserName || "Unknown",
        jobTitle: c.job_title || c.jobTitle || "",
        lastMessage: c.last_message?.body || c.lastMessage || "",
        lastTimestamp: c.last_message?.sent_at
          ? new Date(c.last_message.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "",
        unread: (c.unread_count || 0) > 0,
        unreadCount: c.unread_count || 0,
        online: c.other_user?.online ?? false,
        messages: [],
      }));
      setConversations(mapped);
      setSelectedId(mapped[0]?.id ?? "");
      setIsMock(false);
      setLoading(false);
    });
  }, []);

  // Real-time chat for the selected conversation
  const { messages: realtimeMessages, sendMessage, sendTyping, typingUsers } = useRealtimeChat(selectedId || null);

  const active = conversations.find((c) => c.id === selectedId) ?? null;

  // Merge realtime messages into conversation
  const displayMessages: Message[] = React.useMemo(() => {
    const mockMsgs = active?.messages ?? [];
    if (realtimeMessages.length === 0) return mockMsgs;

    const rtMsgs: Message[] = realtimeMessages.map((m) => ({
      id: m.id,
      sender: (typeof m.sender === "string" ? m.sender : m.sender?.role ?? "contractor") === "contractor" ? "contractor" : "homeowner",
      text: m.body,
      timestamp: new Date(m.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: "delivered" as const,
    }));

    const existingIds = new Set(mockMsgs.map((m) => m.id));
    const newMsgs = rtMsgs.filter((m) => !existingIds.has(m.id));
    return [...mockMsgs, ...newMsgs];
  }, [active, realtimeMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  function handleSend() {
    if (!inputText.trim() || !selectedId) return;
    const text = inputText.trim();

    // Optimistic add for mock mode
    if (isMock) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "contractor",
        text,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        status: "sent",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTimestamp: "Just now" }
            : c
        )
      );
    }

    sendMessage({ body: text });
    sendTyping(false);
    setInputText("");
  }

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

  const filtered = conversations.filter(
    (c) =>
      c.homeownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const quickReplies = active ? (QUICK_REPLIES[active.id] ?? DEFAULT_QUICK_REPLIES) : DEFAULT_QUICK_REPLIES;

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Messages" subtitle="Communicate with homeowners about their jobs" />
      {isMock && <FallbackBanner />}

      <div className="flex flex-1 overflow-hidden border-t border-gray-100">
        {/* Left panel */}
        <div className="w-1/3 min-w-[260px] max-w-[340px] flex flex-col border-r border-gray-200 bg-white">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <MessageListSkeleton />
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">No conversations found</div>
            ) : (
              filtered.map((conv) => (
                <ConversationRow key={conv.id} conv={conv} isActive={conv.id === selectedId} onClick={() => setSelectedId(conv.id)} />
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {active ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-sm bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700">
                    {getInitials(active.homeownerName)}
                  </div>
                  <OnlineDot online={active.online} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{active.homeownerName}</p>
                  <p className="text-xs text-gray-700 truncate">
                    {active.online ? <span className="text-emerald-950 font-medium">Online</span> : active.jobTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href="#" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 border border-brand-200 rounded-sm hover:bg-brand-50 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Project
                  </a>
                  <button className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors" aria-label="Call homeowner">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                {displayMessages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {typingUsers.length > 0 && <TypingIndicator names={typingUsers} />}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              <div className="px-6 pt-3 pb-0 flex items-center gap-2 flex-wrap flex-shrink-0">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleInputChange(reply)}
                    className="text-xs px-3 py-1.5 rounded-sm border border-gray-200 text-gray-800 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-2 flex-shrink-0 mt-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0" aria-label="Attach file">
                  <Paperclip className="w-4 h-4" />
                </button>
                <Input
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!inputText.trim()} className="gap-2 flex-shrink-0">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
