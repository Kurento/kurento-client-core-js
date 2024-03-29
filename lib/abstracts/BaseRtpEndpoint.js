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

var checkType      = kurentoClient.checkType;
var ChecktypeError = checkType.ChecktypeError;


var Transaction = kurentoClient.TransactionsManager.Transaction;

var SdpEndpoint = require('./SdpEndpoint');


function noop(error, result) {
  if (error) console.trace(error);

  return result
};


/**
 * @classdesc
 *  Base class for the implementation of RTP-based communication endpoints.
 *  <p>
 *    All endpoints that rely on the RTP protocol, like the
 *    :rom:cls:`RtpEndpoint` or the :rom:cls:`WebRtcEndpoint`, inherit
 *    from this class. This endpoint provides information about the Connection 
 *    state
 *    and the Media state, which can be consulted at any time through the
 *    {@link core/abstracts.BaseRtpEndpoint#getMediaState} and the {@link 
 *    core/abstracts.BaseRtpEndpoint#getConnectionState} methods. It
 *    is also possible subscribe to events fired when these properties change:
 *  </p>
 *  <ul>
 *    <li>
 *      <strong>{@link ConnectionStateChangedEvent}</strong>: This event is 
 *      raised
 *      when the connection between two peers changes. It can have two values:
 *      <ul>
 *        <li>CONNECTED</li>
 *        <li>DISCONNECTED</li>
 *      </ul>
 *    </li>
 *    <li>
 *      <strong>{@link MediaStateChangedEvent}</strong>: This event provides
 *      information about the state of the underlying RTP session. Possible 
 *      values
 *      are:
 *      <ul>
 *        <li>CONNECTED: There is an RTCP packet flow between peers.</li>
 *        <li>
 *          DISCONNECTED: Either no RTCP packets have been received yet, or the
 *          remote peer has ended the RTP session with a <code>BYE</code> 
 *          message,
 *          or at least 5 seconds have elapsed since the last RTCP packet was
 *          received.
 *        </li>
 *      </ul>
 *      <p>
 *        The standard definition of RTP (<a
 *          href='https://tools.ietf.org/html/rfc3550'
 *          target='_blank'
 *          >RFC 3550</a
 *        >) describes a session as active whenever there is a maintained flow 
 *        of
 *        RTCP control packets, regardless of whether there is actual media 
 *        flowing
 *        through RTP data packets or not. The reasoning behind this is that, at
 *        given moment, a participant of an RTP session might temporarily stop
 *        sending RTP data packets, but this wouldn't necessarily mean that the 
 *        RTP
 *        session as a whole is finished; it maybe just means that the 
 *        participant
 *        has some temporary issues but it will soon resume sending data. For 
 *        this
 *        reason, that an RTP session has really finished is something that is
 *        considered only by the prolonged absence of RTCP control packets 
 *        between
 *        participants.
 *      </p>
 *      <p>
 *        Since RTCP packets do not flow at a constant rate (for instance,
 *        minimizing a browser window with a WebRTC's
 *        <code>RTCPeerConnection</code> object might affect the sending 
 *        interval),
 *        it is not possible to immediately detect their absence and assume that
 *        RTP session has finished. Instead, there is a guard period of
 *        approximately <strong>5 seconds</strong> of missing RTCP packets 
 *        before
 *        considering that the underlying RTP session is effectively finished, 
 *        thus
 *        triggering a <code>MediaStateChangedEvent = DISCONNECTED</code> event.
 *      </p>
 *      <p>
 *        In other words, there is always a period during which there might be 
 *        no
 *        media flowing, but this event hasn't been fired yet. Nevertheless, 
 *        this is
 *        the most reliable and useful way of knowing what is the long-term, 
 *        steady
 *        state of RTP media exchange.
 *      </p>
 *      <p>
 *        The {@link ConnectionStateChangedEvent} comes in contrast with more
 *        instantaneous events such as MediaElement's
 *        {@link MediaFlowInStateChangedEvent} and
 *        {@link MediaFlowOutStateChangedEvent}, which are triggered almost
 *        immediately after the RTP data packets stop flowing between RTP 
 *        session
 *        participants. This makes the <em>MediaFlow</em> events a good way to 
 *        know
 *        if participants are suffering from short-term intermittent 
 *        connectivity
 *        issues, but they are not enough to know if the connectivity issues are
 *        just spurious network hiccups or are part of a more long-term
 *        disconnection problem.
 *      </p>
 *    </li>
 *  </ul>
 *  <h2>Bitrate management</h2>
 *  <p>
 *    <b>Bandwidth control</b> for the video component of the media session is 
 *    done
 *    here.
 *    <strong>
 *      Note that the default <em>MaxVideoSendBandwidth</em> is a VERY 
 *      conservative
 *      value, and leads to a low maximum video quality. Most applications will
 *      probably want to increase this to higher values such as 2000 kbps (2 
 *      Mbps).
 *    </strong>
 *  </p>
 *  <ul>
 *    <li>
 *      <b>Recv bandwidth</b>: Used to request a remote sender that its media
 *      bitrate is within the requested range.
 *      <ul>
 *        <li>
 *          <strong>MinVideoRecvBandwidth</strong>: Minimum inbound bitrate
 *          requested by this endpoint. Signaled to compatible WebRTC and RTP
 *          senders, as part of the REMB bandwidth estimation protocol.
 *          <ul>
 *            <li>Unit: kbps (kilobits per second).</li>
 *            <li>Default: 0.</li>
 *            <li>
 *              Note: The actual minimum value is 30 kbps, even if a lower value
 *              set.
 *            </li>
 *          </ul>
 *        </li>
 *        <li>
 *          <strong>MaxAudioRecvBandwidth</strong> and
 *          <strong>MaxVideoRecvBandwidth</strong>: Maximum inbound bitrate
 *          requested by this endpoint. Signaled to compatible WebRTC and RTP
 *          senders as part of Kurento's REMB bandwidth estimations, and also as
 *          SDP bitrate attribute (<code>b=AS:{value}</code>, see
 *          <a href='https://datatracker.ietf.org/doc/html/rfc8866#section-5.8'
 *            >RFC 8866 Section 5.8. Bandwidth Information</a
 *          >) in <i>sendrecv</i> and <i>recvonly</i> SDP Offers.
 *          <ul>
 *            <li>Unit: kbps (kilobits per second).</li>
 *            <li>Default: 0 (unlimited).</li>
 *          </ul>
 *        </li>
 *      </ul>
 *    </li>
 *    <li>
 *      <b>Send bandwidth</b>: Used to control bitrate of the outbound media 
 *      stream
 *      sent to remote peers. It is important to keep in mind that outbound 
 *      bitrate
 *      ultimately depends on network and remote peer capabilities.
 *      <ul>
 *        <li>
 *          <strong>MinVideoSendBandwidth</strong>: Minimum outbound bitrate 
 *          sent by
 *          this endpoint.
 *          <ul>
 *            <li>Unit: kbps (kilobits per second).</li>
 *            <li>Default: 100.</li>
 *            <li>
 *              0 = unlimited: the video bitrate will drop as needed, even to 
 *              the
 *              lowest possible quality, which could make the video completely
 *              blurry and pixelated, but would adapt better to losses caused by
 *              network congestion.
 *            </li>
 *          </ul>
 *        </li>
 *        <li>
 *          <strong>MaxVideoSendBandwidth</strong>: Maximum outbound bitrate 
 *          sent by
 *          this endpoint. Remote peers themselves might also announce a maximum
 *          bitrate as part of their REMB bandwidth estimations, and also as an 
 *          SDP
 *          bitrate attribute (<code>b=AS:{value}</code>, see
 *          <a href='https://datatracker.ietf.org/doc/html/rfc8866#section-5.8'
 *            >RFC 8866 Section 5.8. Bandwidth Information</a
 *          >) in <i>sendrecv</i> and <i>recvonly</i> SDP Offers or Answers. 
 *          Kurento
 *          will always give priority to bitrate limitations specified by remote
 *          peers, over internal configurations.
 *          <ul>
 *            <li>Unit: kbps (kilobits per second).</li>
 *            <li>Default: 500.</li>
 *            <li>
 *              0 = unlimited: the video bitrate will grow until all the 
 *              available
 *              network bandwidth is used by the stream.<br />
 *              Note that this might have a bad effect if more than one stream 
 *              is
 *              running (as all of them would try to raise the video bitrate
 *              indefinitely, until the network gets saturated).
 *            </li>
 *          </ul>
 *        </li>
 *        <li>
 *          <strong>RembParams.rembOnConnect</strong>: Initial local REMB 
 *          bandwidth
 *          estimation that gets used when a new endpoint is connected. Only 
 *          useful
 *          for connections that are compatible with the REMB bandwidth 
 *          estimation
 *          protocol (such as most WebRTC peers).
 *        </li>
 *      </ul>
 *    </li>
 *  </ul>
 *  <p>
 *    <strong>
 *      All bandwidth control parameters must be set before the SDP negotiation
 *      takes place, and can't be modified afterwards.
 *    </strong>
 *  </p>
 *  <p>
 *    Take into consideration that setting a too high upper limit for the output
 *    bandwidth can be a reason for the network connection to be congested 
 *    quickly.
 *  </p>
 *
 * @abstract
 * @extends module:core/abstracts.SdpEndpoint
 *
 * @constructor module:core/abstracts.BaseRtpEndpoint
 *
 * @fires {@link module:core#event:ConnectionStateChanged ConnectionStateChanged}
 * @fires {@link module:core#event:MediaStateChanged MediaStateChanged}
 */
