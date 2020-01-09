/*Microservice #1 - FrontEnd of the project */
const express = require('express');
const app = express();
const path = require('path');

/*Morgan library for logging request and responses */
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
const tracer = initTracer("Front_Key");
  /* 
    Route: '/'
    Response: html file
  */

app.get(('/'),(req, res)=>{
  const span = tracer.startSpan("Get request; route (/)");
   res.sendFile(path.resolve(__dirname, ".", "files", "index.html"));
   span.finish();
})

/*
Microservice listening on port 3000
*/
app.listen(3000, () =>{
    console.log("Running on port 3000");
})