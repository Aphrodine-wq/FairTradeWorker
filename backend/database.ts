/**
 * Database Abstraction Layer
 *
 * This is a database-agnostic abstraction that can be implemented with:
 * - MongoDB + mongoose
 * - PostgreSQL + typeorm
 * - Firebase Firestore
 * - DynamoDB
 *
 * For now, using in-memory data structure with file persistence for MVP
 * Replace with actual database when moving to production
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Query {
  [key: string]: any;
}

interface FindOptions {
  sort?: { [key: string]: 1 | -1 };
  limit?: number;
  offset?: number;
}

export class Database {
  // Collections
  users: ICollection;
  jobs: ICollection;
  bidContracts: ICollection;
  jobCompletions: ICollection;
  disputes: ICollection;
  escrowAccounts: ICollection;
  notifications: ICollection;
  inAppNotifications: ICollection;
  verifications: ICollection;
  auditLogs: ICollection;
  transactions: ICollection;

  private dataDir: string;

  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.ensureDataDir();

    // Initialize collections
    this.users = new Collection('users', this.dataDir);
    this.jobs = new Collection('jobs', this.dataDir);
    this.bidContracts = new Collection('bidContracts', this.dataDir);
    this.jobCompletions = new Collection('jobCompletions', this.dataDir);
    this.disputes = new Collection('disputes', this.dataDir);
    this.escrowAccounts = new Collection('escrowAccounts', this.dataDir);
    this.notifications = new Collection('notifications', this.dataDir);
    this.inAppNotifications = new Collection('inAppNotifications', this.dataDir);
    this.verifications = new Collection('verifications', this.dataDir);
    this.auditLogs = new Collection('auditLogs', this.dataDir);
    this.transactions = new Collection('transactions', this.dataDir);
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Clear all data (for testing)
   */
  async reset(): Promise<void> {
    if (fs.existsSync(this.dataDir)) {
      fs.rmSync(this.dataDir, { recursive: true });
    }
    this.ensureDataDir();
  }
}

interface ICollection {
  insert(data: any): Promise<any>;
  find(query: Query, options?: FindOptions): Promise<any[]>;
  findOne(query: Query): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  update(idOrArgs: string | { where: any, data: any }, data?: any): Promise<any>;
  delete(id: string): Promise<boolean>;
  count(query: Query): Promise<number>;

  // Prisma-compatibility methods
  create(args: { data: any }): Promise<any>;
  findUnique(args: { where: any }): Promise<any | null>;
  findMany(args?: { where?: any, orderBy?: any, skip?: number, take?: number }): Promise<any[]>;
  updateMany(args: { where: any, data: any }): Promise<any>;
}

/**
 * Collection class for in-memory data storage with file persistence
 */
class Collection implements ICollection {
  private name: string;
  private dataDir: string;
  private filePath: string;
  private data: Map<string, any>;

  constructor(name: string, dataDir: string) {
    this.name = name;
    this.dataDir = dataDir;
    this.filePath = path.join(dataDir, `${name}.json`);
    this.data = new Map();

    this.loadFromFile();
  }

