var express = require('express');
var router = express.Router();
var db = require('../db');

// create a new activity report
// example usage:
// http://localhost:3000/activityreport/1/1970-01-01.2024-04-21
router.get('/activityreport/:client_id/:start_time.:end_time', function(req, res, next) {
    var clientId = req.params.client_id;
    var startTime = req.params.start_time;
    var endTime = req.params.end_time;

    db.any("select c.client_name as client, p.name as project, t.description as task, t.time_spent, t.start_time from clients c join projects p on c.id = p.client_id join tasks t on p.id = t.project_id where c.id = $1 and t.start_time <= DATE($2) and t.start_time >= DATE($3)", [clientId, endTime, startTime])
    .then(activityReport => {
        res.status(200);
        res.send(activityReport);
    })
    .catch(error => {
        console.log("Error getting activity report", error);
        res.status(500);
        res.send();
    });
});

module.exports = router;