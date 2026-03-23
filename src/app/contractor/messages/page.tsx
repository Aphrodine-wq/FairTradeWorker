"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { cn, getInitials } from "@shared/lib/utils";
import { useRealtimeChat } from "@shared/hooks/use-realtime";

// ─── Mock Data ────────────────────────────────────────────────────────────────

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

const CONVERSATIONS: Conversation[] = [
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
      {
        id: "m1",
        sender: "homeowner",
        text: "Hi, I saw your bid on my kitchen remodel. Really liked your portfolio.",
        timestamp: "Yesterday 3:15 PM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "Thanks Robert, I appreciate that. The scope looks straightforward — demo, new cabinets, and countertops. I've done a dozen similar projects in Cedar Park.",
        timestamp: "Yesterday 3:48 PM",
        status: "read",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "Good to hear. My main concern is the timeline. We're hosting family in late April so I need it done before then.",
        timestamp: "Yesterday 4:02 PM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "Completely doable. With a crew of three I can finish the rough work in two weeks and finish work the week after. We'd be out well before late April.",
        timestamp: "Yesterday 4:20 PM",
        status: "read",
      },
      {
        id: "m5",
        sender: "homeowner",
        text: "That's exactly what I needed to hear. Can you come by Tuesday for a walkthrough?",
        timestamp: "10:42 AM",
      },
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
      {
        id: "m1",
        sender: "homeowner",
        text: "We had hail damage last week. The insurance company approved the claim. Need a licensed roofer ASAP.",
        timestamp: "Mon 8:30 AM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "I work insurance claims regularly. I can have a crew ready within 48 hours of final approval. What's your shingle preference — architectural or impact-resistant?",
        timestamp: "Mon 9:05 AM",
        status: "read",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "Whatever the adjuster recommends. I just want it done right the first time.",
        timestamp: "Mon 9:22 AM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "Understood. I'll bring my own documentation and photos so there's no dispute on scope.",
        timestamp: "Mon 9:45 AM",
        status: "delivered",
      },
      {
        id: "m5",
        sender: "homeowner",
        text: "The insurance adjuster comes Friday. Can you be there?",
        timestamp: "9:18 AM",
      },
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
      {
        id: "m1",
        sender: "homeowner",
        text: "I want a 20x16 composite deck off the back door. How long does the permit process usually take in Austin?",
        timestamp: "Tue 11:00 AM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "Typically 2-3 weeks for a residential deck permit in Austin. I've got a good relationship with the city office so I can usually expedite it.",
        timestamp: "Tue 11:30 AM",
        status: "read",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "Perfect. Can you handle all the permit paperwork or do I need to be involved?",
        timestamp: "Tue 12:15 PM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "I handle everything. You just sign the owner authorization form and I take it from there.",
        timestamp: "Tue 12:40 PM",
        status: "read",
      },
      {
        id: "m5",
        sender: "homeowner",
        text: "Sounds good. I'll get the permit pulled this week.",
        timestamp: "Yesterday",
      },
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
      {
        id: "m1",
        sender: "homeowner",
        text: "The AC went out last night. It's a 2005 Carrier unit. I've already got two other quotes but yours is the most detailed.",
        timestamp: "Mon 7:45 AM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "A 2005 unit is past its useful life — repair cost rarely makes sense at that age. I'd recommend a 3-ton Trane 16 SEER. Qualifies for the federal efficiency credit too.",
        timestamp: "Mon 8:10 AM",
        status: "read",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "How much is the tax credit worth?",
        timestamp: "Mon 8:30 AM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "Up to $2,000 on the federal return for qualifying equipment. I can give you the product cert number for your accountant.",
        timestamp: "Mon 8:55 AM",
        status: "read",
      },
      {
        id: "m5",
        sender: "homeowner",
        text: "We're going with you. Send over the contract.",
        timestamp: "Mon",
      },
    ],
  },
  {
    id: "conv-5",
    homeownerName: "Tom Vasquez",
    jobTitle: "Bathroom Tile – Georgetown",
    lastMessage: "That tile sample you sent looks perfect.",
    lastTimestamp: "Fri",
    unread: false,
    online: false,
    messages: [
      {
        id: "m1",
        sender: "homeowner",
        text: "We want the master bath retiled — floor and shower surround. About 280 sqft total.",
        timestamp: "Fri 9:00 AM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "280 sqft is a two-day job for my tile crew. Are you looking at a specific tile size or style? Large format tiles (24x24) give a cleaner look with fewer grout lines.",
        timestamp: "Fri 9:25 AM",
        status: "read",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "We like that modern minimal look. Something that doesn't show dirt easily.",
        timestamp: "Fri 9:50 AM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "I'll send you a few samples. Rectified porcelain in a matte finish is your best bet — tight joints, easy to clean, very durable in wet areas.",
        timestamp: "Fri 10:15 AM",
        status: "delivered",
      },
      {
        id: "m5",
        sender: "homeowner",
        text: "That tile sample you sent looks perfect.",
        timestamp: "Fri",
      },
    ],
  },
  {
    id: "conv-6",
    homeownerName: "Diane Keller",
    jobTitle: "Foundation Crack Repair – Leander",
    lastMessage: "Okay, Tuesday at 9am works for the inspection.",
    lastTimestamp: "Thu",
    unread: false,
    online: false,
    messages: [
      {
        id: "m1",
        sender: "homeowner",
        text: "We have a horizontal crack in the foundation wall in the basement. About 8 feet long. Should I be worried?",
        timestamp: "Thu 2:00 PM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "Horizontal cracks can indicate lateral soil pressure — that's worth getting eyes on quickly. I wouldn't panic but don't wait either. Can I schedule an inspection this week?",
        timestamp: "Thu 2:20 PM",
        status: "read",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "How serious could it be? We're planning to sell in about a year.",
        timestamp: "Thu 2:35 PM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "Caught early, it's a straightforward epoxy injection or carbon fiber strap repair. Left alone, it becomes a major disclosure issue and kills deals. Better to fix it now and have the documentation.",
        timestamp: "Thu 2:55 PM",
        status: "read",
      },
      {
        id: "m5",
        sender: "homeowner",
        text: "Okay, Tuesday at 9am works for the inspection.",
        timestamp: "Thu",
      },
    ],
  },
];

