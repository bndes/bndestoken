## Requirements

| Component        |    Minimum version     |
| ---------------- | ---------------------  |
| NODE             |      6.10.1 or greater |
| NPM              |     3.10.10 or greater |


## Installation Guide - PRD

Assure that config/config.json.PRD is correctly filled. 

Create a dockerfile with node and npm and follow the steps below.

1. Rename the file "config/config.json.PRD" to "config/config.json"

2. Create the volume "control", "data" e "log" to be linked to an external volume (outside container).

3. Execute npm install

4. Configure the running of the docker image to fire "npm start".

----

Execute the following steps to prepare the env (if not prepared):

1. Create the directories and assign permissions 
* mkdir -p /opt/docker/volumes/trubudget/
* mkdir -p /opt/docker/volumes/trubudget/control 
* mkdir -p /opt/docker/volumes/trubudget/log 
* mkdir -p /opt/docker/volumes/trubudget/data 


2. Create a file .env defining 

    TRUW001A_SAP_USER – SAP service user <br>
    TRUW001A_SAP_PASS – Password of SAP service user <br>
    TRUW001A_TRU_USER - Trubudget service user <br>
    TRUW001A_TRU_PASS – Password of Trubudget service user

3. Assign the necessary permissions.

------

Execute the following steps using docker-compose.yml:

1. Reference all the env variables (see definition before)

2. Link the volumes to folders located outside the container. 
The volume "control" needs to be linked to a folder with daily backup. The volumes "data" and "log" do not need daily backup.

3. If you are running in DSV, you need to execute a command to replace config.json with config.json.DEV. Similar comments to other envs. 

4. Execute npm start



## Execution Guide

In DSV:
* cd /opt/docker/composers/trubudget
* Check if it is necessary to change docker-compose.yml. Analyze mainly the image name.
* docker pull image-name
* docker-compose up

In PRD:

