/**
 * Cryptographic Challenge-Code Generator & Verifier
 */
import { ChallengeCode } from '../shared/types';

export class ChallengeCodeEngine {
  private static CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Unambiguous alphanumeric

  static generateChallenge(bountyId: string, responderId: string, ttlSeconds: number = 600): ChallengeCode {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += this.CODE_CHARS.charAt(Math.floor(Math.random() * this.CODE_CHARS.length));
    }
    const now = new Date();
    const expires = new Date(now.getTime() + ttlSeconds * 1000);

    return {
      code: `${code.slice(0, 3)}-${code.slice(3)}`,
      bountyId,
      responderId,
      generatedAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };
  }

  static verifyChallenge(challenge: ChallengeCode, submittedCode: string): { valid: boolean; reason?: string } {
    const normChallenge = challenge.code.replace('-', '').toUpperCase();
    const normSubmitted = submittedCode.replace('-', '').toUpperCase();

    if (normChallenge !== normSubmitted) {
      return { valid: false, reason: 'Challenge code mismatch' };
    }

    const now = new Date();
    const expires = new Date(challenge.expiresAt);
    if (now > expires) {
      return { valid: false, reason: 'Challenge code expired' };
    }

    return { valid: true };
  }
}
