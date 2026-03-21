"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, Loader2, Plus, Trash2, FileText } from "lucide-react";
import { Button } from "@shared/ui/button";
import { cn, formatCurrency } from "@shared/lib/utils";

type RecordingState = "idle" | "recording" | "processing" | "done";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const MOCK_TRANSCRIPT_WORDS = [
  "Okay,", "so", "we're", "looking", "at", "a", "full", "kitchen", "remodel.",
  "Demo", "and", "disposal", "will", "run", "about", "thirty-five", "hundred.",
  "Custom", "cabinets,", "twelve", "thousand.", "Quartz", "countertops,",
  "forty-two", "square", "feet", "at", "eighty-five", "per", "foot.",
  "Backsplash", "tile,", "thirty", "square", "feet,", "forty-five", "each.",
  "Plumbing", "rough-in,", "twenty-eight", "hundred.", "Labor,",
  "one", "twenty", "hours", "at", "eighty-five", "per", "hour.",
];

const MOCK_LINE_ITEMS: LineItem[] = [
  { id: "1", description: "Demo & Disposal", quantity: 1, unitPrice: 3500 },
  { id: "2", description: "Custom Cabinets", quantity: 1, unitPrice: 12000 },
  { id: "3", description: "Quartz Countertops", quantity: 42, unitPrice: 85 },
  { id: "4", description: "Backsplash Tile", quantity: 30, unitPrice: 45 },
  { id: "5", description: "Plumbing Rough-In", quantity: 1, unitPrice: 2800 },
  { id: "6", description: "Labor", quantity: 120, unitPrice: 85 },
];

interface VoiceRecorderProps {
  onItemsExtracted?: (items: LineItem[]) => void;
}

export function VoiceRecorder({ onItemsExtracted }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [wordIndex, setWordIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimers();
  }, [stopTimers]);

  const handleToggleRecording = () => {
    if (state === "recording") {
      stopTimers();
      setState("processing");
      // Simulate processing delay
      setTimeout(() => {
        setState("done");
        setLineItems(MOCK_LINE_ITEMS);
        onItemsExtracted?.(MOCK_LINE_ITEMS);
      }, 2200);
    } else if (state === "idle") {
      setElapsed(0);
      setTranscript("");
      setWordIndex(0);
      setState("recording");

      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);

      // Word-by-word transcript reveal
      let idx = 0;
      wordTimerRef.current = setInterval(() => {
        idx++;
        setWordIndex(idx);
        setTranscript(MOCK_TRANSCRIPT_WORDS.slice(0, idx).join(" "));
        if (idx >= MOCK_TRANSCRIPT_WORDS.length) {
          if (wordTimerRef.current) clearInterval(wordTimerRef.current);
        }
      }, 180);
    } else if (state === "done") {
      // Reset
      setState("idle");
      setElapsed(0);
      setTranscript("");
      setWordIndex(0);
      setLineItems([]);
    }
  };

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setLineItems((items) => items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
    };
    setLineItems((items) => [...items, newItem]);
  };

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Microphone button area */}
      <div className="flex flex-col items-center gap-4 py-6">
        {/* Status label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {state === "idle" && "Voice AI Estimator"}
          {state === "recording" && "Recording..."}
          {state === "processing" && "Processing audio..."}
          {state === "done" && "Extraction complete"}
        </p>

        {/* Mic button + pulse rings */}
        <div className="relative flex items-center justify-center">
          {state === "recording" && (
            <>
              <span className="absolute inline-flex h-[88px] w-[88px] rounded-full bg-brand-600 opacity-20 animate-ping" />
              <span className="absolute inline-flex h-[104px] w-[104px] rounded-full bg-brand-600 opacity-10 animate-ping [animation-delay:200ms]" />
            </>
          )}
          <button
            onClick={handleToggleRecording}
            disabled={state === "processing"}
            className={cn(
              "relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-150 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600",
              state === "idle" &&
                "bg-brand-600 hover:bg-brand-700 text-white",
              state === "recording" &&
                "bg-red-500 hover:bg-red-600 text-white",
              state === "processing" &&
                "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
              state === "done" &&
                "bg-gray-100 hover:bg-gray-200 text-gray-500"
            )}
            aria-label={
              state === "recording" ? "Stop recording" : "Start recording"
            }
          >
            {state === "processing" ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : state === "recording" ? (
              <Square className="w-6 h-6 fill-current" />
            ) : state === "done" ? (
              <Mic className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Timer */}
        {(state === "recording" || state === "processing") && (
          <p className="text-2xl font-mono font-bold text-gray-900 tabular-nums">
            {formatElapsed(elapsed)}
          </p>
        )}

        {/* Waveform bars (recording only) */}
        {state === "recording" && (
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-brand-600"
                style={{
                  height: `${20 + Math.random() * 60}%`,
                  animation: `pulse ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.04}s`,
                  opacity: 0.6 + (i % 3) * 0.15,
                }}
              />
            ))}
          </div>
        )}

        {/* Hint text */}
        {state === "idle" && (
          <p className="text-xs text-gray-400 text-center max-w-48 leading-relaxed">
            Tap the mic and describe your estimate out loud. Hunter will extract line items automatically.
          </p>
        )}
        {state === "done" && (
          <p className="text-xs text-green-600 font-medium text-center">
            {lineItems.length} line items extracted. Tap mic to re-record.
          </p>
        )}
      </div>

      {/* Transcript */}
      {(state === "recording" || transcript) && (
        <div className="rounded-lg border border-border bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Transcript
          </p>
          <p className="text-sm text-gray-700 leading-relaxed min-h-[3rem]">
            {transcript}
            {state === "recording" && (
              <span className="inline-block w-0.5 h-4 bg-brand-600 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>
      )}

      {/* Extracted line items table */}
      {state === "done" && lineItems.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-border">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Extracted Line Items
            </p>
            <button
              onClick={addItem}
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-gray-500 font-semibold w-full">
                    Description
                  </th>
                  <th className="text-right px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">
                    Qty
                  </th>
                  <th className="text-right px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">
                    Unit $
                  </th>
                  <th className="text-right px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">
                    Total
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-1.5">
                      <input
                        className="w-full bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-0.5"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        className="w-14 text-right bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-0.5 tabular-nums"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        className="w-20 text-right bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-0.5 tabular-nums"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                    <td className="pr-2 py-1.5">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={3} className="px-3 py-2.5 text-xs font-bold text-gray-700 text-right">
                    Total
                  </td>
                  <td className="px-3 py-2.5 text-sm font-bold text-gray-900 text-right tabular-nums whitespace-nowrap">
                    {formatCurrency(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Generate Estimate button */}
      {state === "done" && lineItems.length > 0 && (
        <Button className="w-full gap-2">
          <FileText className="w-4 h-4" />
          Generate Estimate
        </Button>
      )}
    </div>
  );
}
