import Constants from '../configurations/constants';

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (!err) {
    return res.sendStatus(500);
  }

  console.log('ERROR OCCURED: ', err.message || err)
  const error = {
    message: err.message || 'Internal Server Error.',
  };

  if (Constants.envs.development) {
    error.stack = err.stack;
  }

  if (err.errors) {
    error.errors = {};
    const { errors } = err;
    for (const type in errors) {
      if (type in errors) {
        error.errors[type] = errors[type].message;
      }
    }
  }
  
  if(error.message) {
    res.statusMessage = error.message; 
  }

  res.status(err.status || 500).json(error);
}
