/**
 * Database Abstraction Layer (Hybrid Prisma + Legacy Adapter)
 * 
 * Updated to use SQLite via Prisma while maintaining backward compatibility
 * for the legacy Mongo-style query interface used by existing services.
 */

import { PrismaClient } from '@prisma/client';

interface Query {
  [key: string]: any;
}

interface FindOptions {
  sort?: { [key: string]: 1 | -1 };
  limit?: number;
  offset?: number;
}

// Define interface matching old Collection class
interface ICollection {
  insert(data: any): Promise<any>;
  find(query: Query, options?: FindOptions): Promise<any[]>;
  findOne(query: Query): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  update(idOrArgs: string | { where: any, data: any }, data?: any): Promise<any>;
  delete(id: string): Promise<boolean>;
  count(query: Query): Promise<number>;
  create(args: { data: any, include?: any }): Promise<any>;
  findUnique(args: { where: any, include?: any }): Promise<any | null>;
  findMany(args?: { where?: any, orderBy?: any, skip?: number, take?: number, include?: any }): Promise<any[]>;
  updateMany(args: { where: any, data: any }): Promise<any>;
}

class CollectionAdapter implements ICollection {
  private delegate: any;
  private name: string;

  constructor(delegate: any, name: string) {
    this.delegate = delegate;
    this.name = name;
  }

  // Helper to stringify arrays/objects for SQLite compatibility
  private serialize(data: any): any {
    const serialized = { ...data };
    const jsonFields = [
      'images', 'attachments', 'preferredTradeTypes', 'specializations',
      'preferences', 'notificationSettings', 'photos', 'videos',
      'geolocation', 'homeownerEvidence', 'contractorEvidence',
      'mediaUrls', 'changes', 'data'
    ];

    for (const key of Object.keys(serialized)) {
      if (jsonFields.includes(key) && (Array.isArray(serialized[key]) || typeof serialized[key] === 'object')) {
        if (serialized[key] !== null) {
          serialized[key] = JSON.stringify(serialized[key]);
        }
      }
    }
    return serialized;
  }

  // Helper to parse strings back to JSON/Arrays
  private deserialize(data: any): any {
    if (!data) return data;
    const deserialized = { ...data };
    const jsonFields = [
      'images', 'attachments', 'preferredTradeTypes', 'specializations',
      'preferences', 'notificationSettings', 'photos', 'videos',
      'geolocation', 'homeownerEvidence', 'contractorEvidence',
      'mediaUrls', 'changes', 'data'
    ];

    for (const key of Object.keys(deserialized)) {
      if (jsonFields.includes(key) && typeof deserialized[key] === 'string') {
        try {
          deserialized[key] = JSON.parse(deserialized[key]);
        } catch (e) {
          // Keep as string if parse fails
        }
      }
    }
    return deserialized;
  }

  async insert(data: any): Promise<any> {
    const result = await this.delegate.create({ data: this.serialize(data) });
    return this.deserialize(result);
  }

  async create(args: { data: any, include?: any }): Promise<any> {
    const result = await this.delegate.create({
      data: this.serialize(args.data),
      include: args.include
    });
    return this.deserialize(result);
  }

  async findById(id: string): Promise<any | null> {
    const result = await this.delegate.findUnique({ where: { id } });
    return this.deserialize(result);
  }

  async findUnique(args: { where: any, include?: any }): Promise<any | null> {
    const result = await this.delegate.findUnique({
      where: args.where,
      include: args.include
    });
    return this.deserialize(result);
  }

  async find(query: Query = {}, options: FindOptions = {}): Promise<any[]> {
    // If query is empty or simple, try native Prisma findMany
    // But since we need to handle Mongo operators ($regex, etc.), 
    // for this MVP migration we fallback to "Fetch All & Filter" strategy 
    // for compatibility with legacy queries.

    // Performance Optimization: If strict ID query, use findUnique
    if (Object.keys(query).length === 1 && query.id && typeof query.id === 'string') {
      const item = await this.findById(query.id);
      return item ? [item] : [];
    }

    // Otherwise, fetch all (limit if possible? No, filtering happens after)
    const allRaw = await this.delegate.findMany({
      orderBy: options.sort
    });

    const all = allRaw.map((item: any) => this.deserialize(item));

    // Memory Filter
    let results = all.filter((doc: any) => this.matchesQuery(doc, query));

    // apply offset/limit in memory
    if (options.offset) results = results.slice(options.offset);
    if (options.limit) results = results.slice(0, options.limit);

    return results;
  }

  async findOne(query: Query): Promise<any | null> {
    const results = await this.find(query, { limit: 1 });
    return results[0] || null;
  }

  async findMany(args: { where?: any, orderBy?: any, skip?: number, take?: number, include?: any } = {}): Promise<any[]> {
    // Proxy to real findMany but handle deserialization
    // Use legacy find() if 'where' is complex, else direct
    // For now, simpler to just map to find() if we want consistent behavior
    // But findMany usually implies Prisma-style 'where'.
    // If the caller passes Prisma 'where', we can pass it through directly!
    // But we need to be careful about JSON fields.

    const results = await this.delegate.findMany(args);
    return results.map((r: any) => this.deserialize(r));
  }

  async update(idOrArgs: string | { where: any, data: any }, data?: any): Promise<any> {
    let id: string | undefined;
    let updateData: any;

    if (typeof idOrArgs === 'string') {
      id = idOrArgs;
      updateData = data;
    } else {
      if (idOrArgs.where.id) id = idOrArgs.where.id;
      updateData = idOrArgs.data;
    }

    if (id) {
      const result = await this.delegate.update({
        where: { id },
        data: this.serialize(updateData)
      });
      return this.deserialize(result);
    }
    throw new Error("Update requires ID");
  }

