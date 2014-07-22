/*
 * (C) Copyright 2013-2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

var inherits = require('inherits');

var Promise = require('es6-promise').Promise;

var promiseCallback = require('promisecallback');


/**
 * Media API for the Kurento Web SDK
 *
 * @module kwsMediaApi/core
 *
 * @copyright 2013-2014 Kurento (http://kurento.org/)
 * @license LGPL
 */

var EventEmitter = require('events').EventEmitter;


/**
 * Base for all objects that can be created in the media server.
 *
 * @abstract
 * @class   module:kwsMediaApi/core~MediaObject
 */

/**
 * @constructor
 *
 * @param {string} id
 */
function MediaObject(id)
{
  EventEmitter.call(this, id);


  //
  // Define object properties
  //

  /**
   * Unique identifier of this object
   *
   * @public
   * @readonly
   * @member {external:Number}
   */
  Object.defineProperty(this, "id", {value: id});


  //
  // Subscribe and unsubscribe events on the server when adding and removing
  // event listeners on this MediaObject
  //

  var subscriptions = {};

  this.on('removeListener', function(event, listener)
  {
    // Blacklisted events
    if(event == 'release'
    || event == '_rpc'
    || event == 'newListener')
      return;

    var count = EventEmitter.listenerCount(this, event);
    if(count) return;

    var token = subscriptions[event];

    this.emit('_rpc', 'unsubscribe', {subscription: token}, function(error)
    {
      if(error) return this.emit('error', error);

      delete subscriptions[event];
    });
  });

  this.on('newListener', function(event, listener)
  {
    // Blacklisted events
    if(event == 'release'
    || event == '_rpc'
    || event == '_create')
      return;

    var count = EventEmitter.listenerCount(this, event);
    if(count) return;

    this.emit('_rpc', 'subscribe', {type: event}, function(error, token)
    {
      if(error) return this.emit('error', error);

      subscriptions[event] = token;
    });
  });
};
inherits(MediaObject, EventEmitter);


/**
 * :rom:cls:`MediaPipeline` to which this MediaObject belong, or the pipeline itself if invoked over a :rom:cls:`MediaPipeline`
 *
 * @param {module:kwsMediaApi/core~MediaObject.mediaPipelineCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~MediaObject}
 *  The own media object
 */
MediaObject.prototype.getMediaPipeline = function(callback){
  return this.invoke('getMediaPipeline', callback);
};
/**
 * @callback MediaObject~getMediaPipelineCallback
 * @param {Error} error
 * @param {MediaPipeline} result
 */

/**
 * parent of this media object. The type of the parent depends on the type of the element. The parent of a :rom:cls:`MediaPad` is its :rom:cls:`MediaElement`; the parent of a :rom:cls:`Hub` or a :rom:cls:`MediaElement` is its :rom:cls:`MediaPipeline`. A :rom:cls:`MediaPipeline` has no parent, i.e. the property is null
 *
 * @param {module:kwsMediaApi/core~MediaObject.parentCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~MediaObject}
 *  The own media object
 */
MediaObject.prototype.getParent = function(callback){
  return this.invoke('getParent', callback);
};
/**
 * @callback MediaObject~getParentCallback
 * @param {Error} error
 * @param {MediaObject} result
 */


/**
 * Send a command to a media object
 *
 * @param {external:String} method - Command to be executed by the server
 * @param {module:kwsMediaApi~MediaObject.constructorParams} [params]
 * @callback {invokeCallback} callback
 *
 * @return {module:kwsMediaApi~MediaObject} The own media object
 */
MediaObject.prototype.invoke = function(method, params, callback){
  var self = this;

  // Fix optional parameters
  if(params instanceof Function)
  {
    if(callback)
      throw new SyntaxError("Nothing can be defined after the callback");

    callback = params;
    params = undefined;
  };

  var promise = new Promise(function(resolve, reject)
  {
    // Generate request parameters
    var params2 =
    {
      operation: method
    };

    if(params)
      params2.operationParams = params;

    // Do request
    self.emit('_rpc', 'invoke', params2, function(error, result)
    {
      if(error) return reject(error);

      var value = result.value;
      if(value === undefined) value = self;

      resolve(value);
    });
  });

  return promiseCallback(promise, callback);
};
/**
 * @callback invokeCallback
 * @param {MediaServerError} error
 */

/**
 * Explicity release a {@link module:kwsMediaApi~MediaObject MediaObject} from memory
 *
 * All its descendants will be also released and collected
 *
 * @throws {module:kwsMediaApi~MediaServerError}
 */
MediaObject.prototype.release = function(callback){
  var self = this;

  var promise = new Promise(function(resolve, reject)
  {
    self.emit('_rpc', 'release', {}, function(error)
    {
      if(error) return reject(error);

      self.emit('release');

      // Remove events on the object and remove object from cache
      self.removeAllListeners();

      resolve();
    });
  });

  return promiseCallback(promise, callback);
};


/**
 * @type module:kwsMediaApi/core~MediaObject.constructorParams
 */
MediaObject.constructorParams = {};

/**
 * @type module:kwsMediaApi/core~MediaObject.events
 */
MediaObject.events = ['Error'];


module.exports = MediaObject;


MediaObject.check = function(key, value)
{
  if(!(value instanceof MediaObject))
    throw SyntaxError(key+' param should be a MediaObject, not '+typeof value);
};
