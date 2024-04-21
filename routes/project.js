var express = require('express');
var router = express.Router();
var db = require('../db');

// add a project
router.post('/projects', function(req, res, next) {
    // read the project's name from the request
    var projectName = req.body.name;
    var clientId = req.body.client_id;

    // check if the client exists
    db.one("select * from clients where id=$1", clientId)
    .then(client => {
        console.log("Client exists");
    })
    .catch(error => {
        res.status(401);
        res.send();
    });

    // check if the project name is defined
    if (!projectName) {
        res.status(402);
        res.send();
    }

    // save the project to the database
    db.none("insert into projects(name, client_id) values($1, $2)", [projectName, clientId])
    .then(() => {
        console.log("Project added");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error adding project", error);
        res.status(401);
        res.send();
    });
});

// list projects
router.get('/projects', function(req, res, next) {
    db.any("select * from projects")
    .then(projects => {
        res.status(200);
        res.send(projects);
    })
    .catch(error => {
        console.log("Error getting projects", error);
        res.status(404);
        res.send();
    });
});

// get a project
router.get('/projects/:id', function(req, res, next) {
    var projectId = req.params.id;

    db.one("select * from projects where id=$1", projectId)
    .then(project => {
        res.status(200);
        res.send(project);
    })
    .catch(error => {
        console.log("Error getting project", error);
        res.status(404);
        res.send();
    });
});

// delete a project
router.delete('/projects/:id', function(req, res, next) {
    var projectId = req.params.id;

    db.result("delete from projects where id=$1", projectId)
    .then(result => {
        if (result.rowCount === 0) {
            console.log("Project not found");
            res.status(404);
            res.send();
            return;
        }
        console.log("Project deleted");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error deleting project", error);
        res.status(404);
        res.send();
    });
});

// update a project
router.put('/projects/:id', function(req, res, next) {
    var projectId = req.params.id;
    var projectName = req.body.name;
    var clientId = req.body.client_id;

    // check if the project exists
    db.one("select * from projects where id=$1", projectId)
    .then(project => {
        console.log("Project exists");
    })
    .catch(error => {
        res.status(401);
        res.send();
    });

    // check if the client exists
    db.one("select * from clients where id=$1", clientId)
    .then(client => {
        console.log("Client exists");
    })
    .catch(error => {
        res.status(402);
        res.send();
    });

    // update the project
    db.none("update projects set name=$1, client_id=$2 where id=$3", [projectName, clientId, projectId])
    .then(() => {
        console.log("Project updated");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error updating project", error);
        res.status(500);
        res.send();
    });
});

module.exports = router;