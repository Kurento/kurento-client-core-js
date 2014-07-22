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

var checkType = require('checktype');


/**
 * Media API for the Kurento Web SDK
 *
 * @module kwsMediaApi/core
 *
 * @copyright 2013-2014 Kurento (http://kurento.org/)
 * @license LGPL
 */

var MediaObject = require('./MediaObject');


/**
 * Basic building blocks of the media server, that can be interconnected through the API. A :rom:cls:`MediaElement` is a module that encapsulates a specific media capability. They can be connected to create media pipelines where those capabilities are applied, in sequence, to the stream going through the pipeline.

   :rom:cls:`MediaElement` objects are classified by its supported media type (audio, video, etc.) and the flow direction: :rom:cls:`MediaSource` pads are intended for media delivery while :rom:cls:`MediaSinks<MediaSink>`  behave as reception points.
 *
 * @abstract
 * @class   module:kwsMediaApi/core~MediaElement
 * @extends module:core~MediaObject
 */

/**
 * @constructor
 *
 * @param {string} id
 */
function MediaElement(id)
{
  MediaObject.call(this, id);
};
inherits(MediaElement, MediaObject);


/**
 * perform :rom:meth:`connect(sink,mediaType)` if there is exactly one sink for the given type, and their mediaDescriptions are the same
 *
 * @param {MediaElement} sink
 *  the target :rom:cls:`MediaElement`  from which :rom:cls:`MediaSink` will be obtained
 *
 * @param {MediaType} [mediaType]
 *  the :rom:enum:`MediaType` of the pads that will be connected
 *
 * @param {String} [mediaDescription]
 *  A textual description of the media source. Currently not used, aimed mainly for :rom:attr:`MediaType.DATA` sources
 *
 * @param {module:kwsMediaApi/core~MediaElement.connectCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~MediaElement}
 *  The own media object
 */
MediaElement.prototype.connect = function(sink, mediaType, mediaDescription, callback){
  callback = arguments[arguments.length-1] instanceof Function
           ? Array.prototype.pop.call(arguments)
           : undefined;

//  eval(['sink', 'mediaType', 'mediaDescription'][arguments.length]+'=undefined')
  if(callback)
    switch(arguments.length){
      case 1: mediaType = undefined; break;
      case 2: mediaDescription = undefined; break;
    }

  checkType('MediaElement', 'sink', sink, {required: true});
  checkType('MediaType', 'mediaType', mediaType);
  checkType('String', 'mediaDescription', mediaDescription);

  var params = {
    sink: sink,
    mediaType: mediaType,
    mediaDescription: mediaDescription,
  };

  return this.invoke('connect', params, callback);
};
/**
 * @callback MediaElement~connectCallback
 * @param {Error} error
 */

/**
 * A list of sinks of the given :rom:ref:`MediaType`. The list will be empty if no sinks are found.
 *
 * @param {MediaType} [mediaType]
 *  One of :rom:attr:`MediaType.AUDIO`, :rom:attr:`MediaType.VIDEO` or :rom:attr:`MediaType.DATA`
 *
 * @param {String} [description]
 *  A textual description of the media source. Currently not used, aimed mainly for :rom:attr:`MediaType.DATA` sources
 *
 * @param {module:kwsMediaApi/core~MediaElement.getMediaSinksCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~MediaElement}
 *  The own media object
 */
MediaElement.prototype.getMediaSinks = function(mediaType, description, callback){
  callback = arguments[arguments.length-1] instanceof Function
           ? Array.prototype.pop.call(arguments)
           : undefined;

//  eval(['mediaType', 'description'][arguments.length]+'=undefined')
  if(callback)
    switch(arguments.length){
      case 0: mediaType = undefined; break;
      case 1: description = undefined; break;
    }

  checkType('MediaType', 'mediaType', mediaType);
  checkType('String', 'description', description);

  var params = {
    mediaType: mediaType,
    description: description,
  };

  return this.invoke('getMediaSinks', params, callback);
};
/**
 * @callback MediaElement~getMediaSinksCallback
 * @param {Error} error
 * @param {MediaSink} result
 *  A list of sinks. The list will be empty if no sinks are found.
 */

/**
 * Get the media sources of the given type and description
 *
 * @param {MediaType} [mediaType]
 *  One of :rom:attr:`MediaType.AUDIO`, :rom:attr:`MediaType.VIDEO` or :rom:attr:`MediaType.DATA`
 *
 * @param {String} [description]
 *  A textual description of the media source. Currently not used, aimed mainly for :rom:attr:`MediaType.DATA` sources
 *
 * @param {module:kwsMediaApi/core~MediaElement.getMediaSrcsCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~MediaElement}
 *  The own media object
 */
MediaElement.prototype.getMediaSrcs = function(mediaType, description, callback){
  callback = arguments[arguments.length-1] instanceof Function
           ? Array.prototype.pop.call(arguments)
           : undefined;

//  eval(['mediaType', 'description'][arguments.length]+'=undefined')
  if(callback)
    switch(arguments.length){
      case 0: mediaType = undefined; break;
      case 1: description = undefined; break;
    }

  checkType('MediaType', 'mediaType', mediaType);
  checkType('String', 'description', description);

  var params = {
    mediaType: mediaType,
    description: description,
  };

  return this.invoke('getMediaSrcs', params, callback);
};
/**
 * @callback MediaElement~getMediaSrcsCallback
 * @param {Error} error
 * @param {MediaSource} result
 *  A list of sources. The list will be empty if no sources are found.
 */


/**
 * @type module:kwsMediaApi/core~MediaElement.constructorParams
 */
MediaElement.constructorParams = {};

/**
 * @type   module:kwsMediaApi/core~MediaElement.events
 * @extend module:kwsMediaApi~MediaObject.events
 */
MediaElement.events = [];
MediaElement.events.concat(MediaObject.events);


module.exports = MediaElement;


MediaElement.check = function(key, value)
{
  if(!(value instanceof MediaElement))
    throw SyntaxError(key+' param should be a MediaElement, not '+typeof value);
};
