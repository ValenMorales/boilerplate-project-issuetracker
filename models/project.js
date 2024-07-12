const mongoose = require('mongoose');
const Issue = require('./issue'); 

const projectSchema = new mongoose.Schema({
    name: String,
    issues: {
        type: [Issue.schema], 
      }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
