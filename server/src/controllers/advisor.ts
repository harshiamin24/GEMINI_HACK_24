import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateLogisticsAdvice } from '../services/gemini.js';

/**
 * POST /api/ai/advisor - Query generative AI logistics consultant
 */
export async function queryAdvisor(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { message, context } = req.body;

    // Build enriched prompt with operational context
    let enrichedPrompt = message;

    if (context) {
      enrichedPrompt = `
Current Operational Context:
- Active Micro-Hubs: ${context.activeHubs || 'unknown'}
- Total Parcels in System: ${context.totalParcels || 'unknown'}
- Active Cargo Bikes: ${context.activeBikes || 'unknown'}

User Question: ${message}

Provide actionable advice with specific recommendations. If relevant, include:
1. Quantitative estimates for improvement
2. Step-by-step implementation suggestions
3. Risk factors to consider
4. Timeline expectations`;
    }

    const response = await generateLogisticsAdvice(enrichedPrompt);

    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('AI advisor error:', err);
    res.status(500).json({ error: 'Failed to query AI advisor' });
  }
}
