"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Search } from "lucide-react";
import { AppHeader } from "@shared/components/app-header";
import { Input } from "@shared/ui/input";
import { Button } from "@shared/ui/button";
import { mockContractors } from "@shared/lib/mock-data";
import { cn, getInitials } from "@shared/lib/utils";
import { useRealtimeChat } from "@shared/hooks/use-realtime";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    contractorId: "c1",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    jobTitle: "Kitchen Remodel - Full Gut & Rebuild",
    lastMessage: "I can be there Monday at 8am for the walkthrough.",
    lastTime: "10:42 AM",
    unread: 2,
    messages: [
      {
        id: "m1",
        sender: "homeowner",
        text: "Hi Marcus, I saw your bid on our kitchen remodel. We're really impressed with your portfolio. Do you have time this week for a walkthrough?",
        time: "9:15 AM",
      },
      {
        id: "m2",
        sender: "contractor",
        text: "Thanks for reaching out! I'd love to walk the space — that's always my first step before locking in a final number. Kitchen remodels have a lot of variables once demo starts.",
        time: "9:31 AM",
      },
      {
        id: "m3",
        sender: "homeowner",
        text: "That makes sense. We're available Monday through Wednesday. Mornings work best for us since we both work from home in the afternoons.",
        time: "9:45 AM",
      },
      {
        id: "m4",
        sender: "contractor",
        text: "I can be there Monday at 8am for the walkthrough. I'll bring my project manager so we can scope the gas line relocation and check the subfloor condition at the same time.",
        time: "10:42 AM",
      },
    ],
  },
  {
    id: "conv2",
    contractorId: "c2",
    contractorName: "Sarah Chen",
    contractorCompany: "Precision Electric LLC",
    jobTitle: "Electrical Panel Upgrade + EV Charger",
    lastMessage: "The Oncor disconnect is scheduled for Tuesday the 28th.",
    lastTime: "Yesterday",
    unread: 0,
    messages: [
      {
        id: "m5",
        sender: "homeowner",
        text: "Hi Sarah, we accepted your bid. Just wanted to confirm — when can we expect to have the panel upgrade scheduled?",
        time: "Mar 17, 2:00 PM",
      },
      {
        id: "m6",
        sender: "contractor",
        text: "Great news — I've already submitted the city permit application and reached out to Oncor for the disconnect window. Should have confirmation by end of week.",
        time: "Mar 17, 3:15 PM",
      },
      {
        id: "m7",
        sender: "homeowner",
        text: "Perfect. One question — the Tesla charger we have is a Gen 3 Wall Connector. Is the 14-50 outlet going to work or should we do a hardwired circuit?",
        time: "Mar 17, 4:00 PM",
      },
      {
        id: "m8",
        sender: "contractor",
        text: "Great question. For the Gen 3 Wall Connector, I'd actually recommend hardwiring it directly instead of the 14-50. It'll give you the full 48A charging rate vs 32A through the outlet. No additional cost on my end — I'll swap the spec.",
        time: "Mar 17, 4:45 PM",
      },
      {
        id: "m9",
        sender: "homeowner",
        text: "Yes, let's do the hardwired option. That's a no-brainer.",
        time: "Mar 17, 5:00 PM",
      },
      {
        id: "m10",
        sender: "contractor",
        text: "The Oncor disconnect is scheduled for Tuesday the 28th. We'll be on site at 7am and should have the new panel live by end of day.",
        time: "Mar 18, 9:00 AM",
      },
    ],
  },
  {
    id: "conv3",
    contractorId: "c3",
    contractorName: "Robert Garcia",
    contractorCompany: "Garcia Plumbing Services",
    jobTitle: "Master Bathroom Full Renovation",
    lastMessage: "Can you confirm the Moen fixture model numbers before I order?",
    lastTime: "Mar 16",
    unread: 1,
    messages: [
      {
        id: "m11",
        sender: "contractor",
        text: "Hi there — I submitted a bid on your master bath renovation. I noticed you mentioned Moen Brushed Gold fixtures throughout. Just want to confirm which product line you're going with — the Moen Brushed Gold comes in a few collections and they don't all cross-connect.",
        time: "Mar 14, 11:00 AM",
      },
      {
        id: "m12",
        sender: "homeowner",
        text: "Good catch — we have the Moen Genta LX collection picked out for everything. Shower valve, hand shower, tub filler, and both vanity faucets.",
        time: "Mar 14, 1:30 PM",
      },
      {
        id: "m13",
        sender: "contractor",
        text: "Perfect, the Genta LX is a great choice and I've installed that collection many times. One thing to note — the tub filler for a freestanding tub is a floor-mount, not wall-mount. That changes the rough-in location slightly.",
        time: "Mar 14, 2:00 PM",
      },
      {
        id: "m14",
        sender: "homeowner",
        text: "Yes, we knew that. The plumber we talked to before mentioned the same thing. Can you include the floor-mount rough-in in your bid?",
        time: "Mar 15, 9:00 AM",
      },
      {
        id: "m15",
        sender: "contractor",
        text: "Already included. Can you confirm the Moen fixture model numbers before I order? I want to make sure I have the right supply rough-in dimensions for the freestanding tub filler.",
        time: "Mar 16, 10:15 AM",
      },
    ],
  },
  {
    id: "conv4",
    contractorId: "c4",
    contractorName: "James Mitchell",
    contractorCompany: "Mitchell Roofing Co.",
    jobTitle: "Full Roof Replacement — Insurance Claim",
    lastMessage: "We'll need about 30 minutes before the crew arrives.",
    lastTime: "Mar 15",
    unread: 0,
    messages: [
      {
        id: "m16",
        sender: "homeowner",
        text: "James, we're going with your bid. The State Farm adjuster gave us the green light and the approved scope matches your estimate almost exactly. When can you start?",
        time: "Mar 14, 3:00 PM",
      },
      {
        id: "m17",
        sender: "contractor",
        text: "Fantastic — let's get this done before the next storm season. I can have a crew on your roof Tuesday the 25th. Full tear-off and new system in two days if weather cooperates.",
        time: "Mar 14, 3:30 PM",
      },
      {
        id: "m18",
        sender: "homeowner",
        text: "Tuesday the 25th works. You mentioned you coordinate directly with State Farm — do I need to be home for that?",
        time: "Mar 14, 4:00 PM",
      },
      {
        id: "m19",
        sender: "contractor",
        text: "Not necessarily, but it helps to have you reachable by phone. The adjuster may call to confirm a few line items from my supplement before releasing the full payment.",
        time: "Mar 14, 4:45 PM",
      },
      {
        id: "m20",
        sender: "homeowner",
        text: "Got it. We'll be available by phone all day Tuesday.",
        time: "Mar 15, 8:30 AM",
      },
      {
        id: "m21",
        sender: "contractor",
        text: "We'll need about 30 minutes before the crew arrives to set up staging and confirm the neighbor's driveway is clear. I'll text you when we're pulling in.",
        time: "Mar 15, 9:15 AM",
      },
    ],
  },
];

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-brand-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

function avatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomeownerMessagesPage() {
  const [activeConvId, setActiveConvId] = useState("conv1");
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time chat connection — messages from the Elixir backend appear here
  const { messages: realtimeMessages, sendMessage } = useRealtimeChat(activeConvId);

  const activeConv = conversations.find((c) => c.id === activeConvId)!;

  // Merge real-time messages into the active conversation
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          const rtMsgs: Message[] = realtimeMessages.map((m) => ({
            id: m.id,
            sender: m.sender === "homeowner" ? "homeowner" as Sender : "contractor" as Sender,
            text: m.body,
            time: new Date(m.sent_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
          }));
          // Append real-time messages that aren't already in the mock list
          const existingIds = new Set(c.messages.map((m) => m.id));
          const newMsgs = rtMsgs.filter((m) => !existingIds.has(m.id));
          if (newMsgs.length === 0) return c;
          return {
            ...c,
            messages: [...c.messages, ...newMsgs],
            lastMessage: newMsgs[newMsgs.length - 1].text,
            lastTime: "Just now",
          };
        })
      );
    }
  }, [realtimeMessages, activeConvId]);

  // Scroll to bottom whenever active conversation or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "homeowner",
      text,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: text,
              lastTime: "Just now",
            }
          : c
      )
    );

    // Also send to Elixir backend for real-time delivery
    sendMessage({ sender: "homeowner", body: text });

    setInputText("");
  };

  const filteredConvs = conversations.filter(
    (c) =>
      c.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title="Messages" subtitle="Conversations with contractors about your jobs" />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* ── Left panel: conversation list ── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-white overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={cn(
                  "w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 transition-colors",
                  conv.id === activeConvId
                    ? "bg-brand-50 border-l-2 border-l-brand-600"
                    : "hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                    avatarColor(conv.contractorId)
                  )}
                >
                  {getInitials(conv.contractorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {conv.contractorName}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400">{conv.lastTime}</span>
                      {conv.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.jobTitle}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right panel: message thread ── */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-border flex-shrink-0">
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                avatarColor(activeConv.contractorId)
              )}
            >
              {getInitials(activeConv.contractorName)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{activeConv.contractorName}</p>
              <p className="text-xs text-gray-500">{activeConv.contractorCompany}</p>
            </div>
            <div className="ml-3">
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-1 border border-gray-200">
                Re: {activeConv.jobTitle}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {activeConv.messages.map((msg) => {
              const isHomeowner = msg.sender === "homeowner";
              return (
                <div
                  key={msg.id}
                  className={cn("flex items-end gap-2.5", isHomeowner ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar — only shown for contractor */}
                  {!isHomeowner && (
                    <div
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold",
                        avatarColor(activeConv.contractorId)
                      )}
                    >
                      {getInitials(activeConv.contractorName)}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[68%] rounded-2xl px-4 py-2.5",
                      isHomeowner
                        ? "bg-brand-600 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={cn(
                        "text-[11px] mt-1",
                        isHomeowner ? "text-brand-200" : "text-gray-400"
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-border flex-shrink-0">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${activeConv.contractorName}...`}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim()}
              size="sm"
              className="gap-1.5 px-4"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
