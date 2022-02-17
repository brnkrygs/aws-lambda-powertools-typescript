/**
 * Log level. used for filtering the log
 */
export enum LEVEL {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export type FunctionLog = {
  timestamp: string
  invocationId: string
  logLevel: LEVEL
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  logObject: {[key: string]: any}
};
export class InvocationLogs {
  public static LEVEL = LEVEL;

  /**
   * Array of logs from invocation. 
   * 
   * The first element is START, and the last two elements are END, and REPORT.
   * In each log, each content is separated by '\t'
   *    [
   *      'START RequestId: c6af9ac6-7b61-11e6-9a41-93e812345678 Version: $LATEST',
   *      '2022-01-27T16:04:39.323Z\tc6af9ac6-7b61-11e6-9a41-93e812345678\tINFO\t{"cold_start":true,"function_arn":"arn:aws:lambda:eu-west-1:561912387782:function:loggerMiddyStandardFeatures-c555a2ec-1121-4586-9c04-185ab36ea34c","function_memory_size":128,"function_name":"loggerMiddyStandardFeatures-c555a2ec-1121-4586-9c04-185ab36ea34c","function_request_id":"7f586697-238a-4c3b-9250-a5f057c1119c","level":"INFO","message":"This is an INFO log with some context and persistent key","service":"logger-e2e-testing","timestamp":"2022-01-27T16:04:39.323Z","persistentKey":"works"}',
   *      '2022-01-27T16:04:39.323Z\tc6af9ac6-7b61-11e6-9a41-93e812345678\tINFO\t{"cold_start":true,"function_arn":"arn:aws:lambda:eu-west-1:561912387782:function:loggerMiddyStandardFeatures-c555a2ec-1121-4586-9c04-185ab36ea34c","function_memory_size":128,"function_name":"loggerMiddyStandardFeatures-c555a2ec-1121-4586-9c04-185ab36ea34c","function_request_id":"7f586697-238a-4c3b-9250-a5f057c1119c","level":"INFO","message":"This is an INFO log with some context","service":"logger-e2e-testing","timestamp":"2022-01-27T16:04:39.323Z","persistentKey":"works","additionalKey":"additionalValue"}',
   *      '2022-01-27T16:04:39.323Z\tc6af9ac6-7b61-11e6-9a41-93e812345678\tERROR\t{"cold_start":true,"function_arn":"arn:aws:lambda:eu-west-1:561912387782:function:loggerMiddyStandardFeatures-c555a2ec-1121-4586-9c04-185ab36ea34c","function_memory_size":128,"function_name":"loggerMiddyStandardFeatures-c555a2ec-1121-4586-9c04-185ab36ea34c","function_request_id":"7f586697-238a-4c3b-9250-a5f057c1119c","level":"ERROR","message":"There was an error","service":"logger-e2e-testing","timestamp":"2022-01-27T16:04:39.323Z","persistentKey":"works","error":{"name":"Error","location":"/var/task/index.js:2778","message":"you cannot prevent this","stack":"Error: you cannot prevent this\\n    at testFunction (/var/task/index.js:2778:11)\\n    at runRequest (/var/task/index.js:2314:36)"}}',
   *      'END RequestId: c6af9ac6-7b61-11e6-9a41-93e812345678',
   *      'REPORT RequestId: c6af9ac6-7b61-11e6-9a41-93e812345678\tDuration: 2.16 ms\tBilled Duration: 3 ms\tMemory Size: 128 MB\tMax Memory Used: 57 MB\t',
   *    ]
   * See https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html for details
   */
  private logs: string[]; 

  public constructor(logResult: string) {
    const rawLog = Buffer.from(logResult, 'base64').toString('utf-8').trim();
    this.logs = rawLog.split('\n');
  }

  /**
   * Find all functional logs whether it contains a given key
   * @param key 
   * @param log level to filter
   * @returns 
   */
  public doesAnyFunctionLogsContains(key: string, levelToFilter?: LEVEL): boolean {
    const filteredLogs = this.getFunctionLogs(levelToFilter)
      .filter(log => log.includes(key));
    
    return filteredLogs.length > 0;
  }

  /**
   * Return only logs from function, excude START, END, and REPORT generated by Lambda service
   * @param log level to filter
   * @returns Array of function logs
   */
  public getFunctionLogs(levelToFilter?: LEVEL): string[] {
    let filteredLogs = this.logs.slice(1, -2);

    if (levelToFilter) {
      filteredLogs = filteredLogs.filter(log => log.includes(levelToFilter.toString()));
    } 
    
    return filteredLogs;
  }

  /**
   * Each of log message contains 4 elements, separted by tabs
   * 1. Timestamp (e.g. 2022-01-27T16:04:39.323Z )
   * 2. Invocation id (e.g. tafb6de1a-48f8-4fbb-ad72-23a4f0c2924c)
   * 3. Log level (e.g. INFO)
   * 4. Log object (e.g. {\"cold_start\":true, ..})
   * @param message 
   */
  public static parseFunctionLog(log: string): FunctionLog {
    const elements = log.split('\t');
    
    return {
      timestamp: elements[0],
      invocationId: elements[1],
      logLevel: <LEVEL> elements[2],
      logObject: JSON.parse(elements[3]),
    };
  }

}