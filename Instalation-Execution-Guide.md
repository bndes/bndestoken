## Requirements

| Component        |    Minimum version     |
| ---------------- | ---------------------  |
| NODE             |      6.10.1 or greater |
| NPM              |     3.10.10 or greater |


## Installation Guide - PRD BACKEND

Assure that BACK/config_PRD.json is correctly filled. 

Create a dockerfile with node and npm and follow the steps below.

1. Create a destination folder called rootfs

2. Copy the content of Infra/rootfs-template to rootfs

3. Copy the content of Back/ to rootfs/app

4. Rename the file "rootfs/app/config_PRD.json" to "rootfs/app/config.json"

5. Execute npm install

6. See existing dockerfile***
- tirar o initonce porque não vale para PRD?
- Install mongodb
??????????? 2. Create the volume "log" and "data" to be linked to an external volume (outside container). - hoje etá no docker-file
??Configure the running of the docker image to fire "npm start"? Como sobe o servidor?

---

AJUSTARRRRRR


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

