import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const CreateBountySchema = z.object({
  productUrl: z.string().url().refine(
    url => url.startsWith('http://') || url.startsWith('https://'),
    'URL must use HTTP or HTTPS protocol'
  ),
  question: z.string().min(10).max(500),
  checklist: z.array(z.string().min(3).max(200)).min(1).max(20).default([
    'Visual measurement',
    'Connector presence',
    'Package contents'
  ]),
  bountyAmount: z.number().int().min(300).max(5000), // €3.00 to €50.00
  productTitle: z.string().max(200).optional()
});

export const CheckoutBountySchema = z.object({}).strict();

export const AcceptBountySchema = z.object({});

export const SubmitEvidenceSchema = z.object({
  mediaObjectId: z.string().min(1).optional(),
  mediaUrl: z.string().url().optional(),
  challengeCode: z.string().min(3).max(20),
  checklistFulfilledIds: z.array(z.string()).min(1),
  reusableConsent: z.boolean().default(true)
});

export const ReviewEvidenceSchema = z.object({
  decision: z.enum(['approve', 'request_correction', 'reject']),
  notes: z.string().max(2000).optional()
});

export const SuggestChecklistSchema = z.object({
  question: z.string().min(5).max(500)
});

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body validation failed',
          issues: result.error.errors
        }
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