  async updateMany(args: { where: any, data: any }): Promise<any> {
    // This is tricky because we might need to filter first to find IDs? 
    // Or trusting caller uses Prisma syntax?
    // Let's assume Prisma syntax for updateMany
    return this.delegate.updateMany({
      where: args.where,
      data: this.serialize(args.data)
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.delegate.delete({ where: { id } });
      return true;
    } catch (e) {
      return false;
    }
  }

  async count(query: Query): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }

  // --- Legacy Query Matcher Logic (Preserved) ---
  private matchesQuery(doc: any, query: Query): boolean {
    for (const key in query) {
      const queryValue = query[key];
      if (key.includes('.')) {
        const parts = key.split('.');
        let value = doc;
        for (const part of parts) value = value?.[part];
        if (!this.matchesValue(value, queryValue)) return false;
      } else if (typeof queryValue === 'object' && queryValue !== null) {
        if (queryValue.$gte !== undefined || queryValue.$lte !== undefined || queryValue.$in !== undefined || queryValue.$regex !== undefined || queryValue.$or !== undefined) {
          if (!this.matchesOperator(doc, key, queryValue)) return false; // pass doc/key for context
        } else if (Array.isArray(queryValue)) {
          if (!queryValue.includes(doc[key])) return false;
        } else if (key === '$or') { // Handle top-level $or
          if (!this.matchesOr(doc, queryValue)) return false;
        } else {
          if (JSON.stringify(doc[key]) !== JSON.stringify(queryValue)) return false;
        }
      } else {
        if (doc[key] !== queryValue) return false;
      }
    }
    return true;
  }

  private matchesOperator(doc: any, key: string, operator: any): boolean {
    const value = doc[key];
    if (operator.$gte !== undefined && value < operator.$gte) return false;
    if (operator.$lte !== undefined && value > operator.$lte) return false;
    if (operator.$in !== undefined && !operator.$in.includes(value)) return false;
    if (operator.$eq !== undefined && value !== operator.$eq) return false;
    if (operator.$ne !== undefined && value === operator.$ne) return false;
    if (operator.$regex !== undefined) {
      // Handle regex (assumes regex object or string)
      const re = operator.$regex instanceof RegExp ? operator.$regex : new RegExp(operator.$regex, operator.$options || '');
      if (!re.test(String(value))) return false;
    }
    return true;
  }

  private matchesOr(doc: any, conditions: any[]): boolean {
    return conditions.some(cond => this.matchesQuery(doc, cond));
  }

  private matchesValue(value: any, queryValue: any): boolean {
    if (typeof queryValue === 'object' && queryValue !== null) {
      // Basic operator check if passed as value
      if (queryValue.$regex || queryValue.$in || queryValue.$gte) return this.matchesOperator({ val: value }, 'val', queryValue);
      return value === queryValue; // simplified
    }
    return value === queryValue;
  }
}

export class Database extends PrismaClient {
  users: CollectionAdapter;
  jobs: CollectionAdapter;
  bidContracts: CollectionAdapter;
  changeOrders: CollectionAdapter;
  jobCompletions: CollectionAdapter;
  disputes: CollectionAdapter;
  escrowAccounts: CollectionAdapter;
  notifications: CollectionAdapter;
  inAppNotifications: CollectionAdapter;
  verifications: CollectionAdapter;
  refreshTokens: CollectionAdapter;
  auditLogs: CollectionAdapter;
  transactions: CollectionAdapter;

  constructor() {
    super();
    // Singleton pattern
    if ((Database as any).instance) {
      return (Database as any).instance;
    }
    (Database as any).instance = this;

    this.users = new CollectionAdapter(this.user, 'users');
    this.jobs = new CollectionAdapter(this.job, 'jobs');
    this.bidContracts = new CollectionAdapter(this.bidContract, 'bidContracts');
    this.jobCompletions = new CollectionAdapter(this.jobCompletion, 'jobCompletions');
    this.changeOrders = new CollectionAdapter(this.changeOrder, 'changeOrders');
    this.disputes = new CollectionAdapter(this.dispute, 'disputes');
    this.escrowAccounts = new CollectionAdapter(this.escrowAccount, 'escrowAccounts');
    this.notifications = new CollectionAdapter(this.notification, 'notifications');
    this.inAppNotifications = new CollectionAdapter(this.inAppNotification, 'inAppNotifications');
    this.verifications = new CollectionAdapter(this.verification, 'verifications');
    this.refreshTokens = new CollectionAdapter((this as any).refreshToken, 'refreshTokens');
    this.auditLogs = new CollectionAdapter(this.auditLog, 'auditLogs');
    this.transactions = new CollectionAdapter(this.transaction, 'transactions');
  }

  // Helper to clear DB (for tests)
  async reset() {
    // Order matters for relational integrity delete
    await this.transaction.deleteMany();
    await this.auditLog.deleteMany();
    await this.verification.deleteMany();
    await this.notification.deleteMany();
    await this.inAppNotification.deleteMany();
    await this.dispute.deleteMany();
    await this.jobCompletion.deleteMany();
    await this.escrowAccount.deleteMany();
    await this.changeOrder.deleteMany(); // added
    await this.bidContract.deleteMany();
    await this.bid.deleteMany();
    await this.review.deleteMany();
    await this.job.deleteMany();
    await this.user.deleteMany();
  }
}