function BaseRtpEndpoint(){
  BaseRtpEndpoint.super_.call(this);
};
inherits(BaseRtpEndpoint, SdpEndpoint);


//
// Public properties
//

/**
 * Connection state.
 * <ul>
 *   <li>CONNECTED</li>
 *   <li>DISCONNECTED</li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getConnectionState
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getConnectionStateCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getConnectionState = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getConnectionState', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getConnectionStateCallback
 * @param {external:Error} error
 * @param {module:core/complexTypes.ConnectionState} result
 */

/**
 * Maximum outbound bitrate sent by this endpoint. Remote peers themselves might
 * also announce a maximum bitrate as part of their REMB bandwidth estimations, 
 * and
 * also as an SDP bitrate attribute (<code>b=AS:{value}</code>, see
 * <a href='https://datatracker.ietf.org/doc/html/rfc8866#section-5.8'
 *   >RFC 8866 Section 5.8. Bandwidth Information</a
 * >) in <i>sendrecv</i> and <i>recvonly</i> SDP Offers or Answers. Kurento will
 * always give priority to bitrate limitations specified by remote peers, over
 * internal configurations.
 * <p>
 *   With this parameter you can control the maximum video quality that will be
 *   sent when reacting to good network conditions. Setting this parameter to a
 *   high value permits the video quality to raise when the network conditions 
 *   get
 *   better.
 * </p>
 * <p>
 *   <strong>
 *     Note that the default <em>MaxVideoSendBandwidth</em> is a VERY 
 *     conservative
 *     value, and leads to a low maximum video quality. Most applications will
 *     probably want to increase this to higher values such as 2000 kbps (2 
 *     Mbps).
 *   </strong>
 * </p>
 * <p>
 *   The REMB congestion control algorithm works by gradually increasing the 
 *   output
 *   video bitrate, until the available bandwidth is fully used or the maximum 
 *   send
 *   bitrate has been reached. This is a slow, progressive change, which starts 
 *   at
 *   300 kbps by default. You can change the default starting point of REMB
 *   estimations, by setting <code>RembParams.rembOnConnect</code>.
 * </p>
 * <ul>
 *   <li>Unit: kbps (kilobits per second).</li>
 *   <li>Default: 500.</li>
 *   <li>
 *     0 = unlimited: the video bitrate will grow until all the available 
 *     network
 *     bandwidth is used by the stream.<br />
 *     Note that this might have a bad effect if more than one stream is running
 *     (as all of them would try to raise the video bitrate indefinitely, until 
 *     the
 *     network gets saturated).
 *   </li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getMaxVideoSendBandwidth
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getMaxVideoSendBandwidthCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getMaxVideoSendBandwidth = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getMaxVideoSendBandwidth', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getMaxVideoSendBandwidthCallback
 * @param {external:Error} error
 * @param {external:Integer} result
 */

