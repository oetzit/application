
# Oetzi Words

### Requirements

- Mysql
- Tomcat 8.5
- Java 8
- Maven
- NodeJS with Npm or Yarn

*Tested with tomacat 8.5.72 NodeJs v14.18.0 Java 1.8.0_241*

### Getting Started

Setup your mysql server and load the sql structure dump with :


    mysql -u a_valid_user -p < oetzi_words.sql  

Setup Apache Tomcat server with:


    curl -LO https://archive.apache.org/dist/tomcat/tomcat-8/v8.5.72/bin/apache-tomcat-8.5.72.tar.gz 
    tar -xvf apache-tomcat-8.5.72.tar.gz


### Run Release

Download relase from github and copy `OetziWords.war` in the webapps folder of your apache tomcat installation.
Run the server with:

    apache-tomcat-8.5.72/bin/startup.sh

Wait ~20 secs and shutdown th server with

    apache-tomcat-8.5.72/bin/shutdown.sh

Now edit the `config.prop` in `apache-tomcat-8.5.72/webapps/OetziWords/WEB-INF` and write the correct parameters for your installation db host, db user, db password and and path to the image folder. Save the file and restart the server. Done.

Go to `http://localhost:8080/OetziWords/`

#### Attention !!! The mysql server must be started before of the  tomcat server

### Make a release from code

Clone this repo with

    git clone https://github.com/commul/oetzi.git

go to oezti folder `cd oetzi` and make the `war` package with

    mvn package

You will find the war file in the target folder

### Working on the game UI on a separete server

First you need to configure your tomcat in order to accept cross origin connection

Edit the web.xml file in the `apache-tomcat-8.5.72/conf` and add the cors filter adding the lines to the file before the Default session configuration section

    <filter>
	    <filter-name>CorsFilter</filter-name>
	    <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
	    <init-param>
		    <param-name>cors.allowed.origins</param-name>
		    <param-value>*</param-value>
	    </init-param>
    </filter>
    <filter-mapping>
	    <filter-name>CorsFilter</filter-name>
	    <url-pattern>/*</url-pattern>
    </filter-mapping>

Restart your tomcat server


Got to the `oetzi_game` folder in the repository repository clone
and install javascript dependencies with

`yarn install` or `npm install`

Change line 63/64 of main.js file in src/js folder by switching the comment.
This operation permits the ui to call the backend at `http://localhost:8080/oetzi_words/` instead of to the relative path.

Run the game ui with

`yarn run start` or `npm run start`

Now the game runs at `http://localhost:1234`

### Update the webapp ui

If you want to update the game ui in the tomcat backend switch again the comment on line 63/64 and run

`yarn run deploy` or `npm run deploy`

Make new web archive with `mvn packge` in the root folder of the repository and copy the new `war` file in the webapps folder of tomcat, wait the refresh the url `http://localhost:8080/OetziWords/`

### Repository content
- oetzi_game folder (game ui code)
- oetzi_words_image folder (sample set of images)
- OetziWordsSupportData.tar.gz file (file containing sprites, images used in game development)
- oetzi_words.sql file (dump of the database structure)
- src folder (code of the tomcat web application)
- pom.xml (maven project definition file)