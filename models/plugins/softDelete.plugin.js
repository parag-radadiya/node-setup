import mongoose from 'mongoose';

const { Schema } = mongoose;
const { Model } = mongoose;

function parseUpdateArguments(conditions, doc, options, callbackFunc) {
  let callback = callbackFunc;
  let condition = conditions;
  let document = doc;
  let option = options;
  if (typeof option === 'function') {
    // .update(conditions, doc, callback)
    callback = option;
    option = null;
  } else if (typeof document === 'function') {
    // .update(doc, callback);
    callback = document;
    document = condition;
    condition = {};
    option = null;
  } else if (typeof condition === 'function') {
    // .update(callback)
    callback = condition;
    condition = undefined;
    document = undefined;
    option = undefined;
  } else if (typeof condition === 'object' && !document && !option && !callback) {
    // .update(doc)
    document = condition;
    condition = undefined;
    option = undefined;
    callback = undefined;
  }
  const args = [];
  if (condition) args.push(condition);
  if (document) args.push(document);
  if (option) args.push(option);
  if (callback) args.push(callback);
  return args;
}

function parseIndexFields(options) {
  const { deleted, deletedAt, deletedBy } = options;
  const indexFields = {
    [deleted]: false,
    [deletedAt]: false,
    [deletedBy]: false,
  };
  if (!options.indexFields) {
    return indexFields;
  }
  if ((typeof options.indexFields === 'string' || options.indexFields instanceof String) && options.indexFields === 'all') {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const item in indexFields) {
      indexFields[item] = true;
    }
  }
  if (typeof options.indexFields === 'boolean' && options.indexFields === true) {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const item in indexFields) {
      indexFields[item] = true;
    }
  }
  if (Array.isArray(options.indexFields)) {
    indexFields[deleted] = options.indexFields.indexOf(deleted) > -1;
    indexFields[deletedAt] = options.indexFields.indexOf(deletedAt) > -1;
    indexFields[deletedBy] = options.indexFields.indexOf(deletedBy) > -1;
  }
  return indexFields;
}