/**
 * Maximum outbound bitrate sent by this endpoint. Remote peers themselves might
 * also announce a maximum bitrate as part of their REMB bandwidth estimations, 
 * and
 * also as an SDP bitrate attribute (<code>b=AS:{value}</code>, see
 * <a href='https://datatracker.ietf.org/doc/html/rfc8866#section-5.8'
 *   >RFC 8866 Section 5.8. Bandwidth Information</a
 * >) in <i>sendrecv</i> and <i>recvonly</i> SDP Offers or Answers. Kurento will
 * always give priority to bitrate limitations specified by remote peers, over
 * internal configurations.
 * <p>
 *   With this parameter you can control the maximum video quality that will be
 *   sent when reacting to good network conditions. Setting this parameter to a
 *   high value permits the video quality to raise when the network conditions 
 *   get
 *   better.
 * </p>
 * <p>
 *   <strong>
 *     Note that the default <em>MaxVideoSendBandwidth</em> is a VERY 
 *     conservative
 *     value, and leads to a low maximum video quality. Most applications will
 *     probably want to increase this to higher values such as 2000 kbps (2 
 *     Mbps).
 *   </strong>
 * </p>
 * <p>
 *   The REMB congestion control algorithm works by gradually increasing the 
 *   output
 *   video bitrate, until the available bandwidth is fully used or the maximum 
 *   send
 *   bitrate has been reached. This is a slow, progressive change, which starts 
 *   at
 *   300 kbps by default. You can change the default starting point of REMB
 *   estimations, by setting <code>RembParams.rembOnConnect</code>.
 * </p>
 * <ul>
 *   <li>Unit: kbps (kilobits per second).</li>
 *   <li>Default: 500.</li>
 *   <li>
 *     0 = unlimited: the video bitrate will grow until all the available 
 *     network
 *     bandwidth is used by the stream.<br />
 *     Note that this might have a bad effect if more than one stream is running
 *     (as all of them would try to raise the video bitrate indefinitely, until 
 *     the
 *     network gets saturated).
 *   </li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#setMaxVideoSendBandwidth
 *
 * @param {external:Integer} maxVideoSendBandwidth
 * @param {module:core/abstracts.BaseRtpEndpoint~setMaxVideoSendBandwidthCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.setMaxVideoSendBandwidth = function(maxVideoSendBandwidth, callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  //  
  // checkType('int', 'maxVideoSendBandwidth', maxVideoSendBandwidth, {required: true});
  //  

  var params = {
    maxVideoSendBandwidth: maxVideoSendBandwidth
  };

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'setMaxVideoSendBandwidth', params, callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~setMaxVideoSendBandwidthCallback
 * @param {external:Error} error
 */

