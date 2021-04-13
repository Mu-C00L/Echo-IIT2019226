const app = require('./app');
const http = require('http');

const port = process.env.PORT || 4200;

const server = http.createServer(app);
server.listen(port,function(){
  console.log("Server is running on port 4200...API");
});
//Run at nodemon server.js or npm start
