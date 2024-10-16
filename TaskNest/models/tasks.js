const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema ({
    data: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    time: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
      }, 
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;