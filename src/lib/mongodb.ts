import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'MONGODB_URI is notdefined'
    )
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache | undefined;
}

let catched: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = catched;
}
async function connectDB(): Promise<typeof mongoose> {
    if (catched.conn) {
        return catched.conn;
    }

    if (!catched.promise) {
        const opts = {
            bufferCommands: false,
        };
        catched.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose
        });
    }

    try{
        catched.conn = await catched.promise;
    }catch(error){
        catched.promise = null;
        throw error;
    }
    return catched.conn;
}

export default connectDB;