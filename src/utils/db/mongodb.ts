import mongoose, { Mongoose } from "mongoose";
import TokenBlacklist from "./models/TokenBlacklist";

if (!process.env.MONGODB_URI) throw new Error("No MONGO_DATABASE_URL provided, cannot connect to database!");

const uri = process.env.MONGODB_URI;
const options: mongoose.ConnectOptions = {};

let conn: Mongoose | undefined;

async function connect(): Promise<Mongoose> {
  if (conn) return conn;

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoConn?: Mongoose,
      _mongoClientPromise?: Promise<Mongoose>
    }

    if (globalWithMongo._mongoConn) {
      return conn = globalWithMongo._mongoConn;
    }
  
    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = mongoose.connect(uri, options)
        .then((conn)=>{return globalWithMongo._mongoConn = conn})
    }
    conn = globalWithMongo._mongoConn = await globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    conn = await mongoose.connect(uri, options);
  }

  setInterval(()=>{
    TokenBlacklist.deleteMany({where: {expires: { $lt: Date.now() }}}).catch((err)=>{
        console.error("Error removing expired jwt ids: ", err);
    })
  }, 60000);
  console.log("Established connection to mongodb database");
  return conn;
}

export default connect;