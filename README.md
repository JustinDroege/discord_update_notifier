# typescript_template

## Description

This is just a basic template which you can use to begin instantly with typescript without to consider the setup.
This template provide following:
 - Unittests with jest
 - Eslint(Linter)
 - Dockerfile to create a docker image
 
 ## Installation
 
 You just need node and npm(https://nodejs.org/en/). Open a terminal from the root directory from the project and enter this command:
 ```bash
 npm install
 ```
 
 After this is done, your project is ready to go
 
 ## How to use
 
 ### Scripts
 There a some basic scripts you can use:
 
 - Build the project
 ```bash
 npm run build
 ```
 - Run the linter
 ```bash
 npm run lint
 ```
 - Run the application
 ```bash
 npm run run
 ```
 - Run the test environment
 ```bash
 npm run test
 ```
 ### Docker
 
 You can also build the project as a docker image. If you want to this, you could just enter this in the terminal from the root dir:
 ```bash
 docker build .
 ```
 
 Consider that the tag is generated. If you dont want this, you can also use the flag **-t** to create a own tag
