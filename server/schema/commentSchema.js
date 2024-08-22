import mongoose  from 'mongoose';

const commentSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    }
});

const comment = mongoose.model('comments', commentSchema);

export default comment;