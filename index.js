// Imports
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import chatsRouter from './routes/chat.js';





// Middleware
dotenv.config();
const app = express();
app.use(cors({origin:'*'}));
app.use(express.json());
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));





// Routes
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/chats', chatsRouter);





// Database connection
const MONGO_URL = process.env.MONGO_URL;
const main = async () => {
    await mongoose.connect(MONGO_URL, {useNewUrlParser:true, useUnifiedTopology:true});
};
main()
.then(console.log('🎉 Successfully connected to database.'))
.catch(error => console.error(error));





// Server
app.listen(4000, () => {
    console.log('🎉 Server is running.');
});