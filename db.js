var postgresConfig = require('./config');

// database setup
const pgp = require('pg-promise')(/* options */)
const db = pgp(postgresConfig)

sqlStart = `
create table if not exists clients
(
    id          serial primary key,
    client_name varchar
);

create table if not exists projects
(
    id        serial primary key,
    client_id integer
        constraint projects_clients_id_fk
            references clients,
    name varchar
);

create table if not exists tasks
(
    id          serial primary key,
    project_id  integer not null
        constraint tasks_projects_id_fk
            references projects
            on delete cascade,
    description varchar not null,
    time_spent  integer,
    start_time  timestamp
);

comment on column tasks.time_spent is 'In minutes';
`
db.none(sqlStart)
    .then(() => {
        console.log("SQL tables exist or have been created.")
    })
    .catch((error) => {
        console.log("Error creating tables", error)
    })

module.exports = db;