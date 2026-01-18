import React, { useState, useRef } from 'react';
import { JobCompletion, UserRole, BidContract } from '../types';
import {
  Upload, Check, X, AlertCircle, Clock, Star, MessageSquare, Lock,
  Camera, Loader2, Trash2, Eye, FileText, MapPin, Calendar, AlertTriangle
} from 'lucide-react';

interface JobCompletionProps {
  role: UserRole;
  contract: BidContract;
  onCompletionSubmitted?: (completion: JobCompletion) => void;
  onCompletionApproved?: (completion: JobCompletion) => void;
  onDisputeInitiated?: (completion: JobCompletion, reason: string) => void;
}

const JobCompletion: React.FC<JobCompletionProps> = ({
  role,
  contract,
  onCompletionSubmitted,
  onCompletionApproved,
  onDisputeInitiated
}) => {
  const [completionData, setCompletionData] = useState<Partial<JobCompletion>>({
    status: 'PENDING_APPROVAL',
    photoUrls: [],
    submittedBy: role === UserRole.CONTRACTOR ? 'CONTRACTOR' : 'HOMEOWNER',
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [approval, setApproval] = useState({
    satisfied: false,
    rating: 0,
    notes: '',
  });
  const [dispute, setDispute] = useState({
    isDisputing: false,
    reason: '',
    notes: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isContractor = role === UserRole.CONTRACTOR;
  const isHomeowner = role === UserRole.HOMEOWNER;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    // Simulate photo upload
    setTimeout(() => {
      const newPhotos = Array.from(files).map((file, idx) => ({
        url: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?auto=format&fit=crop&w=800`,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      }));

      setUploadedPhotos([
        ...uploadedPhotos,
        ...newPhotos.map(p => p.url)
      ]);
      setCompletionData(prev => ({
        ...prev,
        photoUrls: [...(prev.photoUrls || []), ...newPhotos.map(p => p.url)]
      }));

      setIsUploading(false);
    }, 1500);
  };

  const handleSubmitCompletion = () => {
    if (uploadedPhotos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }

    const completion: JobCompletion = {
      id: `completion-${Date.now()}`,
      contractId: contract.id,
      jobId: contract.jobId,
      submittedBy: isContractor ? 'CONTRACTOR' : 'HOMEOWNER',
      submittedAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
      photoUrls: uploadedPhotos,
      locationGeohash: 'u4ruhjc', // Mock geohash
      timestampSubmitted: new Date().toISOString(),
      disputeWindowExpiresAt: new Date(Date.now() + contract.disputeWindowDays * 24 * 60 * 60 * 1000).toISOString(),
      payoutStatus: 'PENDING',
    };

    setCompletionData(completion);

    if (onCompletionSubmitted) {
      onCompletionSubmitted(completion);
    }
  };

  const handleApproveCompletion = () => {
    if (approval.rating === 0 && isHomeowner) {
      alert('Please provide a rating');
      return;
    }

    const completedJob: JobCompletion = {
      ...completionData as JobCompletion,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvalNotes: approval.notes,
      homeownerSatisfaction: approval.rating,
      payoutStatus: 'RELEASED',
      payoutAmount: contract.bidAmount * 0.82, // After 18% platform fee
      payoutReleasedAt: new Date().toISOString(),
    };

    if (onCompletionApproved) {
      onCompletionApproved(completedJob);
    }
  };

  const handleInitiateDispute = () => {
    if (!dispute.reason) {
      alert('Please select a reason for dispute');
      return;
    }

    const disputedJob: JobCompletion = {
      ...completionData as JobCompletion,
      status: 'DISPUTED',
      disputeInitiatedAt: new Date().toISOString(),
      disputeNotes: dispute.notes,
      payoutStatus: 'HELD_IN_ESCROW',
    };

    if (onDisputeInitiated) {
      onDisputeInitiated(disputedJob, dispute.reason);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    setCompletionData(prev => ({
      ...prev,
      photoUrls: newPhotos
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">
            JOB COMPLETION
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isContractor ? 'Submit work evidence for approval' : 'Review and approve completed work'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest border ${
          completionData.status === 'APPROVED'
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
            : completionData.status === 'DISPUTED'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
        }`}>
          {completionData.status}
        </div>
      </div>

      {/* Contract Summary */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contract Details</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Contractor</p>
            <p className="font-bold text-slate-900 dark:text-white">{contract.contractorName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
            <p className="text-xl font-black text-brand-primary">${contract.bidAmount}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</p>
            <p className="font-bold text-slate-900 dark:text-white">{contract.startDate}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Duration</p>
            <p className="font-bold text-slate-900 dark:text-white">{contract.estimatedDuration}</p>
          </div>
        </div>
      </div>

      {/* Completion Evidence Section */}
      {isContractor && completionData.status === 'PENDING_APPROVAL' && (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Camera size={20} className="text-brand-primary" /> Work Evidence
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upload at least 3 photos showing completed work. These will be reviewed by the homeowner.
            </p>
          </div>

          {/* Photo Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-brand-primary animate-spin" />
                <p className="font-bold text-slate-900 dark:text-white">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-slate-400" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Click to upload photos</p>
                  <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                </div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">JPG, PNG up to 5MB each</p>
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          {uploadedPhotos.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">
                {uploadedPhotos.length} Photo{uploadedPhotos.length !== 1 ? 's' : ''} Uploaded
              </p>
              <div className="grid grid-cols-3 gap-3">
                {uploadedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img src={photo} alt={`Work evidence ${idx + 1}`} className="w-full h-32 object-cover rounded-xl" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Notes */}
          <div>
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">
              Work Completion Notes (Optional)
            </label>
            <textarea
              placeholder="Describe what was completed, any challenges, improvements made..."
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:border-brand-primary focus:outline-none transition-colors text-slate-900 dark:text-white"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitCompletion}
            disabled={uploadedPhotos.length === 0 || isUploading}
            className="w-full py-3 bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={20} /> Submit Work for Approval
          </button>
        </div>
      )}

      {/* Homeowner Review Section */}
      {isHomeowner && completionData.status === 'PENDING_APPROVAL' && uploadedPhotos.length > 0 && (
        <div className="space-y-6">
          {/* Photo Evidence Review */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye size={20} className="text-brand-primary" /> Review Work Evidence
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {uploadedPhotos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Evidence ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-white/5 hover:border-brand-primary transition-all"
                />
              ))}
            </div>
          </div>

          {/* Approval Form */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 block">
                How satisfied are you with the work?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setApproval({ ...approval, rating, satisfied: rating >= 3 })}
                    className={`p-3 rounded-lg border-2 transition-all flex-1 flex items-center justify-center gap-1 ${
                      approval.rating === rating
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-slate-200 dark:border-white/10 hover:border-brand-primary'
                    }`}
                  >
                    <Star size={16} className={approval.rating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'} />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rating}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                Approval Notes
              </label>
              <textarea
                placeholder="Share your feedback about the completed work..."
                value={approval.notes}
                onChange={(e) => setApproval({ ...approval, notes: e.target.value })}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:border-brand-primary focus:outline-none transition-colors text-slate-900 dark:text-white"
                rows={3}
              />
            </div>

            {/* Approval/Dispute Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setDispute({ ...dispute, isDisputing: true })}
                className="py-3 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <AlertTriangle size={18} className="inline mr-2" />
                Start Dispute
              </button>
              <button
                onClick={handleApproveCompletion}
                disabled={approval.rating === 0}
                className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={20} /> Approve & Release Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Form */}
      {dispute.isDisputing && (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-[2rem] border-2 border-red-200 dark:border-red-500/20 space-y-6 animate-fadeIn">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={20} /> Initiate Dispute
          </h2>

          <div>
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">
              Reason for Dispute
            </label>
            <select
              value={dispute.reason}
              onChange={(e) => setDispute({ ...dispute, reason: e.target.value })}
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold"
            >
              <option value="">Select a reason...</option>
              <option value="INCOMPLETE_WORK">Work is incomplete</option>
              <option value="POOR_QUALITY">Poor quality work</option>
              <option value="SCOPE_MISMATCH">Does not match agreed scope</option>
              <option value="SAFETY_ISSUE">Safety concerns</option>
              <option value="DAMAGE_CAUSED">Damage to property</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">
              Detailed Explanation
            </label>
            <textarea
              placeholder="Explain what went wrong and what you need to be done..."
              value={dispute.notes}
              onChange={(e) => setDispute({ ...dispute, notes: e.target.value })}
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:border-red-500 focus:outline-none transition-colors text-slate-900 dark:text-white"
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setDispute({ isDisputing: false, reason: '', notes: '' })}
              className="flex-1 py-3 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleInitiateDispute}
              disabled={!dispute.reason}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <AlertTriangle size={20} /> Submit Dispute
            </button>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-500/20">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Dispute Process:</strong> Your dispute will be reviewed by our mediation team. The contractor has 48 hours to respond. Funds will remain in escrow during this period.
            </p>
          </div>
        </div>
      )}

      {/* Approved State */}
      {completionData.status === 'APPROVED' && (
        <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border-2 border-emerald-200 dark:border-emerald-500/20 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Check size={24} className="text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Work Approved</h2>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                Payment of ${contract.bidAmount * 0.82} is being processed. Contractor will receive funds within 24 hours.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contractor Payment</p>
              <p className="text-2xl font-black text-emerald-600">${contract.bidAmount * 0.82}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Platform Fee (18%)</p>
              <p className="text-2xl font-black text-slate-600">${contract.bidAmount * 0.18}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[...Array(approval.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disputed State */}
      {completionData.status === 'DISPUTED' && (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-[2rem] border-2 border-red-200 dark:border-red-500/20 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Dispute Initiated</h2>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Our mediation team is reviewing this case. You'll receive updates via email.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCompletion;