function createSchemaObject(typeKey, typeValue, options) {
  const option = options;
  option[typeKey] = typeValue;
  return option;
}
/* eslint-disable-next-line prefer-rest-params */
/* eslint-disable no-param-reassign */
/* eslint-disable-next-line prefer-rest-params */
module.exports = function (schema, options) {
  options = options || {};
  const indexFields = parseIndexFields(options);
  const { deleted, deletedAt, deletedBy } = options;
  const { typeKey } = schema.options;
  const mongooseMajorVersion = +mongoose.version[0]; // 4, 5...
  const mainUpdateMethod = mongooseMajorVersion < 5 ? 'update' : 'updateMany';
  const mainUpdateWithDeletedMethod = `${mainUpdateMethod}WithDeleted`;

  function updateDocumentsByQuery(model, conditions, updateQuery, callback) {
    if (model[mainUpdateWithDeletedMethod]) {
      return model[mainUpdateWithDeletedMethod](conditions, updateQuery, { multi: true }, callback);
    }
    return model[mainUpdateMethod](conditions, updateQuery, { multi: true }, callback);
  }
  if (options.deleted) {
    schema.add({
      [deleted]: createSchemaObject(typeKey, Boolean, {
        default: false,
        index: indexFields[deleted],
      }),
    });
  }
  if (options.deletedAt) {
    schema.add({
      [deletedAt]: createSchemaObject(typeKey, Date, {
        default: Date.now(),
        index: indexFields[deletedAt],
      }),
    });
  }
  if (options.deletedBy) {
    schema.add({
      [deletedBy]: createSchemaObject(typeKey, options.deletedByType || Schema.Types.ObjectId, {
        index: indexFields[deletedBy],
      }),
    });
  }
  let use$neOperator = true;
  if (options.use$neOperator !== undefined && typeof options.use$neOperator === 'boolean') {
    use$neOperator = options.use$neOperator;
  }
  schema.pre('save', function (next) {
    if (!this[deleted]) {
      this[deleted] = false;
    }
    next();
  });
  if (options.overrideMethods) {
    const overrideItems = options.overrideMethods;
    const overridableMethods = [
      'count',
      'countDocuments',
      'find',
      'findOne',
      'findOneAndUpdate',
      'update',
      'updateOne',
      'updateMany',
      'aggregate',
    ];
    let finalList = [];
    if ((typeof overrideItems === 'string' || overrideItems instanceof String) && overrideItems === 'all') {
      finalList = overridableMethods;
    }
    if (typeof overrideItems === 'boolean' && overrideItems === true) {
      finalList = overridableMethods;
    }
    if (Array.isArray(overrideItems)) {
      overrideItems.forEach(function (method) {
        if (overridableMethods.indexOf(method) > -1) {
          finalList.push(method);
        }
      });
    }
    if (finalList.indexOf('aggregate') > -1) {
      schema.pre('aggregate', function () {
        const firsMatchStr = JSON.stringify(this.pipeline()[0]);
        if (firsMatchStr !== `{"$match":{"${deleted}":{"$ne":false}}}`) {
          if (firsMatchStr === '{"$match":{"showAllDocuments":"true"}}') {
            this.pipeline().shift();
          } else {
            this.pipeline().unshift({
              $match: {
                [deleted]: { $ne: true },
              },
            });
          }
        }
      });
    }
    finalList.forEach(function (method) {
      if (['count', 'countDocuments', 'find', 'findOne'].indexOf(method) > -1) {
        let modelMethodName = method;
        // countDocuments do not exist in Mongoose v4
        /* istanbul ignore next */
        if (mongooseMajorVersion < 5 && method === 'countDocuments' && typeof Model.countDocuments !== 'function') {
          modelMethodName = 'count';
        }
        schema.statics[method] = function (...args) {
          const query = Model[modelMethodName].apply(this, args);
          if (!args[2] || args[2].withDeleted !== true) {
            if (use$neOperator) {
              query.where(`${deleted}`).ne(true);
            } else {
              query.where({
                [deleted]: false,
              });
            }
          }
          return query;
        };
        schema.statics[`${method}Deleted`] = function (...args) {
          if (use$neOperator) {
            return Model[modelMethodName].apply(this, args).where(`'${deleted}'`).ne(false);
          }
          return Model[modelMethodName].apply(this, args).where({
            [deleted]: true,
          });
        };
        schema.statics[`${method}WithDeleted`] = function (...args) {
          return Model[modelMethodName].apply(this, args);
        };
      } else if (method === 'aggregate') {
        schema.statics[`${method}Deleted`] = function (...arg) {
          const args = [];
          Array.prototype.push.apply(args, arg);
          const match = {
            $match: {
              [deleted]: { $ne: false },
            },
          };
          // eslint-disable-next-line no-unused-expressions
          arg.length ? args[0].unshift(match) : args.push([match]);
          return Model[method].apply(this, args);
        };
        schema.statics[`${method}WithDeleted`] = function (...arg) {
          const args = [];
          Array.prototype.push.apply(args, arg);
          const match = { $match: { showAllDocuments: 'true' } };
          // eslint-disable-next-line no-unused-expressions
          arg.length ? args[0].unshift(match) : args.push([match]);
          return Model[method].apply(this, args);
        };
      } else {
        schema.statics[method] = function (...arg) {
          // eslint-disable-next-line prefer-spread
          const args = parseUpdateArguments.apply(undefined, arg);
          if (use$neOperator) {
            args[0][deleted] = { $ne: true };
          } else {
            args[0][deleted] = false;
          }
          return Model[method].apply(this, args);
        };
        schema.statics[`${method}Deleted`] = function (...arg) {
          // eslint-disable-next-line prefer-spread
          const args = parseUpdateArguments.apply(undefined, arg);
          if (use$neOperator) {
            args[0][deleted] = { $ne: false };
          } else {
            args[0][deleted] = true;
          }
          return Model[method].apply(this, args);
        };
        schema.statics[`${method}WithDeleted`] = function (...arg) {
          return Model[method].apply(this, arg);
        };
      }
    });
  }
  schema.methods.delete = function (deleteBy, cb) {
    if (typeof deleteBy === 'function') {
      cb = deleteBy;
      deleteBy = null;
    }
    this[deleted] = true;
    if (schema.path(deletedAt)) {
      this[deletedAt] = new Date();
    }
    if (schema.path(deletedBy)) {
      this[deletedBy] = deleteBy;
    }
    if (options.validateBeforeDelete === false) {
      return this.save({ validateBeforeSave: false }, cb);
    }
    return this.save(cb);
  };
  schema.statics.delete = function (conditions, deleteBy, callback) {
    if (typeof deleteBy === 'function') {
      callback = deleteBy;
      // eslint-disable-next-line no-self-assign
      conditions = conditions;
      deleteBy = null;
    } else if (typeof conditions === 'function') {
      callback = conditions;
      conditions = {};
      deleteBy = null;
    }
    const doc = {
      [deleted]: true,
    };
    if (schema.path(deletedAt)) {
      doc[deletedAt] = new Date();
    }
    if (schema.path(deletedBy)) {
      doc[deletedBy] = deleteBy;
    }
    return updateDocumentsByQuery(this, conditions, doc, callback);
  };
  schema.statics.deleteById = function (id, deleteBy, callback) {
    if (arguments.length === 0 || typeof id === 'function') {
      const msg = 'First argument is mandatory and must not be a function.';
      throw new TypeError(msg);
    }
    const conditions = {
      _id: id,
    };
    return this.delete(conditions, deleteBy, callback);
  };
  schema.methods.restore = function (callback) {
    this[deleted] = false;
    this[deletedAt] = undefined;
    this[deletedBy] = undefined;
    return this.save(callback);
  };
  schema.statics.restore = function (conditions, callback) {
    if (typeof conditions === 'function') {
      callback = conditions;
      conditions = {};
    }
    const doc = {
      [deleted]: false,
      [deletedAt]: undefined,
      [deletedBy]: undefined,
    };
    return updateDocumentsByQuery(this, conditions, doc, callback);
  };
};
