import crypto from 'crypto';

export interface ChallengeRecord {
  id: string;
  bountyId: string;
  responderId: string;
  codeHash: string;
  generatedAt: string;
  expiresAt: string;
  usedAt?: string;
  attemptCount: number;
}

export class ChallengeCodeEngine {
  private static CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  private static MAX_ATTEMPTS = 5;

  private static hashCode(code: string, bountyId: string): string {
    const norm = code.replace(/-/g, '').toUpperCase();
    return crypto.createHmac('sha256', bountyId).update(norm).digest('hex');
  }

  static generateChallenge(bountyId: string, responderId: string, ttlSeconds: number = 600): { record: ChallengeRecord; plaintextCode: string } {
    let code = '';
    for (let i = 0; i < 6; i++) {
      const idx = crypto.randomInt(0, this.CODE_CHARS.length);
      code += this.CODE_CHARS.charAt(idx);
    }
    const plaintextCode = `${code.slice(0, 3)}-${code.slice(3)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

    const record: ChallengeRecord = {
      id: `challenge_${crypto.randomUUID()}`,
      bountyId,
      responderId,
      codeHash: this.hashCode(plaintextCode, bountyId),
      generatedAt: now.toISOString(),
      expiresAt,
      attemptCount: 0
    };

    return { record, plaintextCode };
  }

  static verifyChallenge(
    record: ChallengeRecord,
    submittedCode: string,
    bountyId: string,
    responderId: string
  ): { valid: boolean; reason?: string } {
    if (record.bountyId !== bountyId) {
      return { valid: false, reason: 'Challenge belongs to another bounty' };
    }
    if (record.responderId !== responderId) {
      return { valid: false, reason: 'Challenge belongs to another responder' };
    }
    if (record.usedAt) {
      return { valid: false, reason: 'Challenge code has already been used' };
    }
    if (record.attemptCount >= this.MAX_ATTEMPTS) {
      return { valid: false, reason: 'Maximum challenge verification attempts exceeded' };
    }

    record.attemptCount += 1;

    const now = new Date();
    if (now > new Date(record.expiresAt)) {
      return { valid: false, reason: 'Challenge code expired' };
    }

    const submittedHash = this.hashCode(submittedCode, bountyId);
    const expectedHash = record.codeHash;

    const bufSubmitted = Buffer.from(submittedHash, 'utf8');
    const bufExpected = Buffer.from(expectedHash, 'utf8');

    if (bufSubmitted.length !== bufExpected.length || !crypto.timingSafeEqual(bufSubmitted, bufExpected)) {
      return { valid: false, reason: 'Challenge code mismatch' };
    }

    record.usedAt = now.toISOString();
    return { valid: true };
  }
}
