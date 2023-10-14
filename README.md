# Onstream Automation

Onstream Automation Repo consists of test scenarios, pages and config files to run automation scripts for all clients like Browser, FireTV and Roku

All the testing related files are under 'testing' folder

## Setup
This setup guide is for the Windows OS

## Pre- Requisites:

Install Android studio - It takes care installing sdk and adb tools. Set the path for sdk and adb in Environment Variables
Install Java 1.8
Install VS Code IDE
Install Node (https://nodejs.org/en/download/)
Install Yarn (npm install --global yarn)
Download chromedriver compatible with your chrome version
Download selenium-server-standalone-3.141.59
Download Appium 1.21.0 for Device Automation

## Setup and Start Scripting:

Clone repo -Dish Onstream Automation

Run "yarn install" from root folder(This will take care of installing all test dependencies)
Change the path to "testing" (cd testing)
Update codecept configuration (Codecept.conf.js file facilitates configuring the helpers, page objects, plugins, test cases path, output folder path, etc.)

Define the helper that has to be called to run on the specific platform
Specify the path to the driver configuration file
Specify the folder from which the test cases has to be executed from
Specify custom helpers (if needed)
Define the Page objects for the pages defined
Configure the plugins on need basis


An example of browser configuration for reference: codecept.browser.conf.js

## Add new testcases

Create a JS file in the following path "testing\testcases"
Add the pre-condition in the Before hook
Define the feature (Ex: Home screen UI verification)
Add Scenario block for every test case

Add all the identified common methods in the base page of the relevant screen ( Ex:testing\pages\OnStreamHomePage\BaseOnStreamHomePage.js)
Inject the respective base pages in the scenarios block
Corresponding Locators will be arranged in the respective base page's folder (Ex: testing\pages\OnStreamHomePage\OnStreamHomePageLocators.json)

## Running Test Scripts

Run Selenium Server & chromedriver ( save both these files in a folder and run below command - java -Dwebdriver.server.session.timeout=86400 -Dwebdriver.chrome.driver=chromedriver.exe -jar selenium-server-standalone-3.141.59.jar
In case of Appium, start Appium server using Appium Desktop application
Change directory to testing
Run command found in package.json as per platform

## Logging

It will log the information to debug console as well as text file
To use it


Declare a logger for each class as below


const logger = require('../utils/LogUtils.js').getLogger("<class-name>");


where <class-name> is the name of class that is using logger, it will add in the log line and we know where the log from.

Logger methods

info() : used for methods that be inside in **_test.js file directly
debug()/warn()/error() : used for rest ones

## Reference links:

codecept.io
https://github.com/codeceptjs/CodeceptJS