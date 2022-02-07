import { Injectable, LoggerService } from '@nestjs/common';
const winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: `backend.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

@Injectable()
export class LoggingService {
  private _logger;
  constructor() {
      try {
          
    this._logger = new winston.createLogger({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.simple()),
      transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console),
      ],
      exitOnError: false, // do not exit on handled exceptions
    });
    } catch (err) {
        console.error('bad log written:', err);
    }
    console.log('LoggingService ---- logger saved as ', this._logger)
  }
  /**
   * Write a 'log' level log.
   */
  public log(message: any, ...optionalParams: any[]) {
    this._logger.log('info', message, ...optionalParams);
  }
  
  /**
   * write an 'info' level log
   */
   public info(message: any, ...optionalParams: any[]) {
       return this.log(message, ...optionalParams);
   }

  /**
   * Write an 'error' level log.
   */
  public error(message: any, ...optionalParams: any[]) {
     this._logger.error(message, ...optionalParams);
  }

  /**
   * Write a 'warn' level log.
   */
  public warn(message: any, ...optionalParams: any[]) {
    this._logger.warn(message, ...optionalParams);
  }

  /**
   * Write a 'debug' level log.
   */
  public debug?(message: any, ...optionalParams: any[]) {
    this._logger.debug(message, ...optionalParams);
  }

  /**
   * Write a 'verbose' level log.
   */
  public verbose?(message: any, ...optionalParams: any[]) {
    this._logger.info(message, ...optionalParams);
  }
}
