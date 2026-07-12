/**
 * NotesList Component
 * 
 * قائمة الملاحظات
 * يعرض الملاحظات المسجلة على الخلية
 */

import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useHiveRecord } from '../hooks/useHiveRecord';
import type { NoteRecord } from '../types/hive-record';
import './NotesList.css';

export interface NotesListProps {
    hiveId: string;
    className?: string;
    onEdit?: (note: NoteRecord) => void;
    onDelete?: (noteId: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
    hiveId,
    className = '',
    onEdit,
    onDelete,
}) => {
    const { t, locale, direction: dir } = useI18n();
    const { notes, loading, error } = useHiveRecord({ hiveId });
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    const filteredNotes = notes
        .filter(note => filter === 'all' || note.priority === filter)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    const getPriorityColor = (priority: string | undefined) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    if (loading) return <div className="notes-loading">{t('common.loading')}</div>;
    if (error) return <div className="notes-error">{t('common.error')}: {error.message}</div>;

    return (
        <div className={`notes-list ${className}`} dir={dir}>
            <div className="notes-header">
                <h3>{t('hiveRecord.notes')}</h3>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="priority-filter"
                >
                    <option value="all">{t('common.all')}</option>
                    <option value="high">{t('hiveRecord.alertPriority.high')}</option>
                    <option value="medium">{t('hiveRecord.alertPriority.medium')}</option>
                    <option value="low">{t('hiveRecord.alertPriority.low')}</option>
                </select>
            </div>

            <div className="notes-content">
                {filteredNotes.length === 0 ? (
                    <div className="no-notes">{t('hiveRecord.noRecords')}</div>
                ) : (
                    filteredNotes.map(note => (
                        <div key={note.id} className="note-card">
                            <div className="note-header">
                                <span
                                    className="priority-dot"
                                    style={{ backgroundColor: getPriorityColor(note.priority) }}
                                    title={t(`hiveRecord.alertPriority.${note.priority}`)}
                                />
                                <span className="note-date">{formatDate(note.createdAt)}</span>
                                <span className="note-context badge">{t(`hiveRecord.noteContext.${note.context}`)}</span>

                                <div className="note-actions">
                                    {onEdit && (
                                        <button onClick={() => onEdit(note)} className="action-btn">✎</button>
                                    )}
                                    {onDelete && (
                                        <button onClick={() => onDelete(note.id)} className="action-btn delete">×</button>
                                    )}
                                </div>
                            </div>

                            <div className="note-body">
                                {note.content}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
