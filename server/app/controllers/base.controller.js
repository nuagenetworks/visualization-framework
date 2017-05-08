class BaseController {
  formatApiError(err) {
    if (!err) {
      // eslint-disable-next-line no-console
      return console.error('Provide an error');
    }

    const formatted = {
      message: err.message,
    };

    if (err.errors) {
      formatted.errors = {};
      const errors = err.errors;
      for (const type in errors) {
        if (errors.hasOwnProperty(type)) {
          formatted.errors[type] = errors[type].message;
        }
      }
    }

    return formatted;
  }
}

export default BaseController;
