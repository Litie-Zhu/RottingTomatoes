/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.


var http = require('http');

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.3a4a63de-9189-4007-986b-9171115d8991") {
             context.fail("Invalid Application ID");
         }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
            ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
            ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
            ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    console.log("Processing intent - " + intentName)
    // Dispatch to your skill's intent handlers
    if ("GetRating" === intentName) {
        getMovieRating(intent, session, callback);
    } else if ("getSummary" === intentName) {
        getMovieSummary(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
            ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to Rotting Tomatoes! " +
            "Which movie do you want to know more about?"
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me the name of the movie by saying, " +
            "Tell me about Batman Begins or I want to know about Batman Begins.";
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Gets the rating for the given movie.
 */
function getMovieRating(intent, session, callback) {
    var cardTitle = intent.name;
    var movieNameSlot = intent.slots.MovieName;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (movieNameSlot) {
        var movieName = movieNameSlot.value;
        if(session.attributes) {
            movieRating = session.attributes.movieRating;
        } else {
            sessionAttributes = setMovieInfoInSession(movieName);
            movieRating = sessionAttributes.movieRating;
        }

        console.log("Retrieving movie rating for " + movieName)
        sessionAttributes = setMovieInfoInSession(movieName, session);
        speechOutput = "The Rotten Tomatoes rating for the movie " + movieName + " is " + movieRating;
        //repromptText = "You can ask me your favorite color by saying, what's my favorite color?";
    } else {
        console.log("MovieName slot was null")
        speechOutput = "I'm not sure what movie that is.";
        repromptText = "Please tell me the name of the movie by saying, " +
            "Tell me about Batman Begins or I want to know about Batman Begins.";
    }

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Gets the summary for the given movie.
 */
function getMovieSummary(intent, session, callback) {
    var cardTitle = intent.name;
    var movieNameSlot = intent.slots.MovieName;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (movieNameSlot) {
        var movieName = movieNameSlot.value;
        console.log("Retrieving movie summary for " + movieName)
        var movieSummary = "";
        if(session.attributes) {
            movieSummary = session.attributes.movieSummary;
        } else {
            sessionAttributes = setMovieInfoInSession(movieName);
            movieSummary = sessionAttributes.movieSummary;
        }
        
        if (movieSummary) {
            speechOutput = "The Rotten Tomatoes summary for the movie " + movieName + " is " + movieSummary;
            // repromptText = "You can ask me more questions";
        } else {
            console.log("Movie summary was null.")
            speechOutput = "I'm not sure what the summary for that movie is.";
            repromptText = "Please provide a valid move name";
        }
    } else {
        console.log("MovieName slot was null")
        speechOutput = "I'm not sure what movie that is.";
        repromptText = "Please tell me the name of the movie by saying, " +
            "Tell me about Batman Begins or I want to know about Batman Begins.";
    }

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function setMovieInfoInSession(movieName, session, callback) {
    //TODO: Make the call to the Rotten Tomatoes API here. 

    // Commenting this until the Rotten Tomatoes account is activated.
    var rottenTomatoHost = 'http://api.rottentomatoes.com';
    var apiPath = '/api/public/v1.0/movies.json';
    var apiKey = "4jxkk59ecyrehyr34qs7ardb";
    var uriEncodedMovieName = encodeURIComponent(movieName);
    var apiQuery = "?apikey="+apiKey+"&q="+uriEncodedMovieName +"&page_limit=1";
    var option = {
        hostname = rottenTomatoHost,
        path = apiPath+apiQuery,
        method = "GET"
    };
    
    var req = http.request(option, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            body += chunk;
        });
    
        res.on('end', function(){
            var json= JSON.parse(body);
            console.log("Got a response from Rotten Tomato: ", json);
            session.attributes = json;
            callback();
        });
        
    })
    
    req.on('error', function(e){
          console.log("Got an error: ", e);
    }); 

    req.end();
    
    return {
        movieName: movieName,
        movieRating: "8.4",
        movieSummary: "This is a excellent movie! Go Watch it!"
    };
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}