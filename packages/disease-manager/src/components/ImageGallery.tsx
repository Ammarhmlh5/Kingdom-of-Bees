/**
 * ImageGallery Component
 * 
 * معرض الصور
 * يعرض صور الخلية المتعلقة بالأمراض والعلاجات والفحوصات
 */

import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import './ImageGallery.css';

export interface ImageGalleryProps {
    hiveId: string;
    className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    hiveId,
    className = '',
}) => {
    const { t, locale, direction: dir } = useI18n();
    const { images, loading, error } = useHiveRecord({ hiveId });
    const [filter, setFilter] = useState<'all' | 'disease' | 'treatment' | 'inspection'>('all');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filteredImages = images.filter(img =>
        filter === 'all' || img.context === filter
    );

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    if (loading) return <div className="gallery-loading">{t('common.loading')}</div>;
    if (error) return <div className="gallery-error">{t('common.error')}: {error.message}</div>;

    return (
        <div className={`hive-image-gallery ${className}`} dir={dir}>
            <div className="gallery-header">
                <h3>{t('hiveRecord.images')}</h3>
                <div className="gallery-filters">
                    {(['all', 'disease', 'treatment', 'inspection'] as const).map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {t(f === 'all' ? 'common.all' : `hiveRecord.imageContext.${f}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="gallery-grid">
                {filteredImages.length === 0 ? (
                    <div className="no-images">{t('hiveRecord.noRecords')}</div>
                ) : (
                    filteredImages.map(image => (
                        <div
                            key={image.id}
                            className="gallery-item"
                            onClick={() => setSelectedImage(image.url)}
                        >
                            <img src={image.url} alt={image.tags.join(', ')} />
                            <div className="image-overlay">
                                <span className="image-date">{formatDate(image.capturedAt)}</span>
                                <span className="image-context">{t(`hiveRecord.imageContext.${image.context}`)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedImage && (
                <div className="lightbox" onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content">
                        <img src={selectedImage} alt="Full size" />
                        <button className="close-btn" onClick={() => setSelectedImage(null)}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};
