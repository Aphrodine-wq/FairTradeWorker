"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, HardHat, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";
import { Input } from "@shared/ui/input";
import { cn } from "@shared/lib/utils";

type Role = "homeowner" | "contractor" | null;

const SPECIALTIES = [
  "General Contractor",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Roofing",
  "Framing / Carpentry",
  "Concrete / Masonry",
  "Painting",
  "Flooring",
  "Landscaping / Excavation",
  "Drywall",
  "Insulation",
  "Windows & Doors",
  "Cabinets & Millwork",
  "Other",
];

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    specialty: "",
    yearsExperience: "",
    licenseNumber: "",
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRoleSelect = (selected: Role) => {
    setRole(selected);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic goes here
  };

  return (
    <div className="min-h-screen bg-[#FDFBF8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              Fair<span className="text-brand-600">Trade</span>Worker
            </span>
          </Link>
          <p className="text-sm text-gray-400 mt-1">The fair way to find and hire contractors</p>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-8">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-7">
              <StepDot active={step === 1} completed={step > 1} label="Role" />
              <div
                className={cn(
                  "h-px flex-1 max-w-[48px] transition-colors duration-300",
                  step > 1 ? "bg-brand-600" : "bg-border"
                )}
              />
              <StepDot active={step === 2} completed={false} label="Details" />
            </div>

            {step === 1 && <StepOne onSelect={handleRoleSelect} selected={role} />}
            {step === 2 && role && (
              <StepTwo
                role={role}
                form={form}
                update={update}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirm={showConfirm}
                setShowConfirm={setShowConfirm}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>

        {/* Legal */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-gray-600 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

// ─── Step Dot ────────────────────────────────────────────────────────────────

function StepDot({
  active,
  completed,
  label,
}: {
  active: boolean;
  completed: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-150",
          active
            ? "border-brand-600 bg-brand-600 text-white"
            : completed
            ? "border-brand-600 bg-brand-50 text-brand-600"
            : "border-border bg-white text-gray-400"
        )}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : label === "Role" ? (
          "1"
        ) : (
          "2"
        )}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-wide",
          active ? "text-brand-600" : "text-gray-400"
        )}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Step 1: Role Selection ───────────────────────────────────────────────────

function StepOne({
  onSelect,
  selected,
}: {
  onSelect: (role: Role) => void;
  selected: Role;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 mt-1">How will you use FairTradeWorker?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RoleCard
          icon={<Home className="w-7 h-7" />}
          title="I'm a Homeowner"
          description="Post projects, get competitive bids, hire verified contractors."
          selected={selected === "homeowner"}
          onClick={() => onSelect("homeowner")}
        />
        <RoleCard
          icon={<HardHat className="w-7 h-7" />}
          title="I'm a Contractor"
          description="Find local jobs, bid on projects, grow your business."
          selected={selected === "contractor"}
          onClick={() => onSelect("contractor")}
        />
      </div>

      <p className="mt-7 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-xl border-2 p-5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
        selected
          ? "border-brand-600 bg-brand-50"
          : "border-border bg-white hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span
        className={cn(
          "mb-3 block",
          selected ? "text-brand-600" : "text-gray-500"
        )}
      >
        {icon}
      </span>
      <span className="block text-sm font-semibold text-gray-900 leading-snug mb-1">
        {title}
      </span>
      <span className="block text-xs text-gray-500 leading-relaxed">
        {description}
      </span>
    </button>
  );
}

// ─── Step 2: Registration Form ────────────────────────────────────────────────

interface StepTwoProps {
  role: NonNullable<Role>;
  form: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    specialty: string;
    yearsExperience: string;
    licenseNumber: string;
  };
  update: (field: "name" | "email" | "password" | "confirmPassword" | "companyName" | "specialty" | "yearsExperience" | "licenseNumber") => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function StepTwo({
  role,
  form,
  update,
  showPassword,
  setShowPassword,
  showConfirm,
  setShowConfirm,
  onBack,
  onSubmit,
}: StepTwoProps) {
  const isContractor = role === "contractor";

  return (
    <div>
      {/* Back button + heading row */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {isContractor ? "Contractor details" : "Your details"}
          </h1>
          <p className="text-sm text-gray-500">
            {isContractor
              ? "Tell us about your business"
              : "Set up your homeowner account"}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Full Name */}
        <Field label="Full name">
          <Input
            type="text"
            autoComplete="name"
            placeholder="James Walton"
            value={form.name}
            onChange={update("name")}
            required
          />
        </Field>

        {/* Email */}
        <Field label="Email address">
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
            required
          />
        </Field>

        {/* Contractor-only fields */}
        {isContractor && (
          <>
            <Field label="Company name">
              <Input
                type="text"
                autoComplete="organization"
                placeholder="Walton Construction LLC"
                value={form.companyName}
                onChange={update("companyName")}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Specialty">
                <select
                  value={form.specialty}
                  onChange={update("specialty")}
                  required
                  className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Years experience">
                <Input
                  type="number"
                  min="0"
                  max="60"
                  placeholder="5"
                  value={form.yearsExperience}
                  onChange={update("yearsExperience")}
                  required
                />
              </Field>
            </div>

            <Field label="License number" optional>
              <Input
                type="text"
                placeholder="TX-123456 (optional)"
                value={form.licenseNumber}
                onChange={update("licenseNumber")}
              />
            </Field>
          </>
        )}

        {/* Password */}
        <Field label="Password">
          <PasswordInput
            value={form.password}
            onChange={update("password")}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
          />
        </Field>

        {/* Confirm Password */}
        <Field label="Confirm password">
          <PasswordInput
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            autoComplete="new-password"
            placeholder="Repeat password"
          />
        </Field>

        <Button type="submit" size="lg" className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {label}
        {optional && (
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pr-10"
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
