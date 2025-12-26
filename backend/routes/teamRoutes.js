import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createTeam,
    getTeams,
    joinTeam,
    getMyTeam,
    respondToJoinRequest,
    switchTeam,
    updateTeam,
    deleteTeam
} from '../controllers/teamController.js';

const router = express.Router();

router.route('/')
    .post(protect, createTeam)
    .get(protect, getTeams);

router.get('/my-team', protect, getMyTeam);
router.post('/:id/join', protect, joinTeam);
router.post('/:id/switch', protect, switchTeam);
router.put('/:id/members/:userId', protect, respondToJoinRequest);

router.route('/:id')
    .put(protect, updateTeam)
    .delete(protect, deleteTeam);

export default router;
