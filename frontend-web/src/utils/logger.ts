/**
 * Logger utility for frontend application
 * Provides structured logging with timestamps and context
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
}

class Logger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = import.meta.env.DEV;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
        };

        // Always log in development
        if (this.isDevelopment) {
            const emoji = this.getEmoji(level);
            const contextStr = context ? ` ${JSON.stringify(context)}` : '';
            
            switch (level) {
                case 'error':
                    console.error(`${emoji} [${entry.timestamp}] ${message}${contextStr}`);
                    break;
                case 'warn':
                    console.warn(`${emoji} [${entry.timestamp}] ${message}${contextStr}`);
                    break;
                case 'debug':
                    console.debug(`${emoji} [${entry.timestamp}] ${message}${contextStr}`);
                    break;
                default:
                    console.log(`${emoji} [${entry.timestamp}] ${message}${contextStr}`);
            }
        }
    }

    private getEmoji(level: LogLevel): string {
        const emojis: Record<LogLevel, string> = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '🔍',
        };
        return emojis[level];
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log('error', message, context);
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log('debug', message, context);
    }
}

export const logger = new Logger();