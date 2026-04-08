"use client";

import { MessageSquare } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { usePageTitle } from "@shared/hooks/use-page-title";

export default function SubContractorMessagesPage() {
  usePageTitle("Messages");

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-[24px] font-semibold text-gray-900">Messages</h1>
        <p className="text-[13px] text-gray-700 mt-1">
          Communicate with contractors about sub jobs
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-gray-200">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold text-gray-900 mb-1">No conversations yet</p>
            <p className="text-[13px] text-gray-700 max-w-sm">
              Messages from contractors about sub jobs will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
