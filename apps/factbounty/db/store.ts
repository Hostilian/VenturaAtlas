/**
 * FactBounty In-Memory & Persistent Storage Manager
 */
import fs from 'fs';
import path from 'path';
import { BountyRequest, EvidenceSubmission, PaymentTransaction } from '../shared/types';

export class FactBountyStore {
  private dbPath: string;
  public bounties: Map<string, BountyRequest> = new Map();
  public evidence: Map<string, EvidenceSubmission> = new Map();
  public transactions: Map<string, PaymentTransaction> = new Map();

  constructor(customPath?: string) {
    this.dbPath = customPath || path.join(__dirname, '..', '..', '..', '.agent-state', 'factbounty-db.json');
    this.load();
  }

  public load(): void {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const data = JSON.parse(raw);
        (data.bounties || []).forEach((b: BountyRequest) => this.bounties.set(b.id, b));
        (data.evidence || []).forEach((e: EvidenceSubmission) => this.evidence.set(e.id, e));
        (data.transactions || []).forEach((t: PaymentTransaction) => this.transactions.set(t.id, t));
      } catch (err) {
        // Fallback to empty on parse error
      }
    }
  }

  public save(): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const data = {
        bounties: Array.from(this.bounties.values()),
        evidence: Array.from(this.evidence.values()),
        transactions: Array.from(this.transactions.values())
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      // Ignore write errors in restricted env
    }
  }
}
