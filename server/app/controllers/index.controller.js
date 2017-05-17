import BaseController from './base.controller';
import Constants from '../configurations/constants';

class IndexController extends BaseController {
  index(req, res) {
    res.json({
      release: Constants.release,
    });
  }
}

export default new IndexController();
