# A Simple School Alarm System

### Installation
The folowing git clone creates a directory with the name "seralarm" and copy all files from github
```shell
git clone git://github.com/domch/seralarm
npm install
```

### NPM Installation Problems
If you encouner a problem with installing lame or speaker, you can simply install them with following shell commands.
```shell
sudo apt-get install libasound2-dev
sudo npm install --unsafe-perm -g speaker
sudo npm install --unsafe-perm -g lame
```

### Run the Application
The application run on the port 8000. There are two servers up an running: Express (for static assets) and Socket.io.
```shell
node server.js
```
