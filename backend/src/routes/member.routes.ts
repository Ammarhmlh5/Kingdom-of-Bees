import { Router } from 'express';
import { getMembers, inviteMember, removeMember } from '../controllers/member.controller';
import { validate } from '../validators';
import { inviteMemberSchema } from '../validators/member.schema';

const router = Router({ mergeParams: true });

router.get('/', getMembers);
router.post('/', validate(inviteMemberSchema), inviteMember);
router.delete('/:memberId', removeMember);

export default router;
