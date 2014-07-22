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

var Endpoint = require('./Endpoint');


/**
 * Interface for endpoints the require a URI to work. An example of this, would be a :rom:cls:`PlayerEndpoint` whose URI property could be used to locate a file to stream through its :rom:cls:`MediaSource`
 *
 * @abstract
 * @class   module:kwsMediaApi/core~UriEndpoint
 * @extends module:core~Endpoint
 */

/**
 * @constructor
 *
 * @param {string} id
 */
function UriEndpoint(id)
{
  Endpoint.call(this, id);
};
inherits(UriEndpoint, Endpoint);


/**
 * The uri for this endpoint.
 *
 * @param {module:kwsMediaApi/core~UriEndpoint.uriCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~UriEndpoint}
 *  The own media object
 */
UriEndpoint.prototype.getUri = function(callback){
  return this.invoke('getUri', callback);
};
/**
 * @callback UriEndpoint~getUriCallback
 * @param {Error} error
 * @param {String} result
 */


/**
 * Pauses the feed
 *
 * @param {module:kwsMediaApi/core~UriEndpoint.pauseCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~UriEndpoint}
 *  The own media object
 */
UriEndpoint.prototype.pause = function(callback){
  return this.invoke('pause', callback);
};
/**
 * @callback UriEndpoint~pauseCallback
 * @param {Error} error
 */

/**
 * Stops the feed
 *
 * @param {module:kwsMediaApi/core~UriEndpoint.stopCallback} [callback]
 *
 * @return {module:kwsMediaApi/core~UriEndpoint}
 *  The own media object
 */
UriEndpoint.prototype.stop = function(callback){
  return this.invoke('stop', callback);
};
/**
 * @callback UriEndpoint~stopCallback
 * @param {Error} error
 */


/**
 * @type module:kwsMediaApi/core~UriEndpoint.constructorParams
 */
UriEndpoint.constructorParams = {};

/**
 * @type   module:kwsMediaApi/core~UriEndpoint.events
 * @extend module:kwsMediaApi~Endpoint.events
 */
UriEndpoint.events = [];
UriEndpoint.events.concat(Endpoint.events);


module.exports = UriEndpoint;


UriEndpoint.check = function(key, value)
{
  if(!(value instanceof UriEndpoint))
    throw SyntaxError(key+' param should be a UriEndpoint, not '+typeof value);
};
