/* Autogenerated with Kurento Idl */

/*
 * (C) Copyright 2013-2015 Kurento (http://kurento.org/)
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

var kurentoClient = require('kurento-client');

var checkType = kurentoClient.checkType;
var ChecktypeError = checkType.ChecktypeError;

var ComplexType = require('./ComplexType');


/**
 * Type that represents a fraction of an integer numerator over an integer 
 * denominator
 *
 * @constructor module:core/complexTypes.Fraction
 *
 * @property {external:Integer} numerator
 *  the numerator of the fraction
 * @property {external:Integer} denominator
 *  the denominator of the fraction
 */
function Fraction(fractionDict){
  if(!(this instanceof Fraction))
    return new Fraction(fractionDict)

  // Check fractionDict has the required fields
  checkType('int', 'fractionDict.numerator', fractionDict.numerator, {required: true}
);
  checkType('int', 'fractionDict.denominator', fractionDict.denominator, {required: true}
);

  // Init parent class
  Fraction.super_.call(this, fractionDict)

  // Set object properties
  Object.defineProperties(this, {
    numerator: {
      writable: true,
      enumerable: true,
      value: fractionDict.numerator
    },
    denominator: {
      writable: true,
      enumerable: true,
      value: fractionDict.denominator
    }
  })
}
inherits(Fraction, ComplexType)

// Private identifiers to allow re-construction of the complexType on the server
// They need to be enumerable so JSON.stringify() can access to them
Object.defineProperties(Fraction.prototype, {
  __module__: {
    enumerable: true,
    value: "kurento"
  },
  __type__: {
    enumerable: true,
    value: "Fraction"
  }
})

/**
 * Checker for {@link core/complexTypes.Fraction}
 *
 * @memberof module:core/complexTypes
 *
 * @param {external:String} key
 * @param {module:core/complexTypes.Fraction} value
 */
function checkFraction(key, value)
{
  if(!(value instanceof Fraction))
    throw ChecktypeError(key, Fraction, value);
};


module.exports = Fraction;

Fraction.check = checkFraction;