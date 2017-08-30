class BaseModel {
  formatError(message, status) {
    let err = new Error(message ? message : 'Internal Server Error');
    err.status = status ? status : 500;
    return err;
  }
}

export default BaseModel;
