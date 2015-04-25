/**
 * Created by dom on 25/04/15.
 */



function Transport(pEndPoint)
{
  var socket = io(pEndPoint);

  this.loadDayData = function (pDayId){
    socket.emit('load', pDayId);
  };

  this.saveDayData = function (pDayData, pSelectedDay){
    socket.emit('save', pDayData, pSelectedDay);
  };

  this.setIncomingDataHandler = function(pHandler){
    socket.on('data', pHandler);
  };

  return this;
};







