import { cloneDeep, merge } from 'lodash';

export class Item {
  constructor(
    public attrs: any,
    public readonly table: any
  ) {
    this.set(attrs || {});
  }

  public set(data: any): void {
    this.attrs = merge({}, this.attrs, data);
  }

  public get(key?: string): unknown {
    if (key) {
      return this.attrs[key];
    }
    else {
      return this.attrs;
    }
  }

  public save(callback?: any): void {
    this.table.create(this.attrs, (err, item) => {
      if (err) {
        callback && callback(err);
        return;
      }
      this.set(item.attrs);
      callback && callback(null, item);
    });
  }

  public update(options, callback) {
    if (typeof options === 'function' && !callback) {
      callback = options;
      options = {};
    }
    options = options || {};
    this.table.update(this.attrs, options, (err, item) => {
      if (err) {
        callback && callback(err);
        return;
      }
      if (item) {
        this.set(item.attrs);
      }
      callback && callback(null, item);
    });
  }

  public destroy(options, callback) {
    if (typeof options === 'function' && !callback) {
      callback = options;
      options = {};
    }
    options = options || {};
    this.table.destroy(this.attrs, options, callback);
  }

  public toJSON() {
    return this.toPlainObject();
  }

  public toPlainObject() {
    return cloneDeep(this.attrs);
  }
}
