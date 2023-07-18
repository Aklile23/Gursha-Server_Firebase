// Imports
import mongoose from 'mongoose';





// User schema
const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    bio:String,
    profilePic:String,
    followers:[String],
    following:[String],
    followersCount:Number,
    followingCount:Number,
    likesCount:Number,
    createdAt:String
});





// Export
export default mongoose.model('User', userSchema);