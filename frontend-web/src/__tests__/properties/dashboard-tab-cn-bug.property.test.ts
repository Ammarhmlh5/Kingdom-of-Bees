/**
 * Property-Based Tests: DashboardTab cn ReferenceError Bug Condition
 * Feature: dashboard-tab-cn-undefined
 * Property 1 from design.md: Bug Condition - cn ReferenceError on DashboardTab Render
 *
 * Validates: Requirements 1.1, 1.2
 *
 * IMPORTANT: This test is designed to FAIL on unfixed code.
 * Failure confirms the bug exists: `cn` is called in DashboardTab.tsx but never imported.
 * The test will PASS after the fix (adding `import { cn } from '@/lib/utils'`).
 *
 * Run: npx vitest run src/__tests__/properties/dashboard-tab-cn-bug.property.test.ts
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ─── Static Analysis: Bug Condition Check ────────────────────────────────────
//
// The bug condition is:
//   isBugCondition(render) = cnIsCalledInComponent AND cnIsNotImported
//
// We verify this by inspecting the source file directly.
// On unfixed code: cn is called but NOT imported → test FAILS (bug confirmed)
// On fixed code:   cn is called AND IS imported   → test PASSES (bug resolved)

const COMPONENT_PATH = path.resolve(
    __dirname,
    '../../components/hives/DashboardTab.tsx'
);

function readComponentSource(): string {
    return fs.readFileSync(COMPONENT_PATH, 'utf-8');
}

function cnIsImported(source: string): boolean {
    // Check for: import { cn } from '@/lib/utils'
    // or: import { ..., cn, ... } from '@/lib/utils'
    return /import\s*\{[^}]*\bcn\b[^}]*\}\s*from\s*['"]@\/lib\/utils['"]/.test(source);
}

function cnIsCalledInComponent(source: string): boolean {
    // Check that cn(...) is actually used in the component
    return /\bcn\s*\(/.test(source);
}

// ─── Property 1: Bug Condition - cn Resolves Without ReferenceError ───────────
//
// **Validates: Requirements 1.1, 1.2**
//
// For any render of DashboardTab where cn is called in JSX expressions,
// the component SHALL have cn imported from '@/lib/utils'.
// Without the import, any render throws ReferenceError: cn is not defined.

describe('Property 1: Bug Condition - cn ReferenceError on DashboardTab Render', () => {
    it('DashboardTab must import cn from @/lib/utils when cn is used in JSX', () => {
        const source = readComponentSource();

        // Confirm the bug condition: cn IS called in the component
        const cnCalled = cnIsCalledInComponent(source);
        expect(cnCalled).toBe(true); // cn is used — this should always be true

        // Assert the fix: cn MUST be imported
        // On unfixed code: this assertion FAILS → ReferenceError would occur at runtime
        // On fixed code:   this assertion PASSES → cn resolves correctly
        const cnImported = cnIsImported(source);
        expect(cnImported).toBe(true);
    });

    it('cn import must be present before any cn(...) call site', () => {
        const source = readComponentSource();
        const lines = source.split('\n');

        // Find the first line where cn(...) is called
        const firstCnCallLine = lines.findIndex(line => /\bcn\s*\(/.test(line));
        // Find the import line for cn
        const cnImportLine = lines.findIndex(line =>
            /import\s*\{[^}]*\bcn\b[^}]*\}\s*from\s*['"]@\/lib\/utils['"]/.test(line)
        );

        // cn must be called somewhere in the file
        expect(firstCnCallLine).toBeGreaterThan(-1);

        // cn import must exist AND appear before the first call site
        // On unfixed code: cnImportLine === -1 → test FAILS (bug confirmed)
        expect(cnImportLine).toBeGreaterThan(-1);
        expect(cnImportLine).toBeLessThan(firstCnCallLine);
    });
});
