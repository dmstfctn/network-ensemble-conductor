var PacketGrabber = require( './PacketGrabber.js' );

//what tshark info fields do you want?
var fields = [
	{ 
		identifier: 'frame.time_epoch',
		slug: 'timestamp',
		title: 'Timestamp'
	},
	{ 
		identifier: 'frame.len',
		slug: 'frame_length',
		title: 'Frame Length'
	},
	{ 
		identifier: 'frame.protocols',
		slug: 'protocols',
		title: 'Protocols'
	},
	{ 
		identifier: 'ip.src',
		slug: 'source_ip',
		title: 'Source IP'
	},
	{ 
		identifier: 'ip.dst',
		slug: 'destination_ip',
		title: 'Destination IP'
	},
	{ 
		identifier: 'wlan.sa',
		slug: 'source_mac',
		title: 'Source MAC'
	},
	{ 
		identifier: 'wlan.da',
		slug: 'destination_mac',
		title: 'Destination MAC'
	},
	{ 
		identifier: 'wlan',
		slug: 'wlan',
		title: 'wlan'
	},
	{ 
		identifier: 'data',
		slug: 'data',
		title: 'Data'
	}
];

var PacketDistributor = function( _interface, _bufferTime ){
	var that = this;
	this.bufferTime = _bufferTime || 1000;
	this.buffer = [];
	this.packetGrabber = new PacketGrabber(  fields, _interface );
	this.mode = PacketDistributor.MODES.ACCURATELY;
	this.packetGrabber.onPacket = function( packet ){
		that.updateBuffer( packet );
	}
	this.outputInterval = setInterval(function(){
		that.outputBuffer();
	}, this.bufferTime );
}

PacketDistributor.MODES = {
	ACCURATELY: 0,
	EQUALLY: 1,
	TYPE_ACCURATELY: 2,
	TYPE_EQUALLY: 3
};

PacketDistributor.MODE_COUNT = (function(){
	var c = 0;
	for( var i in PacketDistributor.MODES ){
		c++;
	}
	return c;
})();

PacketDistributor.prototype = {
	run: function(){
		this.packetGrabber.run();
	},
	stop: function(){
		this.packetGrabber.stop();
	},
	setMode: function( mode ){
		if( parseInt(mode) < PacketDistributor.MODE_COUNT ){
			mode = parseInt(mode);
			for( var i in PacketDistributor.MODES ){
				if( PacketDistributor.MODES[i] === mode ){
					this.mode = PacketDistributor.MODES[i];
					return true;
				}
			}
		}
		if( PacketDistributor.MODES[mode] !== 'undefined' ){
			this.mode = PacketDistributor.MODES[mode];
			return true;
		} else {
			console.log( 'Couldn\'t set that mode, not valid.' );
			return false;
		}
	},
	updateBuffer: function( packet ){
		this.buffer.push( packet );
	},
	copyBuffer: function( _buffer ){
		var copy = [];
		var buffer = _buffer || this.buffer;
		for( var i = 0; i < buffer.length; i++ ){
			copy.push( buffer[i] );
		}
		return copy;
	},
	spreadEqually: function( _buffer ){
		var that = this;
		var buffer = _buffer || this.buffer;
		if( buffer.length > 0 ){
			var retrieved = this.copyBuffer( buffer );
			var delayTime = 0;
			var index = 0;
			var delayStep = this.bufferTime / retrieved.length;
			while( delayTime < this.bufferTime ){
				if( index < retrieved.length ){
					(function( time, packet ){
						setTimeout( function(){							
							that._onPacket( packet );
						}, time );
					})( delayTime, retrieved[ index ] );
				}	
				
				delayTime += delayStep;
				index++;
			}
		}
	},
	spreadAccurately: function( _buffer ){
		var that = this;
		var buffer = _buffer || this.buffer;
		if( buffer.length > 0 ){
			//copy data
			var retrieved = this.copyBuffer( buffer );
			var startTime = parseFloat( retrieved[0].timestamp );
			if( isNaN( startTime ) ){
				startTime = 0;
			}
			for( var i = 0; i < retrieved.length; i++ ){
				var packetTime = parseFloat( retrieved[i].timestamp );
				if( isNaN( packetTime) ){
					packetTime = startTime;
				}
				var delayTime = packetTime - startTime;
				if( delayTime < 1 ){ delayTime = 1 };
				if( delayTime > this.bufferTime ){ delayTime = this.bufferTime };
				delayTime = Math.round( delayTime );
				(function( time, packet ){
					setTimeout( function(){
						that._onPacket( packet );
					}, time );					
				})( delayTime, retrieved[i] );
			}
		}
	},
	splitBufferByType: function( _buffer ){
		var types = {};
		var buffer = _buffer || this.buffer;
		for( var i = 0; i < buffer.length; i++ ){
			var packet = buffer[i];
			if( typeof types[ packet.type.category ] === 'undefined' ){
				types[ packet.type.category ] = [];
			}
			types[ packet.type.category ].push( packet );
		}
		return types;
	},
	spreadByTypeEqually: function( _buffer ){
		var that = this;
		var buffer = _buffer || this.buffer;
		if( buffer.length > 0 ){
			var retrieved = this.copyBuffer( buffer );
			var types = this.splitBufferByType( buffer );
			for( var i in types ){
				//console.log( types[i] );
				this.spreadEqually( types[i] );
			}
		}
	},
	spreadByTypeAccurately: function( _buffer ){
		var that = this;
		var buffer = _buffer || this.buffer;
		if( buffer.length > 0 ){
			var retrieved = this.copyBuffer( buffer );
			var types = this.splitBufferByType( buffer );
			for( var i in types ){
				this.spreadAccurately( types[i] );
			}
		}
	},
	outputBuffer: function(){
		//console.log( 'PACKETS PER SECOND: ' + this.buffer.length );
		if( this.mode === PacketDistributor.MODES.TYPE_ACCURATELY ){
			this.spreadByTypeAccurately();
		} else if( this.mode === PacketDistributor.MODES.TYPE_EQUALLY ){
			this.spreadByTypeEqually();
		} else if( this.mode === PacketDistributor.MODES.EQUALLY ){
			this.spreadEqually();
		} else {
			this.spreadAccurately();
		}
		this.buffer = [];
	},
	_onPacket: function( packet ){
		if( typeof this.onPacket === 'function' ){
			this.onPacket( packet );
		}
	},
	onPacket: function( packet ){ /* ... override  ... */}
}

module.exports = PacketDistributor;