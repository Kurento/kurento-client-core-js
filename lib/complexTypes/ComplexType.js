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

var ChecktypeError = require('kurento-client').checkType.ChecktypeError;


/**
 * @constructor module:core/complexTypes.ComplexType
 *
 * @abstract
 */
function ComplexType(){}

// Based on http://stackoverflow.com/a/14078260/586382
ComplexType.prototype.toJSON = function()
{
  var result = {};

  for(var key in this)
  {
    var value = this[key]

    if(typeof value !== 'function')
      result[key] = value;
  }

  return result;
}


/**
 * Checker for {@link core/complexTypes.ComplexType}
 *
 * @memberof module:core/complexTypes
 *
 * @param {external:String} key
 * @param {module:core/complexTypes.ComplexType} value
 */
function checkComplexType(key, value)
{
  if(!(value instanceof ComplexType))
    throw ChecktypeError(key, ComplexType, value);
};


module.exports = ComplexType;

ComplexType.check = checkComplexType;
