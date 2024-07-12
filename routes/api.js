"use strict";
const Issue = require("../models/issue");
const Project = require("../models/project");

module.exports = function (app) {

  app
    .route("/api/issues/:project")

    .get( async function  (req, res) {
      let project = req.params.project;
      const filters = { ...req.query };
      if (filters.open !== undefined) {
        filters.open = filters.open === 'true';
      }
      if (filters.created_on) {
        filters.created_on = new Date(filters.created_on);
      }
      if (filters.updated_on) {
        filters.updated_on = new Date(filters.updated_on);
      }
    const projectico = await Project.findOne({ name: project });
        if (projectico) {
          const issues = await Issue.find({ _id: { $in: projectico.issues }, ...filters });
          res.json(issues);
        } else {
          res.json({ error: "no project found" });
        }
    
    })

    .post(function (req, res) {
      const projectName = req.params.project;

      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      const issueToCreate = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: req.body.open !== undefined ? req.body.open : true,
      });

      issueToCreate
        .save()
        .then((result) => {
          Project.findOneAndUpdate(
            { name: projectName },
            { $push: { issues: result } },
            { upsert: true, new: true, useFindAndModify: false } 
          )
            .then(() => {
              res.json(result);
            })
            .catch((err) => {
              res.status(500).json({ error: "Error saving project" });
            });
        })
        .catch((err) => {
          res.status(500).json({ error: "required field(s) missing" });
        });
    })

    .put( async function(req, res)  {
      try {
        const issueId = req.body._id;
        if (!issueId) {
          return res.json({ error: 'missing _id' });
        }

        const keys = Object.keys(req.body);
        if (keys.length === 1 && keys[0] == '_id') {
          return res.json({ error: 'no update field(s) sent', '_id': issueId });
        }
        const updateData = { ...req.body };
        delete updateData._id;

        updateData.updated_on = new Date();
    
        const updatedIssue = await Issue.findByIdAndUpdate(
          issueId,
          updateData,
          { new: true, runValidators: false }
        );
        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': issueId });
        }
        res.json( {  result: 'successfully updated', '_id': issueId });
      } catch (error) {
        res.json( { error: 'could not update', '_id': req.body._id });
      }
    })

    .delete( async function (req, res) {
      const issueId = req.body._id;
      if (!issueId) {
        return res.json({ error: 'missing _id' });
      }
      let deleteResult = null;
      try{
         deleteResult = await Issue.deleteOne({ _id: issueId });
      } catch{
        return res.json({ error: 'could not delete', '_id': issueId });
      }
     
  
      if (deleteResult.deletedCount == 0) {
        return res.json({ error: 'could not delete', '_id': issueId });
      }
  
      res.json({ result: 'successfully deleted', '_id': issueId });
    });
};
