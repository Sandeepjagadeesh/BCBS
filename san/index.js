'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');
//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================
//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
//const APP_ID = undefined;
const WELCOME_MESSAGE = "Welcome to BlueCross Blueshield!";
const SKILL_NAME = 'Bluecross Blueshield of Illinios';
const HELP_MESSAGE = 'We are here to care. Just say what you need!';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const welcome_messages = [
'welcome to blue cross blue shield. We can provide you services like getting co pay, finding my doctor, signing up for auto pay and getting fever help line ',
'Hearty welcome. We are here to care .We can provide you services like getting co pay, finding my doctor, signing up for auto pay and getting fever help line',
'blue cross blue shield is all set for service. We can provide you services like getting co pay, finding my doctor, signing up for auto pay and getting fever help line',
'as blue cross blue shield, we pride ourselves offering our customer responsive, competant and excellent services. We can provide you services like getting co pay, finding my doctor, signing up for auto pay and getting fever help line'
];
const handlers = {
    'LaunchRequest': function () {
        this.emit('getHi');
    },
     'getHi':function(){
       const mywelcome=welcome_messages;
       const Index = Math.floor(Math.random() * mywelcome.length);
        const randomWelcomeMessage = mywelcome[Index];
       if(!this.attributes.userIdentified)
        {
            console.log("User id: "+ this.event.context.System.user.userId);
            console.log("Device id: "+ this.event.context.System.device.deviceId);
            this.attributes.fromIntent = "getHi";
            this.attributes.toIntent = "identifyUser";
            this.emit(this.attributes.toIntent);
        }
        else if (this.attributes.userIdentified === 'yes' && this.attributes.fromIntent === "identifyUser" &&  this.attributes.toIntent === "getHi")
        {
            console.log("Final frontier");
            this.emit(':ask', randomWelcomeMessage);
        }
    },
    'identifyUser': function()
    {
        console.log("I am actually at the bgining of identifyUser");
         // make an http get call to obtain a patient object
         // an http get (to demo-api.vagmi.io/patients) is only necessary when identification is not confirmed for the current session
         if(!this.attributes.userIdentified){
             const url = 'http://demo-api.vagmi.io/patients/5abd277bf200095fcb9b1f54';
            this.attributes.fromIntent = "identifyUser";
            this.attributes.toIntent = "processHttpGet";
            this.emit(this.attributes.toIntent, url);
         }
        // if identify user successful, trigger respective intent functions based on session attr
        if (this.attributes.userIdentified === "yes"  && (this.attributes.fromIntent  === "getHi" || this.attributes.fromIntent  === "processHttpGet") &&  this.attributes.toIntent === "identifyUser" )
        {
            console.log("I am at the bgining of identifyUser");
            this.attributes.fromIntent = "identifyUser";
            this.attributes.toIntent = "getHi";
            console.log("I am at the end of identifyUser");
            this.emit(this.attributes.toIntent);
        }
    },
    'processHttpGet': function (url) {
        request.get(url, (error, response, body) => {
            // let json = JSON.parse(body);
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response); // Print the response status code if a response was received
            console.log('body:', body); // Print the body
            // attribute userIdentified should become yes when we obtain a object properly upon get
            this.attributes.userIdentified = "yes";
            //this.attributes.userName = "Alice";
            var patients=JSON.parse(body);
            this.attributes.patientObject=patients;
            this.attributes.copay=this.attributes.patientObject.plans.co_pay;
            this.attributes.autopay=this.attributes.patientObject.auto_pay;
            console.log("patient co pay  is "+this.attributes.copay);
            console.log("auto pay is "+  this.attributes.autopay);
            this.attributes.fromIntent = "processHttpGet";
            this.attributes.toIntent = "identifyUser";
            this.emit(this.attributes.toIntent);
        });
    },
    'getCoPay': function () {
        const speechOutput = "Your co pay is "+ this.attributes.copay;
        console.log("my co pay is"+ this.attributes.copay);
        const reprompt = HELP_REPROMPT;
        this.emit(':ask',speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'findMyDoctor': function () {
        const speechOutput = "Oh my God, there are 1000 results, you wanna listen in alphabetical order...";
        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'feverHelpLine': function () {
        const speechOutput = "You got fever, everbody gets fever, what's so special?";
        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'autoSignForPay': function () {
        const speechOutput = "You are signed up, You are good to go...";
        console.log("auto pay inside function "+  this.attributes.autopay);
        if(this.attributes.autopay===false)
        {
          this.emit(":ask", "your auto pay is not set up");
        }
        else{
          this.emit(":ask","you auto sign is set up ");
        }
    },
    'Unhandled':function(){
      console.log("question is "+this.event.request.intent.slots.Unhandleds.value);
      this.attributes['myLangauge']=this.event.request.intent.slots.Unhandleds.value;
      console.log("DB question outside else"+  this.attributes['myLangauge']);
      this.emit(':tell',"sorry please ask for the right service");
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
   // alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'questionTables';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
