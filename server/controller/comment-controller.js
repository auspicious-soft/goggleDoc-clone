import Comment from '../schema/commentSchema.js'

export const getComment = async (id) => {
        
    if (id === null) return;

    const comment = await Comment.findById(id);


    if(comment) return comment;

    return await Comment.create({ _id: id, data: "" })
}

export const updateComment = async (id, data) => {
    return await Comment.findByIdAndUpdate(id, { data });
}