// ─── Quick reply suggestions per conversation ──────────────────────────────────

const QUICK_REPLIES: Record<string, string[]> = {
  "conv-1": [
    "I'll be there Tuesday",
    "Let me check my schedule",
    "Can you send photos?",
    "I'll send an estimate",
  ],
  "conv-2": [
    "Yes, I can be there Friday",
    "What time works best?",
    "I'll bring my documentation",
    "Can you send photos?",
  ],
  "conv-3": [
    "Permit is ready to pull",
    "I'll send the auth form today",
    "Let me check my schedule",
    "I'll send an estimate",
  ],
  "conv-4": [
    "Contract is on its way",
    "I'll send it over now",
    "When can we schedule install?",
    "Do you have financing questions?",
  ],
  "conv-5": [
    "Glad you like it",
    "Ready to schedule?",
    "I'll send the final quote",
    "Can we do a site visit?",
  ],
  "conv-6": [
    "Tuesday at 9am confirmed",
    "I'll bring my inspection gear",
    "See you then",
    "I'll send a reminder",
  ],
};

const DEFAULT_QUICK_REPLIES = [
  "I'll be there",
  "Let me check my schedule",
  "Can you send photos?",
  "I'll send an estimate",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
        online ? "bg-green-500" : "bg-gray-300"
      )}
    />
  );
}

