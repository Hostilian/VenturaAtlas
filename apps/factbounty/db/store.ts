import fs from 'fs';
import path from 'path';
import { BountyRequest, EvidenceSubmission, PaymentTransaction } from '../shared/types';
import { ChallengeRecord } from '../capture/challenge-engine';
import { StoredMediaObject } from '../media/s3-adapter';

export class FactBountyStore {
  private dbPath: string;
  public bounties: Map<string, BountyRequest> = new Map();
  public evidence: Map<string, EvidenceSubmission> = new Map();
  public transactions: Map<string, PaymentTransaction> = new Map();
  public challenges: Map<string, ChallengeRecord> = new Map();
  public mediaObjects: Map<string, StoredMediaObject> = new Map();

  constructor(customPath?: string) {
    this.dbPath = customPath || path.join(__dirname, '..', '..', '..', '.agent-state', 'factbounty-db.json');
    this.loadSync();
  }

  public loadSync(): void {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const data = JSON.parse(raw);
        (data.bounties || []).forEach((b: BountyRequest) => this.bounties.set(b.id, b));
        (data.evidence || []).forEach((e: EvidenceSubmission) => this.evidence.set(e.id, e));
        (data.transactions || []).forEach((t: PaymentTransaction) => this.transactions.set(t.id, t));
        (data.challenges || []).forEach((c: ChallengeRecord) => this.challenges.set(c.id, c));
        (data.mediaObjects || []).forEach((m: StoredMediaObject) => this.mediaObjects.set(m.id, m));
      } catch (err: any) {
        console.error(`[FactBountyStore] Load failed for ${this.dbPath}: ${err.message}`);
      }
    }
  }

  public saveSync(): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const data = {
        bounties: Array.from(this.bounties.values()),
        evidence: Array.from(this.evidence.values()),
        transactions: Array.from(this.transactions.values()),
        challenges: Array.from(this.challenges.values()),
        mediaObjects: Array.from(this.mediaObjects.values())
      };

      const tmpPath = `${this.dbPath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.dbPath);
    } catch (err: any) {
      console.error(`[FactBountyStore] Save failed for ${this.dbPath}: ${err.message}`);
    }
  }
}
