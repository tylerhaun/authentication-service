

export default class HttpError extends Error {
  constructor(args) {
    const { message, status } = args;
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
  }
}

export function errorHandlerMiddleware(error, request, response, next) {
  var httpError;
  if (error instanceof HttpError) {
    httpError = error;
  }
  else {
    var message;
    if (process.env.CONCEAL_ERRORS == true) {
      message = process.env.CONCEAL_ERRORS_MESSAGE || "Set CONCEAL_ERRORS_MESSAGE for custom message";
      console.error(error);
    }
    else {
      message = error.message;
    }
    const errorArgs = {
      message,
      status: "500",
    };
    httpError = new HttpError(errorArgs);
  }

  return response.status(httpError.status).json({error: httpError.message})

}

