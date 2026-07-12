import { prisma } from '../config/database';
import { AlertStatus, NotificationType, ActionPriority } from '@prisma/client';

export class GeoAlertService {
    private static readonly ALERT_RADIUS_KM = 10;

    /**
     * Calculate distance between two points using Haversine formula
     */
    private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Find nearby apiaries and send alerts about a disease outbreak
     */
    static async broadcastDiseaseAlert(
        sourceApiaryId: string,
        diseaseName: string,
        diseaseId: string
    ): Promise<void> {
        const sourceApiary = await prisma.apiary.findUnique({
            where: { id: sourceApiaryId },
            select: { locationLat: true, locationLng: true, name: true }
        });

        if (!sourceApiary || !sourceApiary.locationLat || !sourceApiary.locationLng) {
            console.warn(`Cannot broadcast alert: Source apiary ${sourceApiaryId} has no location`);
            return;
        }

        // specific implementation: Get all apiaries with location
        // In a real production app with PostGIS, we would use ST_DWithin
        // For now, fetching all (assuming reasonable number) or filtering by crude box query is okay for MVP
        const allApiaries = await prisma.apiary.findMany({
            where: {
                id: { not: sourceApiaryId }, // Exclude source
                locationLat: { not: null },
                locationLng: { not: null },
                isActive: true
            },
            select: { id: true, ownerId: true, name: true, locationLat: true, locationLng: true }
        });

        const nearbyApiaries = allApiaries.filter(apiary => {
            const dist = this.calculateDistance(
                Number(sourceApiary.locationLat),
                Number(sourceApiary.locationLng),
                Number(apiary.locationLat),
                Number(apiary.locationLng)
            );
            return dist <= this.ALERT_RADIUS_KM;
        });

        console.log(`Found ${nearbyApiaries.length} nearby apiaries for disease alert.`);

        // Create alerts for owners of nearby apiaries
        // We use a transaction to ensure all alerts are sent or none
        await prisma.$transaction(
            nearbyApiaries.map(apiary =>
                prisma.alert.create({
                    data: {
                        userId: apiary.ownerId,
                        apiaryId: apiary.id,
                        alertType: 'DISEASE_OUTBREAK_NEARBY',
                        priority: ActionPriority.URGENT,
                        title: `تحذير: مرض ${diseaseName} قريب منك`,
                        message: `تم اكتشاف حالة ${diseaseName} في منحل قريب (${this.ALERT_RADIUS_KM} كم). يرجى فحص نحلك فوراً.`,
                        actionRequired: true,
                        status: AlertStatus.ACTIVE,
                        actionUrl: `/dashboard/apiaries/${apiary.id}/inspections/new`
                    }
                })
            )
        );
    }
}
