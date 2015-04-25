var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


server.listen(8000, function () {
  console.log('Server listening...');
});

// Routing
app.use(express.static(__dirname + '/src'));
app.use('/deps', express.static('bower_components'));


var locallydb = require('locallydb');
var db = new locallydb('./timedb');
var timesheet = db.collection('timesheet');


io.on('connection', function (socket)
{

  socket.on('load', function (pDay)
  {
    var timeSheetRecord = timesheet.where("@day == " + pDay);


    timeSheetRecord.items.sort(function(a, b){
      return (a.id - b.id);
    });

    socket.emit('data', timeSheetRecord.items);
  });

  socket.on('save', function (pTimeRecord, pDay )
  {
    pTimeRecord.day = pDay;
    var timeSheetRecord = timesheet.where("@id == " + pTimeRecord.id);
    if( timeSheetRecord.length() == 0 ) {
      timesheet.insert(pTimeRecord);
    }
    else{
      timesheet.remove(timeSheetRecord.items[0].cid);
      timesheet.insert(pTimeRecord);
    }
  });

});
