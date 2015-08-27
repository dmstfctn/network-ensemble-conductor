var child_process = require('child_process');
var Speaker = require( 'speaker' );
var Stream = require( 'stream' );
var Buffer = require( 'buffer' );

var sampleRates = (function(){
	// var div = 88200;
	//var div = 44100;
	var div = 22050;
	//var div = 8192;
	var sr = [];
	for( var i = 0; i < 10; i++ ){
		sr.push( div );
		div = div/2;
	}
	return sr;
})();

var sampleRepeats = (function(){	
	var sr = [1, 2, 3, 4, 6, 8, 10, 15, 20, 25 ];
	var val = 32;
	for( var i = 0; i < 6; i++ ){
		sr.push( val );
		val = val * 2;
	}
	return sr;
})();


var SpeakerDataPlayer = function( _sampleRate, _sampleRepeat ){
	var that = this;
	this.sampleRate = _sampleRate || 11025;
	this.maxBufferLength = this.sampleRate * 2;
	this.minSampleRepeat = sampleRepeats[ 0 ];
	this.maxSampleRepeat = sampleRepeats[ sampleRepeats.length - 1 ];
	//this.sampleRepeat = this.minSampleRepeat;	
	this.sampleRepeat = _sampleRepeat || sampleRepeats[10];
	this.process = child_process.fork( __dirname + '/SpeakerDataPlayer_child.js' );
	this.process.send({
		config: {
			sampleRate: this.sampleRate,			
			sampleRepeat: this.sampleRepeat,
			init: true
		}
	});

	this.process.on('message', function( m ){
		console.log( 'Speaker Data Player Child message: ' );
		console.log( m );
	});
};

SpeakerDataPlayer.prototype = {
	addPacket: function( packet ){
		this.process.send({ data: packet.data });
	},
	changeSampleRepeatGraduallyByFraction: function( val ){
		var newSampleRepeat = (val * ( this.maxSampleRepeat - this.minSampleRepeat )) + this.minSampleRepeat;
		if( newSampleRepeat !== this.sampleRepeat ){
			this.sampleRepeat = newSampleRepeat;
			//console.log( 'SAMPLE SKIP: ' + this.sampleRepeat );
			this.process.send({
				config: {
					sampleRepeat: this.sampleRepeat,
				}
			});
		}
	},
	changeSampleRepeatInStepsByFraction: function( val ){
		var index = Math.floor( val * (sampleRepeats.length - 1) );
		var newSampleRepeat = sampleRepeats[ index ];
		if( newSampleRepeat !== this.sampleRepeat ){
			this.sampleRepeat = newSampleRepeat;
			//console.log( 'SAMPLE SKIP: ' + this.sampleRepeat + " (" + index + ")" );
			this.process.send({
				config: {
					sampleRepeat: this.sampleRepeat,
				}
			});
		}
	},
	changeGain: function( to ){
		this.process.send({
			config: {
				gain: to
			}
		});
	}
};

module.exports = SpeakerDataPlayer;