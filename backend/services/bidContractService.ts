import { BidContract, ContractChange, EstimateItem, MilestonePayment } from '../../types';
import { Database } from '../database';

/**
 * BidContractService
 * Manages the complete lifecycle of bid contracts
 * - Creation from accepted bids
 * - Status transitions (DRAFT → PENDING → ACCEPTED → ACTIVE → COMPLETED → DISPUTED)
 * - Contract change orders
 * - Compliance verification
 */
export class BidContractService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Create a new contract from accepted bid
   */
  async createContract(data: {
    jobId: string;
    contractorId: string;
    bidAmount: number;
    homeownerId: string;
    scopeOfWork: string[];
    materialsList: EstimateItem[];
    paymentTerms: BidContract['paymentTerms'];
  }): Promise<BidContract> {
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const contract: BidContract = {
      id: contractId,
      jobId: data.jobId,
      contractorId: data.contractorId,
      contractorName: '', // Will be populated from contractor profile
      homeownerId: data.homeownerId,

      // Terms
      bidAmount: data.bidAmount,
      scopeOfWork: data.scopeOfWork,
      materialsList: data.materialsList,
      startDate: new Date().toISOString().split('T')[0],
      estimatedDuration: '4 hours', // Default, can be overridden
      estimatedEndDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().split('T')[0],

      // Payment
      paymentTerms: data.paymentTerms,

      // Completion
      completionEvidenceRequired: 'PHOTOS_SIGNATURE',
      photosRequired: 3,
      allowDisputeWindow: true,
      disputeWindowDays: 5,

      // Status
      status: 'PENDING_ACCEPTANCE',
      createdAt: new Date().toISOString(),

      // Bidding
      bidVisibilityHidden: true,
      competitorBidCount: 0,

      // Dispute
      disputeStatus: 'NONE',

      // Compliance
      insuranceVerified: false,
      licenseVerified: false,
      backgroundCheckPassed: false,

      changes: [],
    };

    // Remove relations/virtuals before insert if necessary, or rely on adapter to strip them if they don't match schema
    // But since changes is not in schema (it's a relation), passing it might error if adapter doesn't strip it.
    // Let's rely on the fact that Prisma create ignores extra fields if not strict? No, it IS strict.
    // We should sanitize.
    const { changes, ...contractData } = contract;

    // Save to database
    await this.db.bidContracts.insert(contractData);

    // Log in audit trail
    await this.db.auditLogs.insert({
      id: `audit_${Date.now()}`,
      contractId,
      action: 'CONTRACT_CREATED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { bidAmount: data.bidAmount },
    });

    return contract;
  }

  /**
   * Retrieve contract by ID
   */
  async getContract(contractId: string): Promise<BidContract | null> {
    const contract = await this.db.bidContracts.findUnique({
      where: { id: contractId },
      include: { changes: true }
    });
    return contract;
  }

  /**
   * Get all contracts for a job
   */
  async getContractsByJob(jobId: string): Promise<BidContract[]> {
    return await this.db.bidContracts.find({ jobId });
  }

  /**
   * Get all contracts for a contractor
   */
  async getContractsByContractor(contractorId: string): Promise<BidContract[]> {
    return await this.db.bidContracts.find({ contractorId });
  }

  /**
   * Update contract (status, terms, notes)
   */
  async updateContract(
    contractId: string,
    updates: Partial<BidContract>
  ): Promise<BidContract> {
    const existingContract = await this.getContract(contractId);
    if (!existingContract) {
      throw new Error('Contract not found');
    }

    const updated: BidContract = {
      ...existingContract,
      ...updates,
    };

    // Sanitize 
    const { changes, ...updateData } = updated as any;

    await this.db.bidContracts.update(contractId, updateData);

    // Log status change
    if (updates.status) {
      await this.db.auditLogs.insert({
        id: `audit_${Date.now()}`,
        contractId,
        action: 'STATUS_CHANGED',
        actor: 'SYSTEM',
        timestamp: new Date().toISOString(),
        details: {
          oldStatus: existingContract.status,
          newStatus: updates.status,
        },
      });
    }

    return updated;
  }

  /**
   * Propose contract change (scope, time, price)
   */
  async proposeChange(
    contractId: string,
    data: {
      type: 'SCOPE_CHANGE' | 'TIME_EXTENSION' | 'PRICE_ADJUSTMENT';
      description: string;
      proposedAmount?: number;
      proposedBy: 'CONTRACTOR' | 'HOMEOWNER';
    }
  ): Promise<ContractChange> {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const change: ContractChange = {
      id: `change_${Date.now()}`,
      description: data.description,
      type: data.type,
      proposedBy: data.proposedBy,
      proposedAmount: data.proposedAmount,
      status: 'PROPOSED',
      createdAt: new Date().toISOString(),
      contractId, // Needed for relation
    } as any;

    // Save change order
    const createdChange = await this.db.changeOrders.insert(change);

    // Log change proposal
    await this.db.auditLogs.insert({
      id: `audit_${Date.now()}`,
      contractId,
      action: 'CHANGE_PROPOSED',
      actor: data.proposedBy,
      timestamp: new Date().toISOString(),
      details: {
        type: data.type,
        description: data.description,
        amount: data.proposedAmount,
      },
    });

    return createdChange;
  }

  /**
   * Accept change order
   */
  async acceptChange(contractId: string, changeId: string): Promise<ContractChange> {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const change = await this.db.changeOrders.findById(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    // Update change status
    const changeUpdates = {
      status: 'ACCEPTED',
      respondedAt: new Date().toISOString()
    };
    await this.db.changeOrders.update(changeId, changeUpdates);
    Object.assign(change, changeUpdates);

    // Apply change to contract if it's a price adjustment
    if (change.type === 'PRICE_ADJUSTMENT' && change.proposedAmount) {
      const adjustmentAmount = change.proposedAmount;
      contract.paymentTerms.totalAmount += adjustmentAmount;
      contract.paymentTerms.finalPayment += adjustmentAmount;
      contract.bidAmount += adjustmentAmount;

      const { changes, ...contractData } = contract as any;
      await this.db.bidContracts.update(contractId, contractData);
    }

    // Update estimated end date if time extension
    if (change.type === 'TIME_EXTENSION') {
      const currentEnd = new Date(contract.estimatedEndDate || new Date());
      currentEnd.setDate(currentEnd.getDate() + 3); // Default 3 day extension
      contract.estimatedEndDate = currentEnd.toISOString().split('T')[0];

      const { changes, ...contractData } = contract as any;
      await this.db.bidContracts.update(contractId, contractData);
    }

    // Log change acceptance
    await this.db.auditLogs.insert({
      id: `audit_${Date.now()}`,
      contractId,
      action: 'CHANGE_ACCEPTED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { changeId, type: change.type },
    });

    return change;
  }

  /**
   * Reject change order
   */
  async rejectChange(contractId: string, changeId: string, reason: string): Promise<ContractChange> {
    const change = await this.db.changeOrders.findById(changeId);
    if (!change) {
      throw new Error('Change not found');
    }

    const changeUpdates = {
      status: 'REJECTED',
      respondedAt: new Date().toISOString()
    };
    await this.db.changeOrders.update(changeId, changeUpdates);

    // Log rejection
    await this.db.auditLogs.insert({
      id: `audit_${Date.now()}`,
      contractId,
      action: 'CHANGE_REJECTED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { changeId, reason },
    });

    return change;
  }

  /**
   * Get contract statistics
   */
  async getContractStats(contractorId?: string): Promise<{
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    disputedContracts: number;
    averageValue: number;
    totalRevenue: number;
  }> {
    const filter = contractorId ? { contractorId } : {};
    const contracts = await this.db.bidContracts.find(filter);

    const active = contracts.filter(c => c.status === 'ACTIVE').length;
    const completed = contracts.filter(c => c.status === 'COMPLETED').length;
    const disputed = contracts.filter(c => c.status === 'DISPUTED').length;
    const totalRevenue = contracts.reduce((sum, c) => sum + c.bidAmount, 0);

    return {
      totalContracts: contracts.length,
      activeContracts: active,
      completedContracts: completed,
      disputedContracts: disputed,
      averageValue: totalRevenue / contracts.length,
      totalRevenue,
    };
  }

  /**
   * List contracts with filtering and pagination
   */
  async listContracts(
    filter: {
      contractorId?: string;
      homeownerId?: string;
      jobId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
    pagination: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    contracts: BidContract[];
    total: number;
  }> {
    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    let query = filter as any;

    // Date range filtering
    if (filter.startDate && filter.endDate) {
      query.createdAt = {
        $gte: filter.startDate,
        $lte: filter.endDate,
      };
    }

    const contracts = await this.db.bidContracts.find(query, {
      offset,
      limit,
      sort: { createdAt: -1 },
    });

    const total = await this.db.bidContracts.count(query);

    return { contracts, total };
  }
}
