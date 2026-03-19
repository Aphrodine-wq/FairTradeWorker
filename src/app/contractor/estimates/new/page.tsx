"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  Send,
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { VoiceRecorder } from "@/components/app/voice-recorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const INITIAL_ITEMS: LineItem[] = [
  { id: "1", description: "", quantity: 1, unitPrice: 0 },
];

export default function NewEstimatePage() {
  const [clientName, setClientName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>(INITIAL_ITEMS);
  const [isDragOver, setIsDragOver] = useState(false);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setLineItems((items) => [
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((items) => items.filter((item) => item.id !== id));
  };

  const handleVoiceItems = (items: { id: string; description: string; quantity: number; unitPrice: number }[]) => {
    setLineItems(items);
    setJobTitle("Kitchen Remodel - Full Gut");
  };

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        title="New Estimate"
        subtitle="Use Voice AI or build manually"
        actions={
          <Link href="/contractor/estimates">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left — Voice AI */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Voice AI Estimator</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Describe your estimate out loud and Hunter will extract line items automatically.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <VoiceRecorder onItemsExtracted={handleVoiceItems} />
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Job Photos</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Attach photos to support your estimate.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                    isDragOver
                      ? "border-brand-600 bg-brand-50"
                      : "border-border hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    {isDragOver ? (
                      <ImageIcon className="w-5 h-5 text-brand-600" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {isDragOver ? "Drop to attach" : "Drag & drop photos here"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      or click to browse — JPG, PNG up to 10MB
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-1">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — Estimate Builder */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estimate Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Client Name
                    </label>
                    <Input
                      placeholder="e.g. Michael Brown"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">
                      Job Title
                    </label>
                    <Input
                      placeholder="e.g. Kitchen Remodel"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Line Items
                    </p>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add row
                    </button>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-border">
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">
                              Description
                            </th>
                            <th className="text-right px-3 py-2 text-gray-500 font-semibold w-16">
                              Qty
                            </th>
                            <th className="text-right px-3 py-2 text-gray-500 font-semibold w-24">
                              Unit $
                            </th>
                            <th className="text-right px-3 py-2 text-gray-500 font-semibold w-24">
                              Total
                            </th>
                            <th className="w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-border last:border-0"
                            >
                              <td className="px-2 py-1.5">
                                <input
                                  className="w-full bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-1 text-sm"
                                  placeholder="Description..."
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(item.id, "description", e.target.value)
                                  }
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number"
                                  className="w-full text-right bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-1 tabular-nums"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(
                                      item.id,
                                      "quantity",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number"
                                  className="w-full text-right bg-transparent text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-600 rounded px-1 py-1 tabular-nums"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateItem(
                                      item.id,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </td>
                              <td className="px-3 py-1.5 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </td>
                              <td className="pr-1.5 py-1.5">
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
                      </table>
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Estimate Total
                      </span>
                      <span className="text-xl font-bold text-gray-900 tabular-nums">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Notes / Terms
                  </label>
                  <Textarea
                    placeholder="Additional notes, payment terms, warranty info..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] resize-none text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="secondary" className="flex-1 gap-2">
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </Button>
                  <Button className="flex-1 gap-2">
                    <Send className="w-4 h-4" />
                    Send Estimate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
