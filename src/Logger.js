const Transport = require('winston-transport');
const winston = require("winston")


class CustomConsoleTransport extends Transport {
  constructor(opts) {
    super(opts);
    }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    //console.log(JSON.stringify(info));
    console.log(info[Symbol.for("message")]);
    callback();
  }
};
      

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {
    level: "info",
    service: "authentication-service",
  },
  transports: [
    //new winston.transports.Console({
    //  format: winston.format.simple(),
    //})
    new CustomConsoleTransport({
      //format: winston.format.simple(),
    })
  ],
});

module.exports = logger;
