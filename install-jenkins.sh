#!/bin/bash

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Java Development Kit (JDK)
sudo apt install -y openjdk-11-jdk
java -version

# Add Jenkins repository key and source list
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# Update system packages again after adding repository
sudo apt update

# Install Jenkins
sudo apt install -y jenkins

# Start Jenkins service
sudo systemctl start jenkins

# Enable Jenkins service to start on system boot
sudo systemctl enable jenkins

sudo systemctl status jenkins

sudo ufw allow OpenSSH 

sudo ufw enable

sudo ufw allow 8080

sudo ufw status


# Print initial Jenkins administrator password
echo "Jenkins initial administrator password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword