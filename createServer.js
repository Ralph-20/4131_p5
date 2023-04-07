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
      var name = post.event;
      var day = post.day;
      var event = post.event;
      var start = post.start;
      var end = post.end;
      var location = post.location;
      var info = post.info;
      var url = post.url;
      var phone = post.phone;

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
      jsonObj.phone = phone;

      day = day.toLowerCase();

      fileJsonString = fs.readFileSync('schedule.json');
      parsedJson = JSON.parse(fileJsonString);
      console.log(parsedJson);
      console.log(day);
      parsedJson[day].push(jsonObj);

      // sorting the events by start time

      parsedJson[day].sort(function(a, b) {
        var timeA = a.start.split(":");
        var timeB = b.start.split(":");
        var hourA = timeA[0];
        var hourB = timeB[0];
        var minA = timeA[1];
        var minB = timeB[1];
        if (hourA == hourB) {
          return minA - minB;
        }
        return hourA - hourB;
      });


      // converting from military time to normal time

      for (var i = 0; i < parsedJson[day].length; i++) {
        var startTimeMil = parsedJson[day][i].start;
        var endTimeMil = parsedJson[day][i].end;
        var startTime = convertTime(startTimeMil);
        var endTime = convertTime(endTimeMil);


        parsedJson[day][i].start = startTime;
        parsedJson[day][i].end = endTime;
      }


      fileJsonString = JSON.stringify(parsedJson);
      fs.writeFileSync('schedule.json', fileJsonString);
      res.writeHead(302, {
        'Location': 'schedule.html'
      });
      res.end();
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


function convertTime(militaryTime) {
  let timeArray = militaryTime.split(":");
  let hour = parseInt(timeArray[0]);
  let minute = parseInt(timeArray[1]);

  let ampm = "AM";
  if (hour >= 12) {
    ampm = "PM";
    hour -= 12;
  }
  if (hour == 0) {
    hour = 12;
  }

  return hour + ":" + (minute < 10 ? "0" + minute : minute) + " " + ampm;
}


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
