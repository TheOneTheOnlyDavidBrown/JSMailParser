;$(function(){
  var mailParser = MailParser;

  MailParser.init({
    outputSelector: '#parsed-output'
  });

  $('#parse').on('click',function(){
    MailParser.clearOutput();
    MailParser.setMailObject($('#email-input').val());
    // can be chained
    MailParser.get('To').get('From');
    // or individually called
    MailParser.get('Date');
    MailParser.get('MessageHtml');
    MailParser.get('MessagePlain');
    MailParser.get('Received');
  });
});