function ConversationRow({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors duration-100",
        isActive
          ? "bg-brand-50 border-l-2 border-l-brand-600"
          : "hover:bg-gray-50 border-l-2 border-l-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
            {getInitials(conv.homeownerName)}
          </div>
          <OnlineDot online={conv.online} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={cn(
                "text-sm truncate",
                conv.unread
                  ? "font-bold text-gray-900"
                  : "font-semibold text-gray-900"
              )}
            >
              {conv.homeownerName}
            </span>
            <span className="text-[11px] text-gray-400 flex-shrink-0">
              {conv.lastTimestamp}
            </span>
          </div>
          <p className="text-xs text-brand-700 font-medium truncate mb-0.5">
            {conv.jobTitle}
          </p>
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "text-xs truncate flex-1",
                conv.unread ? "text-gray-700 font-medium" : "text-gray-500"
              )}
            >
              {conv.lastMessage}
            </p>
            {conv.unread && conv.unreadCount && conv.unreadCount > 0 && (
              <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {conv.unreadCount}
              </span>
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
      <CheckCheck
        className={cn(
          "w-3 h-3",
          status === "read" ? "text-brand-400" : "text-gray-400"
        )}
      />
      <span className="text-[10px] text-gray-400">
        {status === "read" ? "Read" : "Delivered"}
      </span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isContractor = msg.sender === "contractor";
  return (
    <div
      className={cn(
        "flex flex-col max-w-[70%]",
        isContractor ? "items-end self-end" : "items-start self-start"
      )}
    >
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          isContractor
            ? "bg-brand-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        )}
      >
        {msg.text}
      </div>
      <span className="text-[11px] text-gray-400 mt-1 px-1">
        {msg.timestamp}
      </span>
      {isContractor && <ReadReceipt status={msg.status} />}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start self-start max-w-[70%]">
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "180ms", animationDuration: "1s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: "360ms", animationDuration: "1s" }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <MessageSquare className="w-7 h-7 text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          No conversation selected
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Choose a conversation from the list to start messaging.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContractorMessagesPage() {
  const [selectedId, setSelectedId] = useState<string>(CONVERSATIONS[0].id);
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time chat connection to Elixir backend
  const { messages: realtimeMessages, sendMessage } = useRealtimeChat(selectedId);

  const filtered = CONVERSATIONS.filter(
    (c) =>
      c.homeownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const active = selectedId
    ? CONVERSATIONS.find((c) => c.id === selectedId) ?? null
    : null;

  // Simulate typing indicator appearing occasionally after switching conversations
  useEffect(() => {
    if (!active) return;
    setShowTyping(false);

    // Only show typing for online homeowners, with a random delay
    if (!active.online) return;

    const delay = 2000 + Math.random() * 2000;
    const timer = setTimeout(() => {
      setShowTyping(true);
      const hideTimer = setTimeout(() => setShowTyping(false), 3000);
      typingTimerRef.current = hideTimer;
    }, delay);

    return () => {
      clearTimeout(timer);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSend() {
    if (!inputText.trim()) return;
    // Send to Elixir backend for real-time delivery
    sendMessage({ body: inputText.trim() });
    setInputText("");
  }

  function handleQuickReply(text: string) {
    setInputText(text);
  }

  const quickReplies = active
    ? (QUICK_REPLIES[active.id] ?? DEFAULT_QUICK_REPLIES)
    : DEFAULT_QUICK_REPLIES;

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        title="Messages"
        subtitle="Communicate with homeowners about their jobs"
      />

      <div className="flex flex-1 overflow-hidden border-t border-gray-100">
        {/* ── LEFT PANEL ── */}
        <div className="w-1/3 min-w-[260px] max-w-[340px] flex flex-col border-r border-gray-200 bg-white">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                No conversations found
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === selectedId}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {active ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700">
                    {getInitials(active.homeownerName)}
                  </div>
                  <OnlineDot online={active.online} />
                </div>

                {/* Name + job */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {active.homeownerName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {active.online ? (
                      <span className="text-green-600 font-medium">Online</span>
                    ) : (
                      active.jobTitle
                    )}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 border border-brand-200 rounded-md hover:bg-brand-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Project
                  </a>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    aria-label="Call homeowner"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                {active.messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {showTyping && <TypingIndicator />}
              </div>

              {/* Quick reply chips */}
              <div className="px-6 pt-3 pb-0 flex items-center gap-2 flex-wrap flex-shrink-0">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input bar */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-2 flex-shrink-0 mt-2">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="gap-2 flex-shrink-0"
                >
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
