var osc = require( 'node-osc' );

var OSCOut = function( _port ){
	this.oscPort = _port || 12099;
	this.lastSend = ( new Date() ).getTime();
	this._ACTIVE = false;
	//this.initClient();
};

OSCOut.prototype = {
	setPort: function( to ){
		this.port = to;
		this.stop();
		this.initClient();
	},
	initClient: function(){
		this.client = new osc.Client( '127.0.0.1', this.oscPort );	
		this.client.send( '/fields', 'category,name,timestamp,frame_length,source_ip,destination_ip,source_mac,destination_mac,wlan' );
		this._ACTIVE = true;
	},
	start: function(){
		this.initClient();
	},
	stop: function(){
		console.log( 'OSCOut.stop() not implemented.' );
		this.client.kill();
		this._ACTIVE = false;
		//cancel that, somehow, so we can use a new port
	},
	addPacket: function( packet ){
		this.send( packet );
	},
	send: function( packet ){
		if( this._ACTIVE ){
			var now = (new Date()).getTime();		
			if( now - this.lastSend > 50 ){ //don't overload it, yeah?
				this.lastSend = now;
				this.client.send(
					'/packet', 
					packet.type.category, 
					packet.type.name,
					packet.timestamp,
					parseInt( packet.frame_length ),
					packet.source_ip,
					packet.destination_ip,
					packet.source_mac,
					packet.destination_mac,
					packet.wlan
				);	
			}
		}
	}
};

module.exports = OSCOut;