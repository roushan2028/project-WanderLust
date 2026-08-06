const mongoose = require('mongoose');
const intData = require('./data.js');
const Listing = require('../models/listing');

main()
  .then(() => {
    console.log('connected');
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}

const initDB = async () => {
  // await Listing.deleteMany({});
  intData.data = intData.data.map((obj)=>({...obj , owner :"6a5f59c1d996bfa08cda2937"}));
  await Listing.insertMany(intData.data);
  console.log('data was initialized');
};
initDB();