/**
 * Media flow state.
 * <ul>
 *   <li>CONNECTED: There is an RTCP flow.</li>
 *   <li>DISCONNECTED: No RTCP packets have been received for at least 5 
 *   sec.</li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getMediaState
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getMediaStateCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getMediaState = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getMediaState', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getMediaStateCallback
 * @param {external:Error} error
 * @param {module:core/complexTypes.MediaState} result
 */

/**
 * Minimum inbound bitrate requested by this endpoint. Signaled to compatible
 * WebRTC and RTP senders, as part of the REMB bandwidth estimation protocol.
 * <p>
 *   This is used to set a minimum value of local REMB during bandwidth 
 *   estimation.
 *   The REMB estimation will then be sent to remote peers, causing them to send
 *   at least the indicated video bitrate. It follows that this parameter will 
 *   only
 *   have effect for remote peers that support the REMB bandwidth estimation
 *   protocol (such as e.g. most web browsers compatible with WebRTC).
 * </p>
 * <ul>
 *   <li>Unit: kbps (kilobits per second).</li>
 *   <li>Default: 0.</li>
 *   <li>
 *     Note: The actual minimum value is 30 kbps, even if a lower value is set.
 *   </li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getMinVideoRecvBandwidth
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getMinVideoRecvBandwidthCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getMinVideoRecvBandwidth = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getMinVideoRecvBandwidth', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getMinVideoRecvBandwidthCallback
 * @param {external:Error} error
 * @param {external:Integer} result
 */

