'use strict';

const async = require('async');
const _ = require('lodash');

const internals = {};

internals.createTable = (model, globalOptions, options, callback) => {
  globalOptions = globalOptions || {};
  options = options || {};

  const tableName = model.tableName();

  model.describeTable((err, data) => {
    if (_.isNull(data) || _.isUndefined(data)) {
      model.log.info('creating table: %s', tableName);
      return model.createTable(options, (error) => {
        if (error) {
          model.log.warn({ err: error }, 'failed to create table %s: %s', tableName, error);
          return callback(error);
        }

        model.log.info('waiting for table: %s to become ACTIVE', tableName);
        internals.waitTillActive(globalOptions, model, callback);
      });
    } else {
      model.updateTable((err) => {
        if (err) {
          model.log.warn({ err: err }, 'failed to update table %s: %s', tableName, err);
          return callback(err);
        }

        model.log.info('waiting for table: %s to become ACTIVE', tableName);
        internals.waitTillActive(globalOptions, model, callback);
      });
    }
  });
};

internals.waitTillActive = (options, model, callback) => {
  let status = 'PENDING';

  async.doWhilst(
    (next) => {
      model.describeTable((err, data) => {
        if (err) {
          return next(err);
        }

        status = data.Table.TableStatus;

        setTimeout(next, options.pollingInterval || 1000);
      });
    },
    // NOTE: the first invocation seems to not pass any args but followup pass a
    //       callback as last argument (as doc'd).  we'll try for both
    (...args) => {
      const next = args.pop();
      const result = status !== 'ACTIVE';
      if (next) {
        next(null, result);
      }
      return result;
    },
    (err) => callback(err)
  );
};

module.exports = (models, config, callback) => {
  async.eachSeries(_.keys(models), (key, callback) => internals.createTable(models[key], config.$dynogels, config[key], callback), callback);
};
