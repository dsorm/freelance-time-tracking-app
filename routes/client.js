var express = require('express');
var router = express.Router();
var db = require('../db');

// add a client
router.post('/clients', function(req, res, next) {
    // read the Client's name from the request
    var clientName = req.body.name;

    // save the client to the database
    db.none("insert into clients(client_name) values($1)", clientName)
    .then(() => {
        console.log("Client added");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error adding client", error);
        res.status(500);
        res.send();
    });
});

// list clients
router.get('/clients', function(req, res, next) {
    db.any("select * from clients")
    .then(clients => {
        res.status(200);
        res.send(clients);
    })
    .catch(error => {
        console.log("Error getting clients", error);
        res.status(404);
        res.send();
    });
});

// get a client
router.get('/clients/:id', function(req, res, next) {
    var clientId = req.params.id;

    db.one("select * from clients where id=$1", clientId)
    .then(client => {
        res.status(200);
        res.send(client);
    })
    .catch(error => {
        console.log("Error getting client", error);
        res.status(404);
        res.send();
    });
});

// delete a client
router.delete('/clients/:id', function(req, res, next) {
    var clientId = req.params.id;

    db.result("delete from clients where id=$1", clientId)
    .then(result => {
        if (result.rowCount === 0) {
            console.log("Client not found");
            res.status(404);
            res.send();
            return;
        }
        console.log("Client deleted");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error deleting client", error);
        res.status(500);
        res.send();
    });
});

// update a client
router.put('/clients/:id', function(req, res, next) {
    var clientId = req.params.id;
    var clientName = req.body.name;

    // check if the client exists
    db.one("select * from clients where id=$1", clientId)
    .then(client => {
        console.log("Client exists");
    })
    .catch(error => {
        res.status(404);
        res.send();
    });

    // update the client
    db.none("update clients set client_name=$1 where id=$2", [clientName, clientId])
    .then(() => {
        console.log("Client updated");
        res.status(200);
        res.send();
    })
    .catch(error => {
        console.log("Error updating client", error);
        res.status(500);
        res.send();
    });
});

module.exports = router;