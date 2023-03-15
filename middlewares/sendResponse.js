function sendResponse(req, res, next) {
  const response = res.send;
  res.send = function (originalData) {
    if (originalData.error) {
      // eslint-disable-next-line prefer-rest-params
      arguments[0] = {
        status: 'Failure',
        code: originalData.code,
        message: originalData.message,
        stack: originalData.stack,
      };
    } else if (originalData.results) {
      // eslint-disable-next-line prefer-rest-params
      arguments[0] = { status: 'Success', data: originalData.results };
    }
    // eslint-disable-next-line prefer-rest-params
    response.apply(res, arguments);
  };
  next();
}
export default sendResponse;
