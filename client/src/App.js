import './App.css';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {start} from "http-errors";

var endpoint = 'http://localhost:3000'; // replace with your API URL

function App() {
    // Modal states
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [clientsModalOpen, setClientsModalOpen] = useState(false)
    const [projectsModalOpen, setProjectsModalOpen] = useState(false)
    const [activityReportModalOpen, setActivityReportModalOpen] = useState(false)

    // Backend data/inputs for operations
    const [clientProjectList, setClientProjectList] = useState([]);
    const [clientList, setClientList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [taskDescription, setTaskDescription] = useState('');
    const [newProjectClientId, setNewProjectClientId] = useState(null);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [activityReport, setActivityReport] = useState([]);
    const [activityReportDateRange, setActivityReportDateRange] = useState("");

    // Frontend helpers
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [newClientName, setNewClientName] = useState('');
    const [dataChangeTrigger, triggerDataChange] = useState(0);
    const selectedClient = clientList[selectedClientId];
    const selectedProject = clientProjectList[selectedProjectId];
    const [activityReportGenerated, setActivityReportGenerated] = useState(false);

    const endpoint = 'http://localhost:3000'; // replace with your API URL

    const handleProjectChange = (event) => {
        setSelectedProjectId(event.target.value);
    };

    const handleClientChange = (event) => {
        setSelectedClientId(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setTaskDescription(event.target.value);
    };

    const handleNewClientName = (event) => {
        setNewClientName(event.target.value);
    }

    const handleDateFrom = (event) => {
        setDateFrom(event.target.value)
    }

    const handleDateTo = (event) => {
        setDateTo(event.target.value)
    }

    const handleClientNameChange = async () => {
        const newName = window.prompt('Enter new client name');
        if (!newName) {
            return;
        }

        const response = await fetch(endpoint + `/clients/${selectedClient.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName,
            }),
        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            alert('Client name updated');
            triggerDataChange(dataChangeTrigger + 1);
        } else {
            alert('Error updating client name');
        }
    }
    const handleClientDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete client "${selectedClient.client_name}"?`)) {
            return;
        }

        const response = await fetch(endpoint + `/clients/${selectedClient.id}`, {
            method: 'DELETE',
        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            alert('Client deleted');
            triggerDataChange(dataChangeTrigger + 1);
        } else {
            alert('Error deleting client');
        }
    }

    const handleNewClient = async () => {
        const response = await fetch(endpoint + '/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newClientName,
            }),
        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            alert('Client created');
            triggerDataChange(dataChangeTrigger + 1);
        } else {
            alert('Error creating client');
        }

    }

    const handleGenerateReport = async () => {
        setActivityReportGenerated(true);
        var dateFromFormat = new Date(dateFrom);
        var dateToFormat = new Date(dateTo);
        dateFromFormat = dateFromFormat.toISOString().split('T')[0];
        dateToFormat = dateToFormat.toISOString().split('T')[0];

        const response = await fetch(endpoint + `/activityreport/${selectedClient.id}/${dateFromFormat}.${dateToFormat}`, {
            method: 'GET',
        });

        const data = await response.json();
        console.log(data);


        if (response.status !== 200) {
            alert('Error generating report');
        } else {

            // convert minutes to MDs (8 hours)
            data.forEach((item) => {
                item.time_spent = item.time_spent / 60.0 / 8;
            });

            // sort by project name
            data.sort((a, b) => {
                if (a.project < b.project) {
                    return -1;
                }
                if (a.project > b.project) {
                    return 1;
                }
                return 0;
            });

            setActivityReport(data);
        }
    }

    const handleProjectNameChange = async () => {
        const newName = window.prompt('Enter new project name');
        if (!newName) {
            return;
        }

        const response = await fetch(endpoint + `/projects/${selectedProject.project_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName,
                client_id: selectedProject.client_id,
            }),
        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            triggerDataChange(dataChangeTrigger + 1);
        } else {
            alert('Error updating project name');
        }
    }

    const handleProjectDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete project "${selectedProject.project_name}"?`)) {
            return;
        }

        const response = await fetch(endpoint + `/projects/${selectedProject.project_id}`, {
            method: 'DELETE',
        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            alert('Project deleted');
            triggerDataChange(dataChangeTrigger + 1);
        } else {
            alert('Error deleting project');
        }
    }

    const handleNewProjectClientChange = (event) => {
        setNewProjectClientId(event.target.value);
    }

    const handleNewProject = async () => {
        const response = await fetch(endpoint + '/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newClientName,
                client_id: newProjectClientId,
            }),
        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            alert('Project created');
            triggerDataChange(dataChangeTrigger + 1);
        } else {
            alert('Error creating project');
        }
    }

    const handleSave = async () => {
        if (Math.floor(elapsedTime / 1000 / 60) < 1) {
            alert('Task must be at least 1 minute long');
            return;
        }
        const response = await fetch(endpoint + '/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
//             body:
//                 `{
//                 "project_id": "${selectedProjectId}",
//                 "description": "${taskDescription}",
//                 "time_spent": "${elapsedTime}",
//                 "start_time": "${startTime}",
// }`
            body: JSON.stringify({
                project_id: selectedProjectId,
                description: taskDescription,
                time_spent: Math.floor(elapsedTime / 1000 / 60), // time_spent is in minutes
                start_time: Math.floor(startTime / 1000),
            }),

        });

        const data = await response;
        console.log(data);
        if (response.status === 200) {
            alert('Task saved');
        } else {
            alert('Error saving task');
        }
    };


    useEffect(() => {
        async function fetchData() {
            try {
                const clientsResponse = await fetch(endpoint+"/clients", {method: "GET", })
                    .then(response => response.json())
                    .catch(error => console.error('Error:', error));
                var clients = await clientsResponse;

                const projectsResponse = await fetch(endpoint+"/projects", {method: "GET"})
                    .then(response => response.json())
                    .catch(error => console.error('Error:', error))
                var projects = await projectsResponse;
            } catch (error) {
                console.error('Error:', error);
            }
            const projectsWithClients = projects.map(project => {
                    const client = clients.find(client => client.id === project.client_id);
                    return {
                        project_id: (project.id || ""),
                        client_id: (project.client_id || ""),
                        name: (client.client_name || "") + ' - ' + project.name,
                        client_name: (client.client_name || ""),
                        project_name: project.name
                    };
            });
            setClientProjectList(projectsWithClients);
            setClientList(clients);
            setProjectList(projects);
            console.log(projectsWithClients);
        }

        fetchData();
    }, [dataChangeTrigger])

    useEffect(() => {
        let interval;
        if (isTracking) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 1000);
        } else if (!isTracking && elapsedTime !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTracking, startTime, elapsedTime]);

    useEffect(() => {
        let dateFromObj = new Date(dateFrom);
        let dateToObj = new Date(dateTo);

        let formattedDateFrom = `${dateFromObj.getDate()}.${dateFromObj.getMonth() + 1}.${dateFromObj.getFullYear()}`;
        let formattedDateTo = `${dateToObj.getDate()}.${dateToObj.getMonth() + 1}.${dateToObj.getFullYear()}`;

        setActivityReportDateRange(`${formattedDateFrom} - ${formattedDateTo}`);
    }, [dateFrom, dateTo]);

    const handleClick = () => {
        if (isTracking) {
            setIsTracking(false);
        } else {
            setIsTracking(true);
            setStartTime(Date.now());
        }
    };

    const formatTime = (time) => {
        const seconds = Math.floor((time / 1000) % 60);
        const minutes = Math.floor((time / (1000 * 60)) % 60);
        const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

  return (
      <div className="App">
          {/** Task modal */}
          <button onClick={() => setTaskModalOpen(true)}>New Task</button>
          <Modal
              isOpen={taskModalOpen}
              onRequestClose={() => setTaskModalOpen(false)}
              contentLabel="Create a new task"
          >
              <div className="modal-header">
                  <h2>New Task</h2>
                  <button className="close-button" onClick={() => setTaskModalOpen(false)}>X</button>
              </div>

              <select onChange={handleProjectChange} value={selectedProjectId}>
                  <option selected disabled value="select"> -- select a project --</option>
                  {clientProjectList.map((item, index) => (
                      <option key={index} value={item.project_id}>
                          {item.name}
                      </option>
                  ))}
              </select><br/>
              <input type="text" placeholder="Task Description" onChange={handleDescriptionChange}></input><br/>
              <button className={`tracking-button ${isTracking ? 'tracking' : ''}`} onClick={handleClick}>
                  {isTracking ? 'Stop' : 'Start'} - {formatTime(elapsedTime)}
              </button>
              <button className="save-button" onClick={handleSave} disabled={isTracking}>Save</button>
          </Modal>

          {/** Clients modal */}
          <br/>
          <button onClick={() => setClientsModalOpen(true)}>Clients</button>

          <Modal
              isOpen={clientsModalOpen}
              onRequestClose={() => setClientsModalOpen(false)}
              contentLabel="Clients"
          >
              <div className="modal-header">
                  <h2>Clients</h2>
                  <button className="close-button" onClick={() => setClientsModalOpen(false)}>X</button>
              </div>
              {/** do the same button as above but for clients instead of projects */}
              <select onChange={handleClientChange} value={selectedClientId}>
                  <option selected disabled value="select"> -- select a client --</option>
                  {clientList.map((item, index) => (
                      <option key={item.id} value={index}>
                          {item.client_name}
                      </option>
                  ))}
              </select><br/>

              {selectedClient &&
                  <div className="client-information">
                      <h3>Client Information</h3>
                      <p>ID: {selectedClient.id}</p>
                      <p>Name: {selectedClient.client_name}</p>
                      <button onClick={handleClientNameChange}>Change Name</button>
                      <button className="delete" onClick={handleClientDelete}>Delete</button>
                  </div>
              }
              <hr/>
              <h3>New client</h3>
              <input type="text" placeholder="Client Name" onChange={handleNewClientName}></input><br/>
              <button onClick={handleNewClient}>Create a new client</button>
          </Modal>
          <br/>

          {/** Projects modal */}
          <button onClick={() => setProjectsModalOpen(true)}>Projects</button>

          <Modal
              isOpen={projectsModalOpen}
              onRequestClose={() => setProjectsModalOpen(false)}
              contentLabel="Clients"
          >
              <div className="modal-header">
                  <h2>Projects</h2>
                  <button className="close-button" onClick={() => setProjectsModalOpen(false)}>X</button>
              </div>
              {/** do the same button as above but for clients instead of projects */}
              <select onChange={handleProjectChange} value={selectedProjectId}>
                  <option selected disabled value="select"> -- select a client --</option>
                  {clientProjectList.map((item, index) => (
                      <option key={item.id} value={index}>
                          {item.name}
                      </option>
                  ))}
              </select><br/>

              {selectedProject &&
                  <div className="client-information">
                      <h3>Project Information</h3>
                      <p>Project ID: {selectedProject.project_id}</p>
                      <p>Client ID: {selectedProject.client_id}</p>
                      <p>Name: {selectedProject.project_name}</p>
                      <p>Client: {selectedProject.client_name}</p>
                      <button onClick={handleProjectNameChange}>Change Name</button>
                      <button className="delete" onClick={handleProjectDelete}>Delete</button>
                  </div>
              }
              <hr/>
              <h3>New project</h3>
              <input type="text" placeholder="Project Name" onChange={handleNewClientName}></input><br/>
              <select onChange={handleNewProjectClientChange} value={newProjectClientId}>
                  <option selected disabled value="select"> -- select a client --</option>
                  {clientList.map((item, index) => (
                      <option key={item.id} value={item.id}>
                          {item.client_name}
                      </option>
                  ))}
              </select><br/>
              <button onClick={handleNewProject}>Create a new project</button>
          </Modal>
          <br/>

          {/** Activity report modal */}
          <button onClick={() => setActivityReportModalOpen(true)}>Activity Report</button>

          <Modal
              isOpen={activityReportModalOpen}
              onRequestClose={() => setActivityReportModalOpen(false)}
              contentLabel="Clients"
          >
              <div className="modal-header">
                  <button className="close-button" onClick={() => setActivityReportModalOpen(false)}>X</button>
              </div>
              <div className="date-container">
                  <div>From <input type="date" className="date-selector" onChange={handleDateFrom}/></div>
                  <div>To <input type="date" className="date-selector" onChange={handleDateTo}/></div>
              </div>

              <select onChange={handleClientChange} value={selectedClientId}>
                  <option selected disabled value="select"> -- select a client --</option>
                  {clientList.map((item, index) => (
                      <option key={item.id} value={index}>
                          {item.client_name}
                      </option>
                  ))}
              </select>
              <button onClick={handleGenerateReport} className="generate-report">Generate Report</button>
              <hr/>
              {activityReportGenerated &&
              <div className="container space-between">
                  <h2>Activity Report</h2>
                  <h3>{selectedClient.client_name}</h3>
              </div>}
              {activityReportDateRange && activityReportGenerated &&
                  <h3>{activityReportDateRange}</h3>}

              {activityReportGenerated &&
                <table>
                    <thead>
                    <tr>
                        <th>Project</th>
                        <th>Task</th>
                        <th>Time Spent</th>
                    </tr>
                    </thead>
                    <tbody>
                    {activityReport.map((item, index) => (
                        <tr key={index}>
                            <td>{item.project}</td>
                            <td>{item.task}</td>
                            <td>{item.time_spent} MDs</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                }

          </Modal>
      </div>
  );
}

export default App;
