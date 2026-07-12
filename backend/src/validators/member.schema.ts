import { z } from 'zod';

export const inviteMemberSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
});
