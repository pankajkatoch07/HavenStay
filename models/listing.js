const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
       url: String,
       filename: String
    },
    price: Number,
    location: String,
    country: String,
    category: {
        type: String,
        required: true,
        default: "trending",
        enum: ["trending", "rooms", "iconic-cities", "mountains", "beaches", "villa", "camping", "boats"]
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

//mongoose middleware for review deletion after post deletion
listingSchema.post("findOneAndDelete" , async(listing) => {
    if(listing) {
    await Review.deleteMany({_id : {$in : listing.reviews}});
    };
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;