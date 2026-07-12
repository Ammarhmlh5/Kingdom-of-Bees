import { config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class AppLogger {
    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(config.logging.level as LogLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }

    debug(message: string, ...args: any[]) {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG] ${new Date().toISOString()} -`, message, ...args);
        }
    }

    info(message: string, ...args: any[]) {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${new Date().toISOString()} -`, message, ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${new Date().toISOString()} -`, message, ...args);
        }
    }

    error(message: string, error?: any) {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${new Date().toISOString()} -`, message, error);
        }
    }
}

export const logger = new AppLogger();