/**
 * Minimum inbound bitrate requested by this endpoint. Signaled to compatible
 * WebRTC and RTP senders, as part of the REMB bandwidth estimation protocol.
 * <p>
 *   This is used to set a minimum value of local REMB during bandwidth 
 *   estimation.
 *   The REMB estimation will then be sent to remote peers, causing them to send
 *   at least the indicated video bitrate. It follows that this parameter will 
 *   only
 *   have effect for remote peers that support the REMB bandwidth estimation
 *   protocol (such as e.g. most web browsers compatible with WebRTC).
 * </p>
 * <ul>
 *   <li>Unit: kbps (kilobits per second).</li>
 *   <li>Default: 0.</li>
 *   <li>
 *     Note: The actual minimum value is 30 kbps, even if a lower value is set.
 *   </li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#setMinVideoRecvBandwidth
 *
 * @param {external:Integer} minVideoRecvBandwidth
 * @param {module:core/abstracts.BaseRtpEndpoint~setMinVideoRecvBandwidthCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.setMinVideoRecvBandwidth = function(minVideoRecvBandwidth, callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  //  
  // checkType('int', 'minVideoRecvBandwidth', minVideoRecvBandwidth, {required: true});
  //  

  var params = {
    minVideoRecvBandwidth: minVideoRecvBandwidth
  };

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'setMinVideoRecvBandwidth', params, callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~setMinVideoRecvBandwidthCallback
 * @param {external:Error} error
 */

/**
 * Minimum outbound bitrate sent by this endpoint.
 * <p>
 *   With this parameter you can control the minimum video quality that will be
 *   sent when reacting to bad network conditions. Setting this parameter to a 
 *   low
 *   value permits the video quality to drop when the network conditions get 
 *   worse.
 * </p>
 * <p>
 *   Note that if you set this parameter too high (trying to avoid bad video
 *   quality altogether), you would be limiting the adaptation ability of the
 *   congestion control algorithm, and your stream might be unable to ever 
 *   recover
 *   from adverse network conditions.
 * </p>
 * <ul>
 *   <li>Unit: kbps (kilobits per second).</li>
 *   <li>Default: 100.</li>
 *   <li>
 *     0 = unlimited: the video bitrate will drop as needed, even to the lowest
 *     possible quality, which could make the video completely blurry and
 *     pixelated, but would adapt better to losses caused by network congestion.
 *   </li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getMinVideoSendBandwidth
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getMinVideoSendBandwidthCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getMinVideoSendBandwidth = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getMinVideoSendBandwidth', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getMinVideoSendBandwidthCallback
 * @param {external:Error} error
 * @param {external:Integer} result
 */

