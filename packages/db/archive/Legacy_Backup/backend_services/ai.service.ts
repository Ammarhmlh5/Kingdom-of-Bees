import { prisma } from '../config/database';

export class AIService {

  static async getRecommendations(userId: string, apiaryId?: string, hiveId?: string) {
    return prisma.aIRecommendationLog.findMany({
      where: {
        userId,
        apiaryId,
        hiveId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
  }

  static async generateRecommendation(userId: string, apiaryId?: string, hiveId?: string) {
    // This would normally call an LLM with the context of the apiary/hive
    // For now, we generate a structured mock recommendation based on existing data

    let targetName = "General";
    if (hiveId) {
      const hive = await prisma.hive.findUnique({ where: { id: hiveId } });
      targetName = `Hive ${hive?.hiveNumber}`;
    } else if (apiaryId) {
      const apiary = await prisma.apiary.findUnique({ where: { id: apiaryId } });
      targetName = apiary?.name || "Apiary";
    }

    const recommendations = [
      {
        type: 'INSPECTION',
        title: `Scheduled Inspection for ${targetName}`,
        content: `Based on your last visit 14 days ago, it's time to check for queen activity and room for expansion.`,
        priority: 'SOON'
      },
      {
        type: 'FEEDING',
        title: `Pre-Winter Feeding Advice`,
        content: `Weather forecasts show a temperature drop. Ensure ${targetName} has enough syrup stores.`,
        priority: 'URGENT'
      },
      {
        type: 'HEALTH',
        title: `Disease Prevention Alert`,
        content: `High humidity detected in ${targetName}. Ensure proper ventilation to prevent fungal infections.`,
        priority: 'SOON'
      }
    ];

    const selected = recommendations[Math.floor(Math.random() * recommendations.length)];

    return prisma.aIRecommendationLog.create({
      data: {
        userId,
        apiaryId,
        hiveId,
        recommendationType: selected.type,
        inputData: { targetName },
        recommendation: { title: selected.title, advice: selected.content },
        confidenceScore: 0.95,
        modelName: 'KingdomAI-V1'
      }
    });
  }

  static async markRecommendationImplemented(id: string, outcomeRating?: number, notes?: string) {
    return prisma.aIRecommendationLog.update({
      where: { id },
      data: {
        implemented: true,
        outcomeRating,
        outcomeNotes: notes
      }
    });
  }
}
