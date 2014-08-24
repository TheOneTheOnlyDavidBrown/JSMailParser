
;var MailParser = (function(){
  "use strict";

  var me = {};

  /**
   * Initalizes function settings
   * @param {Object} userParams
   */
  me.init=function(userParams){
    var defaultParams = {
      outputSelector:"",
      outputItemClass:"item"
    };
    this.settings = $.extend({}, defaultParams, userParams);
    this.acceptableFields = ['Delivered-To','Received','X-Received','Return-Path','Received-SPF',
      'Authentication-Results','From', 'To', 'Subject','Thread-topic','Thread-Index','Date','Message-ID',
      'Accept-Language', 'Content-Language', 'X-MS-Has-Attach', 'X-MS-TNEF-Correlator', 'x-originating-ip',
      'Content-Type','MIME-Version','Content-ID', 'Content-Transfer-Encoding','Content-Description', 'Content-Disposition'];
  },

  /**
   * Sets mail object and calls the parser
   * @param {String} mailObject The text value of the email message 
   * @return {this} this To allow chaining
   */
  me.setMailObject=function(mailObject){
    this.mailObject = mailObject.trim().replace(/(\r\n |\n |\r | \ )/gm," ").replace(/ +(?= )/g,'');
    this.parseMailObject();
    return this;
  },

  /**
   * Handles the parsing of the mail object
   */
  me.parseMailObject=function(){
    this.parsedMailObject = [];

    var splitIndex,
      self =this,
      keyName,
      temp;

    //splits mailObject into lines
    $.each(this.mailObject.split("\n"),function (k,v) {
      splitIndex = v.indexOf(" ");

      //if it is a new key that is in the acceptableFields list. Avoids misinterpreting the message body for a key
      if (v[splitIndex-1]===":" && $.grep(self.acceptableFields, function(e){ return e == v.slice(0,splitIndex-1) }).length>0) {
        //is new field
        
        keyName = v.slice(0,splitIndex-1);
        temp={};
        temp['name'] = keyName;
        temp['values'] = [v.substr(splitIndex+1)];

        self.parsedMailObject.push(temp);
      }
      else if(v.slice(0,3)==='--_'){
        // ignores non-human readible lines
      }
      else{
        //add to current field
        if (v.substring(v.length-1) == "="){
          v = v.substring(0, v.length-1);
        }
        self.parsedMailObject[self.parsedMailObject.length-1].values.push(v);
      }
    });
  },

  /**
   * Finds the queried header and calls output to display it
   * @param {String} headerName The field you want to display 
   * @return {this} this To allow chaining
   */
  me.get=function(headerName){
    var results = [],
      self = this,
      type,
      values;

    if (headerName==='MessageHtml' || headerName==='MessagePlain') {

      if (headerName==='MessageHtml') {
        type='text/html';
      }
      else{
        type="text/plain"
      }
      //other types could go here

      results = $.grep(this.parsedMailObject, function(e,i){
        // Finds 'Content-Type within 5 before to test if it is plain or html
        // The reason for traversing back-wards is because grep is returning
        // a single element (in this case the message text) and it makes more
        // since to traverse back than to try to return a future object
        for (var offset = 1 ; offset < 5; offset++) {
          if (self.parsedMailObject[i-offset] && self.parsedMailObject[i].name === 'Content-Transfer-Encoding') {
            if (self.parsedMailObject[i-offset].name === 'Content-Type' && self.parsedMailObject[i-offset].values[0].indexOf(type)===0) {
              return true
            }
          }
          else{
            return false;
          }
        }
      });
    }
    else{
      //non-custom field names
      results = $.grep(this.parsedMailObject, function(e){ return e.name == headerName; });
    }

    values = '';

    // puts all the values into one string
    $.each(results,function(key,value){
      $.each(value.values,function(k,v){
        values += v;
      });
    });
    
    this.output(headerName,values);
    return this;
  },

  /**
   * Displays the key/value of the queried field
   * @param {String} key The queried field
   * @param {String} value The value for the field queried
   */
  me.output=function(key,value){
    if (this.settings.outputSelector==='') {
      alert('You must set the outputSelector when you run init()!');
      return;
    }

    var outputItem = "<span class='"+this.settings.outputItemClass+"'>"+key+": </span>"+
      "<span class='"+this.settings.outputItemClass+"'>"+value+"</span><br/>";
    $(this.settings.outputSelector).append(outputItem);
  },

  /**
   * Displays the key/value of the queried field
   * @param {String} key The queried field
   * @param {String} value The value for the field queried
   */
  me.clearOutput=function(key,value){
    $(this.settings.outputSelector).html('');
  }

  return me;
}());