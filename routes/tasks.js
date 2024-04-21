var express = require('express');
var router = express.Router();
var db = require('../db');

// add a task
router.post('/tasks', function(req, res, next) {
    // read the task's description from the request
    var description = req.body.description;
    var projectId = req.body.project_id;
    var timeSpent = req.body.time_spent;
    var startTime = req.body.start_time;

    // check if the project exists
    db.one("select * from projects where id=$1", projectId)
    .then(project => {
        console.log("Project exists");
    })
    .catch(error => {
        res.status(401);
        res.send();
    });

    // check if the task description is defined
    if (!description) {
        res.status(402);
        res.send();
    }

    // check if the time spent is defined
    if (!timeSpent) {
        res.status(403);
        res.send();
    }

    // check if the start time is defined
    if (!startTime) {
        res.status(404);
        res.send();
    }

    // convert startTime from unix timestamp to date
    startTime = new Date(startTime * 1000);
    // save the task to the database
    db.none("insert into tasks(project_id, description, time_spent, start_time) values($1, $2, $3, $4)", [projectId, description, timeSpent, startTime])
    .then(() => {
        console.log("Task added");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error adding task", error);
        res.status(401);
        res.send();
    });
});

// list tasks
router.get('/tasks', function(req, res, next) {
    db.any("select * from tasks")
    .then(tasks => {
        res.status(200);
        res.send(tasks);
    })
    .catch(error => {
        console.log("Error getting tasks", error);
        res.status(404);
        res.send();
    });
});

// get a task
router.get('/tasks/:id', function(req, res, next) {
    var taskId = req.params.id;

    db.one("select * from tasks where id=$1", taskId)
    .then(task => {
        res.status(200);
        res.send(task);
    })
    .catch(error => {
        console.log("Error getting task", error);
        res.status(404);
        res.send();
    });
});

// update a task
router.put('/tasks/:id', function(req, res, next) {
    var taskId = req.params.id;
    var description = req.body.description;
    var timeSpent = req.body.time_spent;
    var startTime = req.body.start_time;

    // check if the task exists
    db.one("select * from tasks where id=$1", taskId)
    .then(task => {
        console.log("Task exists");
    })
    .catch(error => {
        res.status(401);
        res.send();
    });

    // update the task
    db.none("update tasks set description=$1, time_spent=$2, start_time=$3 where id=$4", [description, timeSpent, startTime, taskId])
    .then(() => {
        console.log("Task updated");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error updating task", error);
        res.status(500);
        res.send();
    });
});

// delete a task
router.delete('/tasks/:id', function(req, res, next) {
    var taskId = req.params.id;

    // check if the task exists
    db.one("select * from tasks where id=$1", taskId)
    .then(task => {
        console.log("Task exists");
    })
    .catch(error => {
        res.status(404);
        res.send();
    });

    // delete the task
    db.none("delete from tasks where id=$1", taskId)
    .then(() => {
        console.log("Task deleted");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error deleting task", error);
        res.status(500);
        res.send();
    });
});

module.exports = router;