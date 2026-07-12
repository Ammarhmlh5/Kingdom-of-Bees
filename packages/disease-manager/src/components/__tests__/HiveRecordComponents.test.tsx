import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiseaseHistoryList } from '../DiseaseHistoryList';
import { TreatmentHistoryList } from '../TreatmentHistoryList';
import { InspectionHistoryList } from '../InspectionHistoryList';
import { HiveStatisticsView } from '../index'; // Use the renamed export

// Mock the hooks
jest.mock('../../hooks/useHiveRecord', () => ({
    useHiveRecord: () => ({
        diseases: [
            {
                id: '1',
                diseaseId: 'disease-1',
                status: 'active',
                severity: 3,
                diagnosedAt: new Date('2023-01-01'),
                disease: { name: { ar: 'مرض 1', en: 'Disease 1' } }
            }
        ],
        treatments: [
            {
                id: '1',
                treatmentId: 'treatment-1',
                appliedAt: new Date('2023-01-02'),
                dosage: '10ml',
                method: 'spray',
                treatment: { name: { ar: 'علاج 1', en: 'Treatment 1' } },
                cost: { amount: 10, currency: 'USD' }
            }
        ],
        inspections: [
            {
                id: '1',
                inspectedAt: new Date('2023-01-03'),
                condition: 'good',
                population: { bees: 'normal', brood: 'normal' },
                resources: { honey: 'plenty' },
                notes: 'Everything looks good'
            }
        ],
        statistics: {
            healthScore: 85,
            healthTrend: 'improving',
            totalDiseases: 1,
            activeDiseases: 1,
            resolvedDiseases: 0,
            activeTreatments: 0,
            totalCost: 10,
            totalInspections: 1,
            averageCondition: 4
        },
        loading: false,
        error: null,
    })
}));

jest.mock('../../i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: 'en',
        dir: 'ltr',
    })
}));

describe('Hive Record Components', () => {
    const hiveId = 'test-hive';

    describe('DiseaseHistoryList', () => {
        it('renders disease list correctly', () => {
            render(<DiseaseHistoryList hiveId={hiveId} />);
            expect(screen.getByText('hiveRecord.diseaseHistory')).toBeInTheDocument();
            expect(screen.getByText('Disease 1')).toBeInTheDocument();
            // Use getAllByText for status since it might appear in filter dropdown too
            const activeStatusElements = screen.getAllByText('hiveRecord.diseaseStatus.active');
            expect(activeStatusElements.length).toBeGreaterThan(0);
        });
    });

    describe('TreatmentHistoryList', () => {
        it('renders treatment list correctly', () => {
            render(<TreatmentHistoryList hiveId={hiveId} />);
            expect(screen.getByText('hiveRecord.treatmentHistory')).toBeInTheDocument();
            expect(screen.getByText('Treatment 1')).toBeInTheDocument();
            expect(screen.getByText('10 USD')).toBeInTheDocument();
        });
    });

    describe('InspectionHistoryList', () => {
        it('renders inspection list correctly', () => {
            render(<InspectionHistoryList hiveId={hiveId} />);
            expect(screen.getByText('hiveRecord.inspectionHistory')).toBeInTheDocument();
            expect(screen.getByText('hiveRecord.hiveCondition.good')).toBeInTheDocument();
            expect(screen.getByText('Everything looks good')).toBeInTheDocument();
        });
    });

    describe('HiveStatistics', () => {
        it('renders statistics correctly', () => {
            render(<HiveStatisticsView hiveId={hiveId} />);
            expect(screen.getByText('85')).toBeInTheDocument();
            expect(screen.getByText('hiveRecord.statistics.healthScore')).toBeInTheDocument();
        });
    });
});
