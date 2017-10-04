import {Builder, By, Key, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import http from 'http';
import url from 'url';
import easyimg from 'easyimage';
import mkdirp from 'mkdirp';
import fs from 'fs'
import {dirname} from 'path'

const width = 1920;
const height = 3000;

let driver = null;
let finalCallback = null;
let currentDashboard = null;
let currentReportId = null;

let errors = [];
let results = [];
let widgets = [];

const MESSAGES = {
    ERROR: 'error',
    SUCCESS: 'success',
    URL_NOT_FOUND: 'Provided url does not exists',
    NO_WIDGET: 'Seems like an invalid Dashboard, no widgets found',
    WIDGETS_NOT_LOADING: 'Some of the widgets are not loading properly.'
}

export const crawl = function (reportId, dashboard, callback) {
  currentReportId = reportId;
  finalCallback = callback;
  currentDashboard = dashboard;
  widgets = [];
  errors = [];

  checkAndProcess(dashboard.url)
};

const callback = function(type, message) {
    if(driver) {
        driver.quit();
        driver = null;
    }

    if(message)
      errors.push(message)

    finalCallback({
      type: type,
      widgets: widgets,
      errors: errors
    });
};

const cropImage = function(size, location, srcFile, dstFile, triggerCallback) {
    easyimg.crop({
        src: srcFile,
        dst: dstFile,
        cropwidth: size.width,
        cropheight: size.height,
        quality: 100,
        x: location.x,
        y: location.y,
        gravity: 'NorthWest'
    }).then(
      function(image) {
        if(triggerCallback) {
          callback(MESSAGES.SUCCESS)
          return;
        }
      },
      function (err) {
        console.log(err);
      });
};

const checkAndProcess = function(URL) {
    var options = {
          method: 'HEAD',
          host: url.parse(URL).hostname,
          port: url.parse(URL).port
      };
      try {
          var req = http.request(options, function (r) {
              console.log('here')
              if(r.statusCode == 200) {
                  initiate(URL);
              } else {
                  callback(MESSAGES.ERROR, MESSAGES.URL_NOT_FOUND);
              }
          });

          req.on('error', function(error) {
             callback(MESSAGES.ERROR, MESSAGES.URL_NOT_FOUND);
          });

          req.end();
      } catch(e) {
          console.log(e)
      }

}

const initiate = function(URL) {
    driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().headless().windowSize({width, height}))
        .build();

    driver.get(URL);

    driver.wait(function() {
        return driver.findElements(By.xpath("//div[contains(@class,'react-grid-layout')]/div")).then(function(elements) {
            return elements.length;
        });
      }, 5000).then(function() {
         fetchWidgets();
      }).catch(function() {
          callback(MESSAGES.ERROR, MESSAGES.NO_WIDGET);
      });
}

const fetchWidgets = function() {
    driver.wait(function() {
        return driver.findElements(By.className('fa-spin')).then(function(elements) {
          return !elements.length;
        });
      }, 60000).catch(function() {
          errors.push(MESSAGES.WIDGETS_NOT_LOADING)
      });

      let names = [];
      let locations = [];
      let sizes = [];
      let statuses = [];

      driver.findElements(By.xpath("//div[contains(@class,'react-grid-layout')]/div/div")).then(function(elems) {
          elems.forEach(function (elem) {
              elem.getAttribute('id').then(function(name){
                  names.push(name);
              });

              elem.getLocation().then(function(location){
                  locations.push(location);
              });

              elem.getSize().then(function(size){
                  sizes.push(size);
              });

              elem.findElements(By.xpath(".//span[contains(@class,'fa-spin') or contains(@class,'fa-bar-chart')]")).then(function(elements) {
                  statuses.push(elements.length ? 'fail' : 'pass');
              });
          });
      });

      driver.takeScreenshot().then(
          function(image, err) {
              let filePath = `public/dashboards/${currentReportId}/${currentDashboard.dashboard_id}/${currentDashboard.dataset_id ? currentDashboard.dataset_id : 0}`;
              mkdirp(dirname(`${filePath}/dashboard.png`), function (err) {
                if (err)
                  return callback(MESSAGES.ERROR, {});

                fs.writeFile(`${filePath}/dashboard.png`, image, 'base64', function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        for(var i = 0; i < sizes.length; i++) {
                            widgets.push({
                              chart_name : names[i],
                              status: statuses[i] == "fail" ? "fail" : null
                            });

                            cropImage(sizes[i], locations[i], `${filePath}/dashboard.png`, `${filePath}/${names[i] ? names[i] : i}.png`, i === sizes.length - 1);
                        }
                    }

                });
              });
          });
}
