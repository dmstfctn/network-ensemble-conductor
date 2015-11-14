/*
 ** Available modes of audio output:
 ** mute 	no audio out
 ** raw 	outputs raw byte data
 ** packet 	outputs a pulse on each packet. This is set in a 
 **			way that provides enough power to trigger a MOSFET 
 **			to drive electrical components. For workshops, but 
 **			kept here as it could be useful.
 */
var MODES = [ 'mute', 'raw', 'packet' ];

var AudioOut = function( _bufferSize ){
	var that = this;

	//general audio setup
	this.actx = new window.AudioContext();
	this.bufferSize = _bufferSize || 2048;		
	this.processor = this.actx.createScriptProcessor( this.bufferSize, 0, 1 );
	this.processor.onaudioprocess = function( e ){
		var out = e.outputBuffer.getChannelData( 0 );
		that.onAudioProcess( out );			
	};

	// modes
	this.mode = 0; // mute by default

	// raw data output settings	
	this.dataBuffer = [];
	this.maxBufferSize = this.actx.sampleRate * 2;
	this.sampleRepeat = 2;

	// packet pulse output settings
	this.wavePeriod = Math.floor( this.bufferSize * 0.001 );
	this.samp = 1;
	this.pulse = false;
	this.pulsePeriod = 50;	
	this.pulseTime = this.pulsePeriod * 0.7;
	this.lastPulseAt = (new Date()).getTime();
	this.pulseTimer;
};

AudioOut.prototype = {
	setMode: function( _mode ){
		if( typeof _mode === 'number' ){
			if( _mode < 0 || _mode > MODES.length - 1 ) console.log( 'AudioOut: Specified mode out of range. Clamping.' );
			if( _mode < 0 ) _mode = 0;
			if( _mode > MODES.length - 1 ) _mode = MODES.length - 1;
			this.mode = _mode;
		}
		if( typeof _mode === 'string' ){
			var index = MODES.indexOf( _mode );
			if( index !== -1 ){
				this.mode = index;
			} else {
				console.log( 'AudioOut: Specified mode invaid. Ignoring.' );
			}
		}
		clearTimeout( this.pulseTimer );
		this.pulse = false;
		this.emptyBuffer();
	},
	emptyBuffer: function(){
		this.dataBuffer = [];
	},
	setSampleRepeat: function( _to ){
		if( _to < 1 ) _to = 1;
		if( _to > this.bufferSize/2 ) _to = this.bufferSize/2;
		this.sampleRepeat = _to;
	},
	run: function(){
		this.processor.connect( this.actx.destination );
	},
	stop: function(){
		this.processor.disconnect();
	},
	addPacket: function( packet ){
		var that = this;
		var now = (new Date()).getTime();
		// add raw data
		var data = packet.data.split('');
		if( data.length > this.maxBufferSize ){
			this.dataBuffer = data.slice( data.length - this.maxBufferSize );
		} else {
			if( this.dataBuffer.length + data.length > this.maxBufferSize ){
				var overage = ( this.dataBuffer.length + data.length ) - this.maxBufferSize;
				this.dataBuffer = this.dataBuffer.slice( overage, this.dataBuffer.length );
			}
			this.dataBuffer = this.dataBuffer.concat( data );
		}

		if( this.mode === MODES.indexOf('packet') ){
			if( !this.pulse && now - this.lastPulseAt >= this.pulsePeriod ){
				this.pulse = true;
				this.lastPulseAt = now;
				clearTimeout( this.pulseTimer );
				this.pulseTimer = setTimeout( function(){
					that.pulse = false;
				}, this.pulseTime );
			}
		}
	},
	fillBufferRaw: function( out, _buffer ){
		var outIndex = 0;
		var buffer = _buffer || this.dataBuffer;
		while( outIndex < out.length ){
			var digit = 0;
			if( this.dataBuffer.length >= 2 ){
				digit = this.dataBuffer.shift();
				digit += this.dataBuffer.shift();
				digit = parseInt( digit, 16 );
				digit = digit / 255;
			}
			for( var i = 0; i < this.sampleRepeat; i++ ){
				if( outIndex < out.length ){
					digit = digit * -1;
					out[outIndex] = digit;
					outIndex++;
				} else {
					break;
				}
			}
		}		
	},
	fillBufferPacketPulse: function( out ){
		for(var i = 0; i < out.length; i++ ){
			if( this.pulse ){
				if( i % this.wavePeriod === 0 ){
					this.samp = this.samp * -1;
				}
				out[i] = this.samp;
			} else {
				out[i] = 0;
			}
	 	}
	 },
	onAudioProcess: function( out ){
		if( this.mode === MODES.indexOf('mute') ) return;

		if( this.mode === MODES.indexOf('raw') ){
			this.fillBufferRaw( out  );
		}

		if( this.mode === MODES.indexOf('packet') ){
			this.fillBufferPacketPulse( out );
		}
	}
};

module.exports = AudioOut;