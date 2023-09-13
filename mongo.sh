#!/bin/bash
sudo apt update
sudo apt install -y mongodb-clients
mongo chatapp --eval 'db.users.insert( { username : "laukik", password : "root" } ); db.users.insert( { username : "laukik", password : "root" } );';