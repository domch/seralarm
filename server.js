var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

var locallydb = require('locallydb');
var db = new locallydb('./timedb');
var timesheet = db.collection('timesheet');

var schedule = require('node-schedule');

var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');



server.listen(8000, function () {
  console.log('Server listening...');
});

app.use(express.static(__dirname + '/src'));
app.use('/deps', express.static('bower_components'));




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


    var timeSheetRecordsByDay = timesheet.where("@day == " + pDay);
    rescheduleDays(timeSheetRecordsByDay.items, pDay);
  });

});













var schedularStore = {};

function rescheduleDays(pTimeSheetByDay, pDay)
{
  schedularStore[pDay] = schedularStore[pDay] || {};

  resetAllSchedulesByDay(pDay);
  pTimeSheetByDay.forEach(function(pTimeRecord)
  {
    if( pTimeRecord.active )
    {
      var timeInfo = extractTimeInfo(pTimeRecord.to);
      var rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = pDay;
      rule.hour = +timeInfo.hour;
      rule.minute = +timeInfo.minute;

      var newJob = schedule.scheduleJob(rule, function () {
        playAudio();
      });

      schedularStore[pDay][pTimeRecord.id] = newJob;
    }
  });
}

function extractTimeInfo(pTimeString){
  var timeParts = pTimeString.split(":");
  return {hour: timeParts[0], minute:timeParts[1]}
}

function resetAllSchedulesByDay(pDay){
  for(var key in schedularStore[pDay]){
    var pJob =  schedularStore[pDay][key];
    pJob.cancel();
    delete schedularStore[pDay][key];
  }
}

function playAudio()
{
  fs.createReadStream('./sound/sound.mp3')
    .pipe(new lame.Decoder())
    .on('format', function (format) {
      this.pipe(new Speaker(format));
    });
}
