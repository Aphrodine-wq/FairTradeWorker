import React, { useState, useMemo } from 'react';
import {
  BidContract, Job, UserRole, MilestonePayment, ContractChange, BidAnalytics
} from '../types';
import {
  Check, X, AlertCircle, Clock, DollarSign, FileText, Shield,
  ChevronRight, Edit2, Eye, EyeOff, TrendingUp, Users, Calendar, Lock
} from 'lucide-react';

interface BidManagementProps {
  role: UserRole;
  selectedJob?: Job;
  onContractCreated?: (contract: BidContract) => void;
  onBidAccepted?: (contract: BidContract) => void;
}

// Mock data for demo
const MOCK_BIDS: any[] = [
  {
    id: 'bid-1',
    jobId: 'job-1',
    contractorName: 'Mike Robinson',
    contractorId: 'c1',
    amount: 1200,
    description: '2-hour emergency service + tank replacement',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isWinning: false,
  },
  {
    id: 'bid-2',
    jobId: 'job-1',
    contractorName: 'Sarah Chen',
    contractorId: 'c2',
    amount: 950,
    description: 'Same-day installation with warranty',
    submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isWinning: true,
  },
];

const BidManagement: React.FC<BidManagementProps> = ({
  role,
  selectedJob,
  onContractCreated,
  onBidAccepted
}) => {
  const [bids, setBids] = useState(MOCK_BIDS);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showContractTerms, setShowContractTerms] = useState(false);
  const [contractTerms, setContractTerms] = useState<Partial<BidContract>>({
    completionEvidenceRequired: 'PHOTOS_SIGNATURE',
    allowDisputeWindow: true,
    disputeWindowDays: 5,
    bidVisibilityHidden: true,
  });

  const isHomeowner = role === UserRole.HOMEOWNER;
  const isContractor = role === UserRole.CONTRACTOR;

  // Calculate bid statistics
  const bidAnalytics = useMemo(() => {
    const amounts = bids.map(b => b.amount);
    return {
      bidCount: bids.length,
      avgBidAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      highestBid: Math.max(...amounts),
      lowestBid: Math.min(...amounts),
    };
  }, [bids]);

  const handleAcceptBid = (bid: any) => {
    if (!selectedJob) return;

    const newContract: BidContract = {
      id: `contract-${Date.now()}`,
      jobId: selectedJob.id,
      contractorId: bid.contractorId,
      contractorName: bid.contractorName,
      homeownerId: 'homeowner-1', // Mock
      bidAmount: bid.amount,
      scopeOfWork: selectedJob.scopeOfWork || ['Water heater replacement', 'Disposal of old unit'],
      materialsList: selectedJob.materialsList || [],
      startDate: new Date().toISOString().split('T')[0],
      estimatedDuration: '4 hours',
      estimatedEndDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: {
        totalAmount: bid.amount,
        deposit: bid.amount * 0.25,
        depositPercentage: 25,
        finalPayment: bid.amount * 0.75,
        finalPaymentPercentage: 75,
      },
      completionEvidenceRequired: contractTerms.completionEvidenceRequired || 'PHOTOS_SIGNATURE',
      photosRequired: 3,
      allowDisputeWindow: contractTerms.allowDisputeWindow !== false,
      disputeWindowDays: contractTerms.disputeWindowDays || 5,
      status: 'PENDING_ACCEPTANCE',
      createdAt: new Date().toISOString(),
      bidVisibilityHidden: true,
      competitorBidCount: bids.length - 1,
      insuranceVerified: true,
      licenseVerified: true,
      backgroundCheckPassed: true,
    };

    setBids(bids.map(b => ({ ...b, isWinning: b.id === bid.id })));
    setSelectedBid(newContract);

    if (onContractCreated) {
      onContractCreated(newContract);
    }
  };

  const handleAcceptContract = (contract: BidContract) => {
    const updatedContract = { ...contract, status: 'ACCEPTED' as const, acceptedAt: new Date().toISOString() };
    setSelectedBid(updatedContract);

    if (onBidAccepted) {
      onBidAccepted(updatedContract);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">
            BID MANAGEMENT
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isHomeowner ? 'Review and accept bids from qualified contractors' : 'Manage your submitted bids'}
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/20 rounded-lg">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {bidAnalytics.bidCount} Active Bids
          </p>
        </div>
      </div>

      {/* Bid Analytics Dashboard */}
      {isHomeowner && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Bids</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{bidAnalytics.bidCount}</p>
              </div>
              <Users size={24} className="text-brand-primary" />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Average Bid</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(bidAnalytics.avgBidAmount)}</p>
              </div>
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Low Bid</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(bidAnalytics.lowestBid)}</p>
              </div>
              <DollarSign size={24} className="text-emerald-600" />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">High Bid</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(bidAnalytics.highestBid)}</p>
              </div>
              <DollarSign size={24} className="text-rose-500" />
            </div>
          </div>
        </div>
      )}

      {/* Bid List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users size={20} /> Submitted Bids
        </h2>

        {bids.map((bid) => (
          <div
            key={bid.id}
            onClick={() => !selectedBid && setSelectedBid(bid)}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              bid.isWinning
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-brand-primary'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bid.contractorName}</h3>
                  {bid.isWinning && (
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      WINNING BID
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{bid.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(bid.amount)}</p>
                <p className="text-xs text-slate-400 mt-1">{formatTime(bid.submittedAt)}</p>
              </div>
            </div>

            {isHomeowner && !selectedBid && (
              <button
                onClick={() => handleAcceptBid(bid)}
                className="w-full py-3 bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={18} /> Accept & Create Contract
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Contract Terms & Acceptance */}
      {selectedBid && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-brand-primary shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={24} className="text-brand-primary" /> Contract Terms
              </h2>
              <div className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${
                selectedBid.status === 'ACCEPTED'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
              }`}>
                {selectedBid.status === 'ACCEPTED' ? 'ACTIVE CONTRACT' : 'PENDING ACCEPTANCE'}
              </div>
            </div>

            {/* Contract Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contract ID</p>
                <p className="text-sm font-mono text-slate-900 dark:text-white break-all">{selectedBid.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contractor</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedBid.contractorName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Amount</p>
                <p className="text-2xl font-black text-brand-primary">{formatCurrency(selectedBid.bidAmount)}</p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                <DollarSign size={14} /> Payment Structure
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deposit (Upfront)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedBid.paymentTerms.deposit)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{selectedBid.paymentTerms.depositPercentage}% of total</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Final Payment</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedBid.paymentTerms.finalPayment)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{selectedBid.paymentTerms.finalPaymentPercentage}% after completion</p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                    Platform Fee (18%)
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedBid.bidAmount * 0.18)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Deducted at payout</p>
                </div>
              </div>
            </div>

            {/* Completion Terms */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                <Shield size={14} /> Completion Requirements
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Evidence Required</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedBid.completionEvidenceRequired === 'PHOTOS_SIGNATURE'
                      ? '3+ Photos + Homeowner Signature'
                      : selectedBid.completionEvidenceRequired === 'VIDEO_WALKTHROUGH'
                      ? 'Video Walkthrough'
                      : 'Inspector Approval'}
                  </p>
                </div>

                <div className="p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Dispute Window</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedBid.disputeWindowDays} days after completion
                  </p>
                </div>

                <div className="p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Estimated Duration</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBid.estimatedDuration}</p>
                </div>

                <div className="p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Start Date</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBid.startDate}</p>
                </div>
              </div>
            </div>

            {/* Compliance Checks */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                <Lock size={14} /> Contractor Verification
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  selectedBid.licenseVerified
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20'
                }`}>
                  <Check size={20} className={selectedBid.licenseVerified ? 'text-emerald-600' : 'text-red-600'} />
                  <span className={`font-bold text-sm ${selectedBid.licenseVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                    License Verified
                  </span>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  selectedBid.insuranceVerified
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20'
                }`}>
                  <Check size={20} className={selectedBid.insuranceVerified ? 'text-emerald-600' : 'text-red-600'} />
                  <span className={`font-bold text-sm ${selectedBid.insuranceVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                    Insurance Active
                  </span>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  selectedBid.backgroundCheckPassed
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20'
                }`}>
                  <Check size={20} className={selectedBid.backgroundCheckPassed ? 'text-emerald-600' : 'text-red-600'} />
                  <span className={`font-bold text-sm ${selectedBid.backgroundCheckPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                    Background Clear
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedBid.status !== 'ACCEPTED' && isHomeowner && (
              <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-white/5">
                <button
                  onClick={() => setSelectedBid(null)}
                  className="flex-1 py-3 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Back to Bids
                </button>
                <button
                  onClick={() => handleAcceptContract(selectedBid)}
                  className="flex-1 py-3 bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Accept Contract & Start Work
                </button>
              </div>
            )}

            {selectedBid.status === 'ACCEPTED' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center gap-3 mt-8">
                <Check size={20} className="text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">Contract Accepted</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Work can begin immediately</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BidManagement;
