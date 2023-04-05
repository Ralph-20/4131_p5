const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const port = 9001;
http.createServer(function(req, res) {
  var q = url.parse(req.url, true);
  console.log(q)
  if (q.pathname === '/') {
    indexPage(req, res);
  }
  else if (q.pathname === '/index.html') {
    indexPage(req, res);
  }
  else if (q.pathname === '/schedule.html') {
    schedulePage(req, res);
  }
  else if (q.pathname === '/getSchedule') {
    var day = q.query.day;
    getSchedule(req,res,day);
  }

  else if (q.pathname === '/postEventEntry') {
    var body = '';
    // server starts receiving the form data
    req.on('data', function(data) {
      body += data;
    }); // server has recieved all the form data
    req.on('end', function() {
      var post = qs.parse(body);
      var name = post.name;
      var day = post.day;
      var event = post.event;
      var start = post.start;
      var end = post.end;
      var location = post.location;
      var info = post.info;
      var url = post.url;

      // storing a JSON object
      var jsonObj = {};
      jsonObj.name = name;
      jsonObj.day = day;
      jsonObj.event = event;
      jsonObj.start = start;
      jsonObj.end = end;
      jsonObj.location = location;
      jsonObj.info = info;
      jsonObj.url = url;

      // check adding event to json server code
      
      fs.readFile('client/schedule.html', (err, html) => {
        if (err) {
          throw err;
        }
        var scheduleObj = JSON.parse(html);
        // var dayEvents = scheduleObj[day];
        // dayEvents.push(event);


        // need to sort the events by start time


        scheduleObj[day].push(jsonObj);
        fs.writeFile('client/schedule.html', JSON.stringify(scheduleObj), (err) => {
          if (err) {
            throw err;
          }
          res.statusCode = 200; // may want to change this to 302 to /schedule.html
          res.setHeader('Content-type', 'text/html');
          res.write(html);
          res.end();
        });
      });
    });
  }


  else if (q.pathname === '/addEvent.html') {
    addEventPage(req, res);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end("404 Not Found");
  }
}).listen(port);


function indexPage(req, res) {
  fs.readFile('client/index.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}


function getSchedule(req, res, day) {
  fs.readFile('schedule.json', (err, json) => {
    if (err) {
      throw err;
    }
    var scheduleObj = JSON.parse(json);
    var dayEvents = scheduleObj[day];
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(dayEvents));
    res.end();
  });
}


// function getSchedule(req, res, day) {
//   fs.readFile('schedule.json', (err, json) => {
//     if (err) {
//       throw err;
//     }
//     var dayEvents = json[day];
    
//     console.log(dayEvents);
//     res.statusCode = 200;
//     res.setHeader('Content-type', 'application/json');
//     res.write(dayEvents);
//     res.end();
//   });
// }



function schedulePage(req, res) {
  fs.readFile('client/schedule.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}


function addEventPage(req, res) {
  fs.readFile('client/addEvent.html', (err, html) => {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
}
