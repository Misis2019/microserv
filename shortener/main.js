const express = require('express');
const app = express();
var request = require("request");
app.use(express.json());

/*Morgan library is a middleware for logging request and responses see more on 
https://www.npmjs.com/package/morgan
*/
const morgan = require('morgan');
app.use(morgan('combined'));

/*Allowing across origin request is not necessary a gateway*/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });

/*
Jaeger-client for the tracer system.
See more on: https://github.com/jaegertracing/jaeger-client-node
*/
  var initJaegerTracer = require("jaeger-client").initTracer;
    function initTracer(serviceName) {
    var config = {
    serviceName: serviceName,
    sampler: {
        type: "const",
        param: 1,
    },
    reporter: {
        logSpans: true,
        agentHost: 'localhost'
    },
    };
    var options = {
    logger: {
        info: function logInfo(msg) {
        console.log("Inf", msg);
        },
        error: function logError(msg) {
        console.log("Err", msg);
        },
    },
    };
    return initJaegerTracer(config, options);
}
const opentracing = require("opentracing");
const tracer = initTracer("Shortener_Key");
/* 
    Route: '/'
    Response:  Text to check if the server is running
*/

  app.get("/",(req,res)=>{
    res.send('Mc 2 is up');
})


/* 
    Route: '/short'
    Response:  Object of link shortened. Example: {"result_url":"https:\\/\\/goolnk.com\\/KDvQwE"}

*/
app.post("/short", (req, res)=>{
    const span = tracer.startSpan("Post request; route (/short)");
    console.log(req.body.url);
    var urlToShort =  req.body.url;
    var options = {
        method: 'POST',
        url: 'https://url-shortener-service.p.rapidapi.com/shorten',
        headers: {
        'x-rapidapi-host': 'url-shortener-service.p.rapidapi.com',
        'x-rapidapi-key': 'fb37b763a7mshc50162ebfa2d00bp1d47b1jsn0990b8b2664c',
        'content-type': 'application/x-www-form-urlencoded'
        },
        form: {url: urlToShort}
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        res.send(body);
        span.finish();
    })
})

app.listen(3000, ()=>{
    console.log("Server listening on port 3000");
})