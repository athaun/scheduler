import mongoose from 'mongoose'

const Item = mongoose.model('Item', {
    title: String,
    description: String,
    persistent: Boolean,
    affiliation: String,
    days: [String],
    dateAdded: Date,
    color: String,
})

export default Item