/**
 * Created by dom on 25/04/15.
 */


function UI(pTransport)
{
  var treedata = [
    {
      id: "days", value: "Wochentage",
      data: [
        { id: "1", value: "Montag" },
        { id: "2", value: "Dienstag" },
        { id: "3", value: "Mittwoch" },
        { id: "4", value: "Donnerstag" },
        { id: "5", value: "Freitag" },
        { id: "6", value: "Samstag" },
        { id: "7", value: "Sonntag" }
      ]
    }
  ];


  webix.ui(
    {
      rows:[
        { type:"header", template:"Sera Schule Alarm System" },
        {
          view:"toolbar",
          id:"myToolbar",
          cols:[
            { view:"button", id:"addNewRecord", value:"Neuer Zeit-Eintrag", width:300, align:"left", click:function(){addEmptyRecord();} }
            //,{ view:"button", id:"stopSound", value:"Alarm stummschalten", width:300, align:"left", click:function(){deactivateSound();} }
            ]
        },
        { cols:[
          { view:"tree", id:'daytree', data:treedata, gravity:0.2, select:true, minHeight:500, width:300 },
          { view:"resizer" },
          {
            view:"datatable",
            id: "timetable",
            columns:[
              { id:"id",		                  header:"",   		     width:1, hidden: true},
              { id:"from",	        editor:"text",		header:"Von", width:300},
              { id:"to",	        editor:"text",		header:"Bis", width:300},
              { id:"active",		editor:"checkbox",		header:"Aktiviert", width:100}
            ],
            editable:true,
            autoheight:true,
            autowidth: true,
            gravity:0.8,
            data: [],
            select: "row"
          }
        ]}
      ]
    });


  function isEmptyResult(pResult){
    return !pResult || pResult.length==0;
  }

  function getTimeTable(pAccessor){
    return pAccessor ? $$("timetable")[pAccessor] : $$("timetable");
  }

  function getDayTree(pAccessor){
    return pAccessor ? $$("daytree")[pAccessor] : $$("daytree");
  }

  function getTableData(){
    return getTimeTable('data').serialize();
  }

  function getSelectedDayId(){
    return getDayTree().getSelectedId();
  }

  function getSelectedDayName(id){
    return getDayTree().getItem(id).value;
  }

  function clearTimeTable(){
    getTimeTable('data').clearAll();
  }

  function addEmptyRecord(){
    addRecord({from:'', to:'', active:true});
  }

  function deactivateSound(){
    pTransport.stopSound();
  }

  function addRecord(pRecord){
    getTimeTable('data').add(pRecord);
  }

  function showMessage(pMessage){
    webix.message(pMessage);
  }

  function getCurrentDate(){
    var day = (new Date()).getDay();
    return day == 0 ? 7 : day;
  }

  function adjestSelectedDate(pSelectedDay){
    return pSelectedDay == 7 ? 0 : pSelectedDay;
  }


  function handleIncomingData(pResponse)
  {
    if(isEmptyResult(pResponse)){
      addEmptyRecord();
    }
    else{
      pResponse.forEach(function (pRow) {
        addRecord(pRow);
      });
    }
  }


  this.init = function()
  {
    getDayTree().attachEvent("onAfterSelect", function (selectedDayId) {
      clearTimeTable();
      pTransport.loadDayData(adjestSelectedDate(+selectedDayId));
    });

    getTimeTable().attachEvent("onDataUpdate", function(id, pDayData)
    {
      if(pDayData.from && pDayData.to) {
        var selectedDayId = getSelectedDayId();
        showMessage("Sie haben gerade die Zeituhr geändert! Die Änderungen werden gespeichert...<br><br><b>" +
        getSelectedDayName(selectedDayId) + ":</b>" + pDayData.from + " - " + pDayData.to);
        pTransport.saveDayData(pDayData, adjestSelectedDate(+selectedDayId));
        return true;
      }
      return false;
    });


    pTransport.setIncomingDataHandler(handleIncomingData);

    getDayTree().openAll();
    getDayTree().select(getCurrentDate());
  }
};
