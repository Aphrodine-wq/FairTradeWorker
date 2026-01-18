import { Database } from '../database';

const prisma = new Database();

/**
 * EscrowService
 * Manages all funds in escrow for contracts
 * Handles:
 * - Deposit collection
 * - Final payment holding
 * - Dispute holds
 * - Payouts to contractors
 * - Refunds to homeowners
 * - Platform fee distribution
 */
export class EscrowService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Create escrow account for new contract
   */
  async createEscrow(data: {
    contractId: string;
    amount: number;
    status: 'PENDING' | 'HELD' | 'RELEASED' | 'DISPUTED';
    depositAmount: number;
  }): Promise<any> {
    const escrowId = `escrow_${Date.now()}`;

    const escrowAccount = {
      id: escrowId,
      contractId: data.contractId,
      totalAmount: data.amount,
      depositAmount: data.depositAmount,
      finalPaymentAmount: data.amount - data.depositAmount,
      platformFee: data.amount * 0.18,
      contractorPayout: data.amount * 0.82,
      status: data.status,
      createdAt: new Date().toISOString(),
      transactions: [] as any[],
    };

    await this.db.escrow.insert(escrowAccount);

    // Log transaction
    await this.logTransaction(escrowId, {
      type: 'ESCROW_CREATED',
      amount: data.amount,
      description: 'Escrow account created',
      status: 'COMPLETED',
    });

    return escrowAccount;
  }

  /**
   * Get escrow account for contract
   */
  async getEscrow(contractId: string): Promise<any> {
    return await this.db.escrow.findOne({ contractId });
  }

  /**
   * Release deposit from escrow to contractor
   * Called when homeowner accepts contract
   */
  async releaseDeposit(data: {
    contractId: string;
    amount: number;
    releasedTo: string;
  }): Promise<any> {
    const escrow = await this.db.escrow.findOne({ contractId: data.contractId });
    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    // Create transaction
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'DEPOSIT_RELEASED',
      amount: data.amount,
      releasedTo: data.releasedTo,
      timestamp: new Date().toISOString(),
      status: 'PENDING', // Awaits bank transfer
      estimatedArrival: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    };

    escrow.transactions.push(transaction);
    escrow.status = 'HELD'; // Now only final payment is held

    await this.db.escrow.update(escrow.id, escrow);

    // Log in audit
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: data.contractId,
      action: 'DEPOSIT_RELEASED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { amount: data.amount, releasedTo: data.releasedTo },
    });

    return transaction;
  }

  /**
   * Release final payment from escrow
   * Called when homeowner approves completion
   */
  async releaseFinalPayment(data: {
    contractId: string;
    contractorId: string;
    amount: number; // Net amount after fee (82% of contract)
    platformFee: number; // 18% of contract
  }): Promise<any> {
    const escrow = await this.db.escrow.findOne({ contractId: data.contractId });
    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    // Create contractor payout transaction
    const contractorTransaction = {
      id: `tx_${Date.now()}`,
      type: 'FINAL_PAYMENT_RELEASED',
      amount: data.amount,
      releasedTo: data.contractorId,
      timestamp: new Date().toISOString(),
      status: 'PENDING', // Awaits bank transfer
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Create platform fee transaction
    const platformTransaction = {
      id: `tx_${Date.now()}_platform`,
      type: 'PLATFORM_FEE',
      amount: data.platformFee,
      collectedFrom: data.contractorId,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    };

    escrow.transactions.push(contractorTransaction);
    escrow.transactions.push(platformTransaction);
    escrow.status = 'RELEASED';

    await this.db.escrow.update(escrow.id, escrow);

    // Create payout record
    const payout = {
      id: `payout_${Date.now()}`,
      escrowId: escrow.id,
      contractorId: data.contractorId,
      amount: data.amount,
      platformFee: data.platformFee,
      gross: data.amount + data.platformFee,
      status: 'PENDING',
      initiatedAt: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await this.db.payouts.insert(payout);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: data.contractId,
      action: 'FINAL_PAYMENT_RELEASED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: {
        contractorPayout: data.amount,
        platformFee: data.platformFee,
      },
    });

    return payout;
  }

  /**
   * Hold funds in dispute
   * Called when homeowner initiates dispute
   */
  async holdInDispute(data: {
    contractId: string;
    amount: number;
  }): Promise<any> {
    const escrow = await this.db.escrow.findOne({ contractId: data.contractId });
    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    escrow.status = 'DISPUTED';

    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'HELD_IN_DISPUTE',
      amount: data.amount,
      timestamp: new Date().toISOString(),
      status: 'HELD',
      reason: 'Dispute initiated by homeowner',
    };

    escrow.transactions.push(transaction);

    await this.db.escrow.update(escrow.id, escrow);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: data.contractId,
      action: 'DISPUTE_HOLD',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { amount: data.amount },
    });

    return transaction;
  }

  /**
   * Full refund to homeowner
   * Called when dispute resolution is REFUND
   */
  async refundToHomeowner(data: {
    contractId: string;
    amount: number;
  }): Promise<any> {
    const escrow = await this.db.escrow.findOne({ contractId: data.contractId });
    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'REFUND_TO_HOMEOWNER',
      amount: data.amount,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      estimatedArrival: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    };

    escrow.transactions.push(transaction);
    escrow.status = 'REFUNDED';

    await this.db.escrow.update(escrow.id, escrow);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: data.contractId,
      action: 'REFUND_INITIATED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: { amount: data.amount, reason: 'Dispute - full refund' },
    });

    return transaction;
  }

  /**
   * Partial refund (split between contractor and homeowner)
   */
  async partialRefund(data: {
    contractId: string;
    contractorPayout: number;
    homeownerRefund: number;
  }): Promise<any> {
    const escrow = await this.db.escrow.findOne({ contractId: data.contractId });
    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    const contractorTx = {
      id: `tx_${Date.now()}_contractor`,
      type: 'PARTIAL_PAYOUT',
      amount: data.contractorPayout,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
    };

    const homeownerTx = {
      id: `tx_${Date.now()}_homeowner`,
      type: 'PARTIAL_REFUND',
      amount: data.homeownerRefund,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
    };

    escrow.transactions.push(contractorTx);
    escrow.transactions.push(homeownerTx);
    escrow.status = 'RESOLVED';

    await this.db.escrow.update(escrow.id, escrow);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: data.contractId,
      action: 'PARTIAL_RESOLUTION',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: {
        contractorPayout: data.contractorPayout,
        homeownerRefund: data.homeownerRefund,
      },
    });

    return { contractorTx, homeownerTx };
  }

  /**
   * Get escrow transaction history
   */
  async getTransactionHistory(contractId: string): Promise<any[]> {
    const escrow = await this.db.escrow.findOne({ contractId });
    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    return escrow.transactions || [];
  }

  /**
   * Log transaction in escrow history
   */
  private async logTransaction(
    escrowId: string,
    data: {
      type: string;
      amount: number;
      description: string;
      status: string;
    }
  ): Promise<void> {
    const escrow = await this.db.escrow.findById(escrowId);
    if (!escrow) return;

    if (!escrow.transactions) {
      escrow.transactions = [];
    }

    escrow.transactions.push({
      id: `tx_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
    });

    await this.db.escrow.update(escrowId, escrow);
  }

  /**
   * Get escrow balance for contractor
   */
  async getContractorBalance(contractorId: string): Promise<{
    totalPending: number;
    totalReleased: number;
    totalDisputed: number;
  }> {
    const contracts = await this.db.contracts.find({ contractorId });
    const escrows = await Promise.all(
      contracts.map(c => this.getEscrow(c.id))
    );

    let totalPending = 0;
    let totalReleased = 0;
    let totalDisputed = 0;

    escrows.forEach(escrow => {
      if (escrow.status === 'HELD') {
        totalPending += escrow.finalPaymentAmount;
      } else if (escrow.status === 'RELEASED') {
        totalReleased += escrow.contractorPayout;
      } else if (escrow.status === 'DISPUTED') {
        totalDisputed += escrow.totalAmount;
      }
    });

    return { totalPending, totalReleased, totalDisputed };
  }

  /**
   * Get platform fee revenue
   */
  async getPlatformRevenue(startDate?: string, endDate?: string): Promise<{
    totalFees: number;
    completedContracts: number;
    averageFee: number;
  }> {
    const contracts = await this.db.contracts.find({
      status: 'COMPLETED',
      ...(startDate && { completedAt: { $gte: startDate } }),
      ...(endDate && { completedAt: { $lte: endDate } }),
    });

    const totalFees = contracts.reduce((sum, c) => sum + (c.bidAmount * 0.18), 0);
    const averageFee = contracts.length > 0 ? totalFees / contracts.length : 0;

    return {
      totalFees,
      completedContracts: contracts.length,
      averageFee,
    };
  }
}
