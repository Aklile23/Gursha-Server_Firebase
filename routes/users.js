// Imports
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import signToken from '../utils/jwt.js';
import {validatRegisterInput, validateLoginInput} from '../utils/validators.js';
const router = express.Router();





// Getting user by username
router.get('/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username});
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});





// Register user
router.post('/register', async (req, res) => {
    try {


        // Validating
        const {username, email, password, confirmPassword} = req.body;
        const existingUserName = await User.findOne({username});
        const existingUserEmail = await User.findOne({email});
        const {errors, valid} = validatRegisterInput(username, email, password, confirmPassword);
        if(!valid || existingUserName || existingUserEmail){
            if(existingUserName){
                errors.username = 'Username is taken';
            };
            if(existingUserEmail){
                errors.email = 'Email is taken';
            };
            res.status(400).json(errors);
        }else{

            // Saving user
            const hashedPassword = bcrypt.hashSync(password);
            const newUser = await User.create({
                username,
                email,
                password:hashedPassword,
                bio:'',
                profilePic:'',
                followers:[],
                following:[],
                followersCount:0,
                followingCount:0,
                likesCount:0,
                createdAt:new Date().toISOString()
            });

            // Generating token
            const token = signToken(newUser);
            res.status(200).json({
                ...newUser._doc,
                token
            });
        };


    } catch (err) {
        res.status(500).json(err);
    }
});





// Login user
router.post('/login', async (req, res) => {
    try {


        // Validating
        const {username, password} = req.body;
        const {errors, valid} = validateLoginInput(username, password);
        const user = await User.findOne({username});
        if(!valid){
            res.status(400).json(errors);
        };
        if(!user){
            errors.username = 'User not found';
            res.status(400).json(errors);
        }else{
            const match = bcrypt.compareSync(password, user.password);
            if(!match){
                errors.password = 'Wrong credentials';
                res.status(400).json(errors);
            };
        };


        // Login user
        const token = signToken(user);
        res.status(200).json({
            ...user._doc,
            token
        });


    } catch (err) {
        res.status(500).json(err);
    }
});






// User info
router.put('/update', async (req, res) => {
    try {
        const {previousUsername, bio, profilePic, username} = req.body;
        const existingUser = await User.findOne({username});
        if(username === ''){
            res.status(403).json('Username cannot be empty');
        };
        if(previousUsername === username){
            await User.updateOne({username}, {bio, profilePic});
            const returnUser = await User.findOne({username});
            res.status(200).json(returnUser);
        };
        if(existingUser){
            res.status(403).json('Username is taken');
        }
        await User.updateOne({username:previousUsername}, {username, bio, profilePic}, {new:true});
        const returnUser = await User.findOne({username});
        res.status(200).json(returnUser);
    } catch (err) {
        res.status(500).json(err);
    };
});





// Follow / Unfollow user
router.put('/follow/:followingId', async (req, res) => {
    try {
        const {followerId} = req.body;
        const {followingId} = req.params;
        const followingUser = await User.findById(followingId);
        const follower = await User.findById(followerId);
        if(followingUser.followers.includes(followerId)){
            await followingUser.updateOne({$pull:{followers:followerId}, followersCount:followingUser.followersCount - 1});
            await follower.updateOne({$pull:{following:followingId}, followingCount:follower.followingCount - 1});
            res.json('User unfollowed');
        }else{
            await followingUser.updateOne({$push:{followers:followerId}, followersCount:followingUser.followersCount + 1});
            await follower.updateOne({$push:{following:followingId}, followingCount:follower.followingCount + 1});
            res.json('User followed');
        };
    } catch (err) {
        res.status(500).json(err);
    }
});





// Fetching user's following
router.get('/following/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const followings = user.following;
        const users = await Promise.all(followings.map(id => {
            const theUsers = User.find({_id:id});
            return theUsers;
        }))
        const filteredUsers = users.map(user => user[0]);
        res.status(200).json(filteredUsers);
    } catch (err) {
        res.status(500).json(err.message);
    }
});





// Fetching user's followers
router.get('/followers/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const followers = user.followers;
        const users = await Promise.all(followers.map(id => {
            const theUsers = User.find({_id:id});
            return theUsers;
        }))
        const filteredUsers = users.map(user => user[0]);
        res.status(200).json(filteredUsers);
    } catch (err) {
        res.status(500).json(err.message);
    }
});





// Export
export default router;