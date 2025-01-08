const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    custCode : {type:Number},
    topic: {type:String},
    referenceLink:{type:String},
    script:{type:String},
    thumbnailText:{type:String},
    remark:{type:String},
    taskDate:{type:Date},
    writerName: {type: String},
    anchorName: {type: String},
    rawEditorName: {type: String},
    mainEditorName: {type: String},
    writerStatus: {type:String},
    rawStatus: {type:String},
    mainStatus: {type: String}
});

module.exports = mongoose.model('task', taskSchema);