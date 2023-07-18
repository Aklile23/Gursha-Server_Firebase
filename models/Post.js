// Imports
import mongoose from 'mongoose';





// User schema
const postSchema = new mongoose.Schema({
    username:String,
    video:String,
    body:String,
    likesCount:Number,
    commentsCount:Number,
    createdAt:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    likes:[{
        id:String,
        username:String,
        createdAt:String
    }],
    comments:[{
        id:String,
        body:String,
        username:String,
        profilePic:String,
        createdAt:String
    }]
});





// Export
export default mongoose.model('Post', postSchema);