  /**
   * Load data from persistent file
   */
  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const records = JSON.parse(content);
        records.forEach((record: any) => {
          this.data.set(record.id, record);
        });
      }
    } catch (error) {
      console.warn(`Failed to load ${this.name} collection from file:`, error);
    }
  }

  /**
   * Save data to persistent file
   */
  private saveToFile(): void {
    try {
      const records = Array.from(this.data.values());
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
    } catch (error) {
      console.error(`Failed to save ${this.name} collection to file:`, error);
    }
  }

  /**
   * Insert a new document
   */
  async insert(data: any): Promise<any> {
    if (!data.id) {
      data.id = `${this.name}_${Date.now()}`;
    }

    this.data.set(data.id, data);
    this.saveToFile();

    return { ...data };
  }

  /**
   * Prisma-compatible create
   */
  async create(args: { data: any }): Promise<any> {
    return this.insert(args.data);
  }

  /**
   * Find documents matching query
   */
  async find(query: Query = {}, options: FindOptions = {}): Promise<any[]> {
    let results = Array.from(this.data.values()).filter((doc) =>
      this.matchesQuery(doc, query)
    );

    // Apply sorting
    if (options.sort) {
      results = this.sortResults(results, options.sort);
    }

    // Apply offset
    if (options.offset) {
      results = results.slice(options.offset);
    }

    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Prisma-compatible findMany
   */
  async findMany(args: { where?: any, orderBy?: any, skip?: number, take?: number } = {}): Promise<any[]> {
    const query = args.where || {};
    const options: FindOptions = {};

    if (args.orderBy) {
      options.sort = args.orderBy;
    }
    if (args.skip) {
      options.offset = args.skip;
    }
    if (args.take) {
      options.limit = args.take;
    }

    return this.find(query, options);
  }

  /**
   * Find single document matching query
   */
  async findOne(query: Query): Promise<any | null> {
    const results = await this.find(query, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Prisma-compatible findUnique
   */
  async findUnique(args: { where: any }): Promise<any | null> {
    if (args.where.id) {
      return this.findById(args.where.id);
    }
    return this.findOne(args.where);
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<any | null> {
    return this.data.get(id) || null;
  }

  /**
   * Update document (Overloaded for Prisma compatibility)
   */
  async update(idOrArgs: string | { where: any, data: any }, data?: any): Promise<any> {
    if (typeof idOrArgs === 'string') {
      return this._updateById(idOrArgs, data);
    } else {
      const { where, data: updateData } = idOrArgs;
      if (where.id) {
        return this._updateById(where.id, updateData);
      }
      const doc = await this.findOne(where);
      if (!doc) throw new Error(`Document not found in ${this.name}`);
      return this._updateById(doc.id, updateData);
    }
  }

  private async _updateById(id: string, data: any): Promise<any> {
    if (!this.data.has(id)) {
      throw new Error(`Document ${id} not found in ${this.name}`);
    }

    const existing = this.data.get(id)!;
    const updated = { ...existing, ...data, id }; // Ensure ID doesn't change

    this.data.set(id, updated);
    this.saveToFile();

    return updated;
  }

  /**
   * Prisma-compatible updateMany
   */
  async updateMany(args: { where: any, data: any }): Promise<any> {
    const docs = await this.find(args.where);
    let count = 0;
    for (const doc of docs) {
      await this._updateById(doc.id, args.data);
      count++;
    }
    return { count };
  }

  /**
   * Delete document
   */
  async delete(id: string): Promise<boolean> {
    const existed = this.data.has(id);
    this.data.delete(id);

    if (existed) {
      this.saveToFile();
    }

    return existed;
  }

  /**
   * Count documents matching query
   */
  async count(query: Query): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }

  /**
   * Private helper: Check if document matches query
   */
  private matchesQuery(doc: any, query: Query): boolean {
    for (const key in query) {
      const queryValue = query[key];

      // Handle nested queries
      if (key.includes('.')) {
        const parts = key.split('.');
        let value = doc;
        for (const part of parts) {
          value = value?.[part];
        }
        if (!this.matchesValue(value, queryValue)) {
          return false;
        }
      } else if (typeof queryValue === 'object' && queryValue !== null) {
        // Handle MongoDB-style operators
        if (queryValue.$gte !== undefined || queryValue.$lte !== undefined || queryValue.$in !== undefined) {
          if (!this.matchesOperator(doc[key], queryValue)) {
            return false;
          }
        } else if (Array.isArray(queryValue)) {
          if (!queryValue.includes(doc[key])) {
            return false;
          }
        } else {
          if (JSON.stringify(doc[key]) !== JSON.stringify(queryValue)) {
            return false;
          }
        }
      } else {
        if (doc[key] !== queryValue) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Private helper: Check if value matches operator query
   */
  private matchesOperator(value: any, operator: any): boolean {
    if (operator.$gte !== undefined && value < operator.$gte) return false;
    if (operator.$lte !== undefined && value > operator.$lte) return false;
    if (operator.$gte !== undefined && operator.$lte !== undefined) {
      return value >= operator.$gte && value <= operator.$lte;
    }
    if (operator.$in !== undefined && !operator.$in.includes(value)) {
      return false;
    }
    if (operator.$eq !== undefined && value !== operator.$eq) return false;
    if (operator.$ne !== undefined && value === operator.$ne) return false;
    return true;
  }

  /**
   * Private helper: Check if value matches query value
   */
  private matchesValue(value: any, queryValue: any): boolean {
    if (typeof queryValue === 'object' && queryValue !== null) {
      return this.matchesOperator(value, queryValue);
    }
    return value === queryValue;
  }

  /**
   * Private helper: Sort results
   */
  private sortResults(results: any[], sort: { [key: string]: 1 | -1 }): any[] {
    return results.sort((a, b) => {
      for (const key in sort) {
        const direction = sort[key];
        const aVal = this.getNestedValue(a, key);
        const bVal = this.getNestedValue(b, key);

        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Private helper: Get nested value from object
   */
  private getNestedValue(obj: any, key: string): any {
    const parts = key.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }
}