/**
 * Minimum outbound bitrate sent by this endpoint.
 * <p>
 *   With this parameter you can control the minimum video quality that will be
 *   sent when reacting to bad network conditions. Setting this parameter to a 
 *   low
 *   value permits the video quality to drop when the network conditions get 
 *   worse.
 * </p>
 * <p>
 *   Note that if you set this parameter too high (trying to avoid bad video
 *   quality altogether), you would be limiting the adaptation ability of the
 *   congestion control algorithm, and your stream might be unable to ever 
 *   recover
 *   from adverse network conditions.
 * </p>
 * <ul>
 *   <li>Unit: kbps (kilobits per second).</li>
 *   <li>Default: 100.</li>
 *   <li>
 *     0 = unlimited: the video bitrate will drop as needed, even to the lowest
 *     possible quality, which could make the video completely blurry and
 *     pixelated, but would adapt better to losses caused by network congestion.
 *   </li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#setMinVideoSendBandwidth
 *
 * @param {external:Integer} minVideoSendBandwidth
 * @param {module:core/abstracts.BaseRtpEndpoint~setMinVideoSendBandwidthCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.setMinVideoSendBandwidth = function(minVideoSendBandwidth, callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  //  
  // checkType('int', 'minVideoSendBandwidth', minVideoSendBandwidth, {required: true});
  //  

  var params = {
    minVideoSendBandwidth: minVideoSendBandwidth
  };

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'setMinVideoSendBandwidth', params, callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~setMinVideoSendBandwidthCallback
 * @param {external:Error} error
 */

/**
 * Maximum Transmission Unit (MTU) used for RTP.
 * <p>
 *   This setting affects the maximum size that will be used by RTP payloads. 
 *   You
 *   can change it from the default, if you think that a different value would 
 *   be
 *   beneficial for the typical network settings of your application.
 * </p>
 * <p>
 *   The default value is 1200 Bytes. This is the same as in <b>libwebrtc</b> 
 *   (from
 *   webrtc.org), as used by
 *   <a
 *     href='https://dxr.mozilla.org/mozilla-central/rev/b5c5ba07d3dbd0d07b66fa42a103f4df2c27d3a2/media/webrtc/trunk/webrtc/media/engine/constants.cc#16'
 *     >Firefox</a
 *   >
 *   or
 *   <a
 *     href='https://source.chromium.org/chromium/external/webrtc/src/+/6dd488b2e55125644263e4837f1abd950d5e410d:media/engine/constants.cc;l=15'
 *     >Chrome</a
 *   >
 *   . You can read more about this value in
 *   <a
 *     href='https://groups.google.com/d/topic/discuss-webrtc/gH5ysR3SoZI/discussion'
 *     >Why RTP max packet size is 1200 in WebRTC?</a
 *   >
 *   .
 * </p>
 * <p>
 *   <b>WARNING</b>: Change this value ONLY if you really know what you are 
 *   doing
 *   and you have strong reasons to do so. Do NOT change this parameter just
 *   because it <i>seems</i> to work better for some reduced scope tests. The
 *   default value is a consensus chosen by people who have deep knowledge about
 *   network optimization.
 * </p>
 * <ul>
 *   <li>Unit: Bytes.</li>
 *   <li>Default: 1200.</li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getMtu
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getMtuCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getMtu = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getMtu', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getMtuCallback
 * @param {external:Error} error
 * @param {external:Integer} result
 */

