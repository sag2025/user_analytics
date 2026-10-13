// An error that carries an HTTP status, so controllers/models can just throw it.
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
module.exports = AppError;
