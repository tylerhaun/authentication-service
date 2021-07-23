const Transport = require('winston-transport');
const winston = require("winston")
require('winston-mongodb');


const defaultLevel = "trace";


class CustomConsoleTransport extends Transport {
  constructor(opts) {
    super(opts);
    }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    const message = info[Symbol.for("message")];
    console.log(message);
    callback();
  }
};


const winstonMongoMetadataFormat = winston.format((info, opts) => {
  console.log("winstonMongoMetadataFormat()", info);
  try {
    info[Symbol.for("metadata")] = JSON.parse(JSON.stringify(info));
    return info;
  }
  catch(e) {
    console.error(e);
    return info;
  }
})


const mongoOptions = {
  db: "mongodb://localhost:27017/authentication-service",
  metaKey: Symbol.for("metadata"),
  level: defaultLevel,
  //metaKey: Symbol.for("message"),
  //metaKey: "metadata",
};
const mongoTransport = new winston.transports.MongoDB(mongoOptions)
console.log("mongoTransport", mongoTransport);


const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'black',
    error: 'red',
    warn: 'yellow',
    info: 'grey',
    debug: 'green',
    //trace: 'blue',
    trace: 'magenta'
    //prompt: 'grey',
    //verbose: 'cyan',
    //input: 'grey',
    //silly: 'magenta'
  }
};


winston.addColors(customLevels.colors);


const logger = winston.createLogger({
  level: defaultLevel,
  levels: customLevels.levels,
  //format: winston.format.json(),
  //format: customFormat(),
  format: winston.format.combine(
    winston.format.json(),
    //winston.format.colorize({all: true}),
    winstonMongoMetadataFormat(),
  ),
  defaultMeta: {
    level: defaultLevel,
    service: "authentication-service",
  },
  transports: [
    //new CustomConsoleTransport({}),
    mongoTransport,
  ],
});


module.exports = logger;

