// Imports
import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import checkAuth from '../utils/checkAuth.js';
import {validatePostInput} from '../utils/validators.js';
const router = express.Router();





// Create post
router.post('/', async (req, res) => {
    try {
        const {body, video} = req.body;
        const user = checkAuth(req);
        const {errors, valid} = validatePostInput(video);
        if(!valid){
            res.status(400).json(errors);
        };
        const post = await Post.create({
            body,
            video,
            user:user.id,
            username:user.username,
            likesCount:0,
            commentsCount:0,
            createdAt:new Date().toISOString()
        });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err.message);
    }
});





// Fetch feed posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt:-1});
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});





// Like post
router.put('/like/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {userId} = req.body;
        const post = await Post.findById(id);
        const user = await User.findById(userId);
        const ids = post.likes.map(like => like.id);
        if(ids.includes(userId)){
            await post.updateOne({$pull:{likes:{
                id:userId
            }}, likesCount:post.likesCount - 1});
            res.status(200).json('Post unliked.');
        }else{
            await post.updateOne(
                {
                    $push:
                        {
                            likes:{
                                id:userId,
                                username:user.username,
                                createdAt:new Date().toISOString()
                            }
                        },
                        likesCount:post.likesCount + 1
                }
            );
            res.status(200).json('Post liked.');
        };
    } catch (err) {
        res.status(500).json(err.message);
    }
});





// Comment on post
router.put('/comment/:postId', async (req, res) => {
    try {
        const {postId} = req.params;
        const {body, userId, profilePic} = req.body;
        const user = await User.findById(userId);
        const post = await Post.findById(postId);

        await post.updateOne({$push:{
            comments:{
                id:user._id,
                username:user.username,
                body,
                profilePic,
                createdAt:new Date().toISOString()
            }
        },
        commentsCount:post.commentsCount + 1
    });
        res.status(200).json('Comment posted.');
    } catch (err) {
        res.status(500).json(err);
    }
});





// Fetch user posts
router.get('/:userId', async (req, res) => {
    try {
        const {userId} = req.params;
        const posts = await Post.find({user:userId}).sort({createdAt:-1});
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});





// Fetch users followings videos
router.get('/following/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        const userFollowings = user.following;
        const posts = await Promise.all(
            userFollowings.map(userId => {                    
                const posts = Post.find({user:userId});
                return(posts);
            })
        );
        const filteredPosts = [];
        posts.forEach(user => user.map(post => filteredPosts.push(post)));
        res.status(200).json(filteredPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});





// Export
export default router;