/**
 * Maximum Transmission Unit (MTU) used for RTP.
 * <p>
 *   This setting affects the maximum size that will be used by RTP payloads. 
 *   You
 *   can change it from the default, if you think that a different value would 
 *   be
 *   beneficial for the typical network settings of your application.
 * </p>
 * <p>
 *   The default value is 1200 Bytes. This is the same as in <b>libwebrtc</b> 
 *   (from
 *   webrtc.org), as used by
 *   <a
 *     href='https://dxr.mozilla.org/mozilla-central/rev/b5c5ba07d3dbd0d07b66fa42a103f4df2c27d3a2/media/webrtc/trunk/webrtc/media/engine/constants.cc#16'
 *     >Firefox</a
 *   >
 *   or
 *   <a
 *     href='https://source.chromium.org/chromium/external/webrtc/src/+/6dd488b2e55125644263e4837f1abd950d5e410d:media/engine/constants.cc;l=15'
 *     >Chrome</a
 *   >
 *   . You can read more about this value in
 *   <a
 *     href='https://groups.google.com/d/topic/discuss-webrtc/gH5ysR3SoZI/discussion'
 *     >Why RTP max packet size is 1200 in WebRTC?</a
 *   >
 *   .
 * </p>
 * <p>
 *   <b>WARNING</b>: Change this value ONLY if you really know what you are 
 *   doing
 *   and you have strong reasons to do so. Do NOT change this parameter just
 *   because it <i>seems</i> to work better for some reduced scope tests. The
 *   default value is a consensus chosen by people who have deep knowledge about
 *   network optimization.
 * </p>
 * <ul>
 *   <li>Unit: Bytes.</li>
 *   <li>Default: 1200.</li>
 * </ul>
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#setMtu
 *
 * @param {external:Integer} mtu
 * @param {module:core/abstracts.BaseRtpEndpoint~setMtuCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.setMtu = function(mtu, callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  //  
  // checkType('int', 'mtu', mtu, {required: true});
  //  

  var params = {
    mtu: mtu
  };

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'setMtu', params, callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~setMtuCallback
 * @param {external:Error} error
 */

/**
 * Advanced parameters to configure the congestion control algorithm.
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#getRembParams
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~getRembParamsCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.getRembParams = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'getRembParams', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~getRembParamsCallback
 * @param {external:Error} error
 * @param {module:core/complexTypes.RembParams} result
 */

/**
 * Advanced parameters to configure the congestion control algorithm.
 *
 * @alias module:core/abstracts.BaseRtpEndpoint#setRembParams
 *
 * @param {module:core/complexTypes.RembParams} rembParams
 * @param {module:core/abstracts.BaseRtpEndpoint~setRembParamsCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.setRembParams = function(rembParams, callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  //  
  // checkType('RembParams', 'rembParams', rembParams, {required: true});
  //  

  var params = {
    rembParams: rembParams
  };

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'setRembParams', params, callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~setRembParamsCallback
 * @param {external:Error} error
 */


//
// Public methods
//

/**
 * Force sending a new keyframe request to the upstream elements in the Kurento
 * Pipeline, towards the associated producer. Only valid for video consumers.
 *
 * @alias module:core/abstracts.BaseRtpEndpoint.requestKeyframe
 *
 * @param {module:core/abstracts.BaseRtpEndpoint~requestKeyframeCallback} [callback]
 *
 * @return {external:Promise}
 */
BaseRtpEndpoint.prototype.requestKeyframe = function(callback){
  var transaction = (arguments[0] instanceof Transaction)
                  ? Array.prototype.shift.apply(arguments)
                  : undefined;

  var usePromise = false;
  
  if (callback == undefined) {
    usePromise = true;
  }
  
  if(!arguments.length) callback = undefined;

  callback = (callback || noop).bind(this)

  return disguise(this._invoke(transaction, 'requestKeyframe', callback), this)
};
/**
 * @callback module:core/abstracts.BaseRtpEndpoint~requestKeyframeCallback
 * @param {external:Error} error
 */


/**
 * @alias module:core/abstracts.BaseRtpEndpoint.constructorParams
 */
BaseRtpEndpoint.constructorParams = {
};

/**
 * @alias module:core/abstracts.BaseRtpEndpoint.events
 *
 * @extends module:core/abstracts.SdpEndpoint.events
 */
BaseRtpEndpoint.events = SdpEndpoint.events.concat(['ConnectionStateChanged', 'MediaStateChanged']);


/**
 * Checker for {@link module:core/abstracts.BaseRtpEndpoint}
 *
 * @memberof module:core/abstracts
 *
 * @param {external:String} key
 * @param {module:core/abstracts.BaseRtpEndpoint} value
 */
function checkBaseRtpEndpoint(key, value)
{
  if(!(value instanceof BaseRtpEndpoint))
    throw ChecktypeError(key, BaseRtpEndpoint, value);
};


module.exports = BaseRtpEndpoint;

BaseRtpEndpoint.check = checkBaseRtpEndpoint;
