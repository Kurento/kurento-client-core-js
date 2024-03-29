/* Autogenerated with Kurento Idl */

/*
 * (C) Copyright 2013-2015 Kurento (https://kurento.openvidu.io/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var inherits = require('inherits');

var kurentoClient = require('kurento-client');

var disguise = kurentoClient.disguise;

var ChecktypeError = kurentoClient.checkType.ChecktypeError;

var MediaElement = require('./MediaElement');


/**
 * @classdesc
 *  Base interface for all end points.
 *  <p>
 *    An Endpoint is a {@link MediaElement} that allows Kurento to exchange
 *    media contents with external systems, supporting different transport 
 *    protocols
 *    and mechanisms, such as RTP, WebRTC, HTTP(s), <code>file://</code> URLs, 
 *    etc.
 *  </p>
 *  <p>
 *    An <code>Endpoint</code> may contain both sources and sinks for different 
 *    media types,
 *    to provide bidirectional communication.
 *  </p>
 *
 * @abstract
 * @extends module:core/abstracts.MediaElement
 *
 * @constructor module:core/abstracts.Endpoint
 */
function Endpoint(){
  Endpoint.super_.call(this);
};
inherits(Endpoint, MediaElement);


/**
 * @alias module:core/abstracts.Endpoint.constructorParams
 */
Endpoint.constructorParams = {
};

/**
 * @alias module:core/abstracts.Endpoint.events
 *
 * @extends module:core/abstracts.MediaElement.events
 */
Endpoint.events = MediaElement.events;


/**
 * Checker for {@link module:core/abstracts.Endpoint}
 *
 * @memberof module:core/abstracts
 *
 * @param {external:String} key
 * @param {module:core/abstracts.Endpoint} value
 */
function checkEndpoint(key, value)
{
  if(!(value instanceof Endpoint))
    throw ChecktypeError(key, Endpoint, value);
};


module.exports = Endpoint;

Endpoint.check = checkEndpoint;
