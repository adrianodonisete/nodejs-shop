const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const dotenv = require("dotenv");
dotenv.config();

let _db;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;

const mongoConnect = callback => {
    MongoClient.connect(
        `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true`
    )
        .then(client => {
            console.log("Connected!");
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
