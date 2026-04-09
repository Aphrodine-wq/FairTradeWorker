"use client";

import { useState } from "react";
import { Users, DollarSign, Eye, EyeOff, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { Input } from "@shared/ui/input";
import { Textarea } from "@shared/ui/textarea";
import { Button } from "@shared/ui/button";
import { cn, formatCurrency } from "@shared/lib/utils";
import { postSubJob } from "@shared/lib/data";
import { toast } from "sonner";

const SKILL_OPTIONS = [
  "Countertops", "Stone Fabrication", "Templating", "Tile Setting", "LVP Install",
  "Backsplash", "Gutters", "Seamless Install", "Downspouts", "Rough-In", "PEX",
  "Copper Transition", "Drain/Waste/Vent", "Flashing", "Ridge Cap", "Waterproofing",
  "Framing", "Finish Carpentry", "Drywall Hanging", "Texture", "Painting",
  "Cabinet Install", "Demolition", "Concrete", "Electrical Rough-In", "HVAC Ductwork",
];

interface PostSubJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneLabel: string;
  milestoneAmount: number;
  milestoneIndex: number;
  projectId: string;
  projectName: string;
  projectCategory: string;
  projectLocation: string;
}

export function PostSubJobDialog({
  open,
  onOpenChange,
  milestoneLabel,
  milestoneAmount,
  milestoneIndex,
  projectId,
  projectName,
  projectCategory,
  projectLocation,
}: PostSubJobDialogProps) {
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(Math.round(milestoneAmount * 0.6).toString());
  const [budgetMax, setBudgetMax] = useState(Math.round(milestoneAmount * 0.9).toString());
  const [paymentPath, setPaymentPath] = useState<"contractor_escrow" | "passthrough_escrow">("contractor_escrow");
  const [disclosed, setDisclosed] = useState(false);
  const [deadline, setDeadline] = useState("");

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!description.trim()) {
      toast.error("Add a description for the sub job");
      return;
    }
    if (selectedSkills.length === 0) {
      toast.error("Select at least one required skill");
      return;
    }

    setSubmitting(true);
    try {
      await postSubJob({
        projectId,
        milestoneLabel,
        milestoneIndex,
        title: `${milestoneLabel} — ${projectCategory}`,
        description,
        category: projectCategory,
        skills: selectedSkills,
        location: projectLocation,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        paymentPath,
        disclosedToOwner: disclosed,
        deadline,
      });
      toast.success(`Sub job posted for "${milestoneLabel}"`);
      onOpenChange(false);

      // Reset form
      setDescription("");
      setSelectedSkills([]);
      setBudgetMin(Math.round(milestoneAmount * 0.6).toString());
      setBudgetMax(Math.round(milestoneAmount * 0.9).toString());
      setPaymentPath("contractor_escrow");
      setDisclosed(false);
      setDeadline("");
    } catch (err: any) {
      toast.error(err.message || "Failed to post sub job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] rounded-sm p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200">
          <DialogTitle className="text-[18px] font-bold text-gray-900">Post Sub Job</DialogTitle>
          <p className="text-[13px] text-gray-500 mt-1">
            Find a sub for <span className="font-semibold text-gray-700">{milestoneLabel}</span> on {projectName}
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Pre-filled context */}
          <div className="bg-gray-50 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500">Milestone</span>
              <span className="font-semibold text-gray-900">{milestoneLabel}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500">Project</span>
              <span className="font-semibold text-gray-900">{projectName}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500">Category</span>
              <span className="font-semibold text-gray-900">{projectCategory}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500">Location</span>
              <span className="font-semibold text-gray-900">{projectLocation}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500">Milestone Budget</span>
              <span className="font-semibold text-gray-900">{formatCurrency(milestoneAmount)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of work, materials on site, access notes..."
              rows={3}
              className="mt-2 rounded-sm text-[13px]"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "text-[11px] font-medium px-2 py-1 transition-colors",
                    selectedSkills.includes(skill)
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Sub Budget Range</label>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="Min"
                  className="pl-8 h-9 rounded-sm text-[13px]"
                />
              </div>
              <span className="text-gray-400 text-[13px]">to</span>
              <div className="flex-1 relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="Max"
                  className="pl-8 h-9 rounded-sm text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Deadline</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-2 h-9 rounded-sm text-[13px]"
            />
          </div>

          {/* Payment Path */}
          <div>
            <label className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">Payment Path</label>
            <div className="space-y-2 mt-2">
              <label className="flex items-start gap-3 p-3 border cursor-pointer transition-colors hover:bg-gray-50"
                     onClick={() => setPaymentPath("contractor_escrow")}>
                <input
                  type="radio"
                  name="paymentPath"
                  checked={paymentPath === "contractor_escrow"}
                  onChange={() => setPaymentPath("contractor_escrow")}
                  className="mt-0.5 w-3.5 h-3.5 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Pay from my cut</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Sub payment comes from your milestone earnings. FTW holds escrow between you and the sub.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border cursor-pointer transition-colors hover:bg-gray-50"
                     onClick={() => setPaymentPath("passthrough_escrow")}>
                <input
                  type="radio"
                  name="paymentPath"
                  checked={paymentPath === "passthrough_escrow"}
                  onChange={() => setPaymentPath("passthrough_escrow")}
                  className="mt-0.5 w-3.5 h-3.5 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">Pass-through from homeowner</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Sub payment comes directly from the homeowner's milestone escrow. You manage the relationship.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Disclosure Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50">
            <div className="flex items-center gap-2.5">
              {disclosed ? <Eye className="w-4 h-4 text-brand-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Disclose to homeowner</p>
                <p className="text-[12px] text-gray-500">Let the homeowner see that a sub is handling this milestone</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDisclosed(!disclosed)}
              className={cn(
                "w-10 h-5 rounded-full relative transition-colors",
                disclosed ? "bg-brand-600" : "bg-gray-300"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                disclosed ? "left-5" : "left-0.5"
              )} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-sm text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 rounded-sm bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {submitting ? "Posting..." : "Post Sub Job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
