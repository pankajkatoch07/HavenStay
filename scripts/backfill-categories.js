const mongoose = require('mongoose');
const Listing = require('../models/listing');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/HavenStay');
  const result = await Listing.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'trending' } }
  );
  console.log(JSON.stringify({ matched: result.matchedCount, modified: result.modifiedCount }));
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
