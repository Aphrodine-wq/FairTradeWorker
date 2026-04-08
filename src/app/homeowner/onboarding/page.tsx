"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Building2, MapPin, Check } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { cn } from "@shared/lib/utils";
import { authStore } from "@shared/lib/auth-store";
import { usePageTitle } from "@shared/hooks/use-page-title";

const PROPERTY_TYPES = [
  { id: "single_family", label: "Single Family Home", icon: Home },
  { id: "condo", label: "Condo / Townhouse", icon: Building2 },
  { id: "commercial", label: "Commercial", icon: Building2 },
];

export default function HomeownerOnboarding() {
  usePageTitle("Get Started");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("TX");
  const [zip, setZip] = useState("");
  const [propertyType, setPropertyType] = useState("single_family");

  const canSubmit = !!address && !!city && !!zip;

  const handleComplete = async () => {
    setSaving(true);
    const token = authStore.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      await fetch("/api/homeowner/property", {
        method: "POST",
        headers,
        body: JSON.stringify({
          address,
          city,
          state,
          zip,
          propertyType,
        }),
      });
    } catch {
      // Best-effort — continue even if API isn't available
    }

    router.push("/homeowner/dashboard");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tell Us About Your Property</h1>
          <p className="text-sm text-gray-700 mt-1">
            This helps contractors give you more accurate bids.
          </p>
        </div>

        <Card className="shadow-md border-border">
          <CardContent className="p-8 space-y-6">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Property Type</label>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const selected = propertyType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setPropertyType(type.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-sm border-2 transition-all",
                        selected
                          ? "border-brand-600 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", selected ? "text-brand-600" : "text-gray-600")} />
                      <span className={cn("text-xs font-medium", selected ? "text-brand-700" : "text-gray-800")}>
                        {type.label}
                      </span>
                      {selected && (
                        <div className="w-4 h-4 rounded-sm bg-brand-600 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                Street Address
              </label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* City / State / Zip */}
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-3 space-y-1.5">
                <label htmlFor="city" className="block text-sm font-medium text-gray-900">City</label>
                <Input
                  id="city"
                  placeholder="Austin"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label htmlFor="state" className="block text-sm font-medium text-gray-900">State</label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-900">ZIP Code</label>
                <Input
                  id="zip"
                  placeholder="78701"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  maxLength={5}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleComplete}
              disabled={!canSubmit || saving}
              size="lg"
              className="w-full mt-2"
            >
              {saving ? "Saving..." : "Continue to Dashboard"}
            </Button>

            {/* Skip */}
            <button
              onClick={() => router.push("/homeowner/dashboard")}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for now
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
