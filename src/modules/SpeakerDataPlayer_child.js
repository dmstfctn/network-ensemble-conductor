var Speaker = require( 'speaker' );
var Stream = require( 'stream' );
var Buffer = require( 'buffer' );

var sampleRepeats = (function(){
	var val = 1;
	var sr = [];
	for( var i = 0; i < 10; i++ ){
		sr.push( val );
		val = val * 2;
	}
	return sr;
})();


var SpeakerDataPlayer_child = function( _sampleRate, sampleRepeat ){
	var that = this;
	this.sampleRate = _sampleRate || 22050;
	this.maxBufferLength = this.sampleRate * 2;
	this.minSampleRepeat = 1;
	this.maxSampleRepeat = this.sampleRate / 2;
	this.sampleRepeat = sampleRepeat || this.minSampleRepeat;	
	this.gain = 0.5;
	this.data_buffer = [];
	this.initSpeaker();
	this.initStream();
	this.stream.pipe( this.speaker );
};

SpeakerDataPlayer_child.prototype = {
	initSpeaker: function(){
		this.speaker = new Speaker({
			channels: 1,
			bitDepth: 8,
			signed: false,
			sampleRate: this.sampleRate,
			samplesPerFrame: 256
		});
	},
	initStream: function(){
		var that = this;
		this.stream = new Stream.Readable();
		this.stream._read = function( bytes ){
			//console.log( 'REQUEST BUFFER. ', 'NEED: ' + bytes, 'HAVE: ' + that.data_buffer.length, 'INCLUDING REPEAT: ' + that.data_buffer.length * that.sampleRepeat );
			var outputLength = Math.floor( bytes );
			var buf = new Buffer.Buffer( outputLength );
			var outputSampleIndex = 0;
			var inputSampleIndex = 0;
			while( outputSampleIndex < outputLength ){
				//var digit = 128; //central value - if no sound, this will be output for silence
				var digit = 0; //central value - if no sound, this will be output for silence
				if( inputSampleIndex < that.data_buffer.length ){					
					//digit = that.data_buffer[inputSampleIndex];
					digit = that.data_buffer.shift();
					digit += that.data_buffer.shift();
					digit = parseInt( digit, 16 );
					digit = Math.floor(digit / 2);
					//digit = parseInt( digit * that.gain ); // gain doesn't actually work - just creates some fucking weird offset...	
					for( var j = 0; j < that.sampleRepeat; j++ ){
						if( outputSampleIndex < buf.length ){
							if( outputSampleIndex % 2 === 0 ){
								var val = 128 + digit;
								if( val > 255 ){
									val = 255
								}
								if( val < 0 ){
									val = 0;
								}
								buf.writeUInt8( val, outputSampleIndex );							
							} else {
								var val = 128 - digit;
								if( val > 255 ){
									val = 255
								}
								if( val < 0 ){
									val = 0;
								}
								buf.writeUInt8( val, outputSampleIndex );							
							}
						} else {
							break;
						}
						outputSampleIndex++;
						// if( outputSampleIndex < buf.length ){
						// 	buf.writeUInt8( 128 - digit, outputSampleIndex );							
						// } else {
						// 	break;
						// }
						// outputSampleIndex++;
					}
					inputSampleIndex++;
				} else {
					if( outputSampleIndex % 2 === 0 ){
						var val = 128 + digit;
						if( val > 255 ){
							val = 255
						}
						if( val < 0 ){
							val = 0;
						}
						buf.writeUInt8( val, outputSampleIndex );							
					} else {
						var val = 128 - digit;
						if( val > 255 ){
							val = 255
						}
						if( val < 0 ){
							val = 0;
						}
						buf.writeUInt8( val, outputSampleIndex );							
					}
					outputSampleIndex++;
					// if( outputSampleIndex < buf.length ){
					// 	buf.writeUInt8( 128 + digit, outputSampleIndex );						
					// }
					// outputSampleIndex++;
					// if( outputSampleIndex < buf.length ){
					// 	buf.writeUInt8( 128 - digit, outputSampleIndex )
					// }
					// outputSampleIndex++;

				}
			}
			this.push( buf );
		}
	},
	addPacketData: function( data ){
		var data = data.split('');
		/*var byteCount = Math.floor( data.length / 2 );
		if( this.data_buffer.length + byteCount > this.maxBufferLength ){
			var overage = ( this.data_buffer.length + byteCount ) - this.maxBufferLength;
			this.data_buffer = this.data_buffer.slice( overage, this.data_buffer.length );
		}
		while( data.length > 0 ){
			digit = data.shift();
			digit += data.shift();
			digit = parseInt( digit, 16 );
			this.data_buffer.push( digit );
			//console.log( 'Data remaining to add: ' + data.length );
		}*/
		if( data.length > this.maxBufferLength ){
			//this.data_buffer = this.data_buffer.concat( data );	
			this.data_buffer = data.length( data.length - this.maxBufferLength );
		} else {
			if( this.data_buffer.length + data.length > this.maxBufferLength ){
				var overage = ( this.data_buffer.length + data.length ) - this.maxBufferLength;
				this.data_buffer = this.data_buffer.slice( overage, this.data_buffer.length );
			}
			this.data_buffer = this.data_buffer.concat( data );	
		}
	},
	addPacket: function( packet ){
		this.addPacketData( packet.data );
	},
	setGain: function( to ){
		if( to > 1 ){
			to = 1;
		}
		if( to < 0 ){
			to = 0;
		}
		this.gain = to;
	},
	setSampleRepeat: function( to ){
		to = parseInt( to );
		if( typeof to !== 'number' ){
			return false;
		}
		if( to < this.minSampleRepeat ){
			to = this.minSampleRepeat;
		}
		if( to > this.maxSampleRepeat ){
			to = this.maxSampleRepeat;
		}
		this.sampleRepeat = to;
	}
};

var player;
var configured = false;
var sampleRate;

process.on('message', function( m ){
	if( m.config ){
		if( typeof m.config.sampleRate !== 'undefined'  ){
			sampleRate = m.config.sampleRate;
			//console.log( 'Speaker process, sample rate: ' + sampleRate );
		}
		if( typeof m.config.sampleRepeat !== 'undefined'  ){
			sampleRepeat = m.config.sampleRepeat;
			//console.log( 'Speaker process, sample repeat: ' + sampleRepeat );
			if( configured ){
				player.setSampleRepeat( sampleRepeat );
				//process.send({'message': 'New sample skip: ' + sampleRepeat });
			}
		}
		if( typeof m.config.init !== 'undefined' ){
			player = new SpeakerDataPlayer_child( sampleRate, sampleRepeat );
			//console.log( 'Speaker process, Cnfigured: ' + 'true' );
			configured = true;
		}
		if( typeof m.config.gain !== 'undefined'  ){
			if( configured ){
				//console.log( 'Speaker process, setting gain to ' + m.config.gain );
				player.setGain( m.config.gain );
			}
		}
	}
	if( typeof m.data !== 'undefined'  ){
		if( configured ){
			//console.log( 'Speaker process, receive ' + m.data.length + ' data.' );
			player.addPacketData( m.data );
		}
	}
});

module.exports = SpeakerDataPlayer_child;