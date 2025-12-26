import Team from '../models/Team.js';
import User from '../models/User.js';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;

        const teamExists = await Team.findOne({ name });
        if (teamExists) {
            return res.status(400).json({ message: 'Team name already exists' });
        }

        const team = await Team.create({
            name,
            description,
            members: [{
                user: req.user._id,
                status: 'accepted',
                role: 'leader'
            }]
        });

        // Set user's current team
        const user = await User.findById(req.user._id);
        user.currentTeam = team._id;
        await user.save();

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teams (search)
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const teams = await Team.find({ ...keyword })
            .select('name description members createdAt')
            .populate('members.user', 'name email');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a team
// @route   POST /api/teams/:id/join
// @access  Private
const joinTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const alreadyMember = team.members.find(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({ message: 'Already a member or pending approval' });
        }

        team.members.push({
            user: req.user._id,
            status: 'pending',
            role: 'member'
        });

        await team.save();
        res.status(200).json({ message: 'Join request sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my team details
// @route   GET /api/teams/my-team
// @access  Private
const getMyTeam = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.currentTeam) {
            return res.status(404).json({ message: 'Not in a team' });
        }

        const team = await Team.findById(user.currentTeam).populate('members.user', 'name email avatar');
        
        // Populate stats logic could go here
        
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Respond to join request
// @route   PUT /api/teams/:id/members/:userId
// @access  Private (Leader only)
const respondToJoinRequest = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if requester is leader
        const isLeader = team.members.find(
            member => member.user.toString() === req.user._id.toString() && member.role === 'leader'
        );

        if (!isLeader) {
            return res.status(403).json({ message: 'Not authorized to manage members' });
        }

        const memberIndex = team.members.findIndex(
            member => member.user.toString() === req.params.userId
        );

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member request not found' });
        }

        if (status === 'rejected') {
            team.members.splice(memberIndex, 1);
        } else {
            team.members[memberIndex].status = status;
            
            // If accepted, user MIGHT switch, but let's leave that to manual switch or auto-switch on next login if they have no team
        }

        await team.save();
        res.json(team);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Switch active team
// @route   POST /api/teams/:id/switch
// @access  Private
const switchTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify membership
        const isMember = team.members.find(
            member => member.user.toString() === req.user._id.toString() && member.status === 'accepted'
        );

        if (!isMember) {
            return res.status(403).json({ message: 'Not a member of this team' });
        }

        const user = await User.findById(req.user._id);
        user.currentTeam = team._id;
        await user.save();

        res.json({ message: `Switched to ${team.name}`, teamId: team._id });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update team details
// @route   PUT /api/teams/:id
// @access  Private (Leader only)
const updateTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify leader status
        const isLeader = team.members.find(
            member => member.user.toString() === req.user._id.toString() && member.role === 'leader'
        );

        if (!isLeader) {
            return res.status(403).json({ message: 'Only the team leader can update team details' });
        }

        team.name = name || team.name;
        team.description = description || team.description;

        const updatedTeam = await team.save();
        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Leader only)
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify leader status
        const isLeader = team.members.find(
            member => member.user.toString() === req.user._id.toString() && member.role === 'leader'
        );

        if (!isLeader) {
            return res.status(403).json({ message: 'Only the team leader can delete the team' });
        }

        // Remove currentTeam reference from all members
        await User.updateMany(
            { currentTeam: team._id },
            { $unset: { currentTeam: "" } }
        );

        await team.deleteOne();
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createTeam, getTeams, joinTeam, getMyTeam, respondToJoinRequest, switchTeam, updateTeam, deleteTeam };
