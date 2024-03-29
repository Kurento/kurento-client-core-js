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

var checkType = kurentoClient.checkType;
var ChecktypeError = checkType.ChecktypeError;

var Stats = require('./Stats');


/**
 * A dictionary that represents the stats gathered in the media element.
 *
 * @constructor module:core/complexTypes.ElementStats
 *
 * @property {module:core/complexTypes.MediaLatencyStat} inputLatency
 *  The average time that buffers take to get on the input pads of this element 
 *  in nano seconds

 * @extends module:core.Stats
 */
function ElementStats(elementStatsDict){
  if(!(this instanceof ElementStats))
    return new ElementStats(elementStatsDict)

  elementStatsDict = elementStatsDict || {}

  // Check elementStatsDict has the required fields
  // 
  // checkType('MediaLatencyStat', 'elementStatsDict.inputLatency', elementStatsDict.inputLatency, {isArray: true, required: true});
  //  

  // Init parent class
  ElementStats.super_.call(this, elementStatsDict)

  // Set object properties
  Object.defineProperties(this, {
    inputLatency: {
      writable: true,
      enumerable: true,
      value: elementStatsDict.inputLatency
    }
  })
}
inherits(ElementStats, Stats)

// Private identifiers to allow re-construction of the complexType on the server
// They need to be enumerable so JSON.stringify() can access to them
Object.defineProperties(ElementStats.prototype, {
  __module__: {
    enumerable: true,
    value: "kurento"
  },
  __type__: {
    enumerable: true,
    value: "ElementStats"
  }
})

/**
 * Checker for {@link module:core/complexTypes.ElementStats}
 *
 * @memberof module:core/complexTypes
 *
 * @param {external:String} key
 * @param {module:core/complexTypes.ElementStats} value
 */
function checkElementStats(key, value)
{
  if(!(value instanceof ElementStats))
    throw ChecktypeError(key, ElementStats, value);
};


module.exports = ElementStats;

ElementStats.check = checkElementStats;
