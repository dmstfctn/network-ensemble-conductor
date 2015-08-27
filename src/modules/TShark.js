var child_process = require( 'child_process' );
var EscalatePerm = require( './EscalatePerm.js' );

var TShark = function( _flags, _encoding, _parseRaw ){
	this.flags = _flags.split( ' ' );
	this.encoding = _encoding || false;
	this.process = null;
	this.parseRaw = _parseRaw || false;
};

TShark.prototype = {
	run: function(){
		var that = this;
	
		EscalatePerm.spawn( 'Network Ensemble', [__dirname + '/../bin/Wireshark.app/Contents/Resources/bin/tshark'].concat( this.flags ), function( _process ){
			that.process = _process;
			if( that.encoding ){
				that.process.stdout.setEncoding( that.encoding );
				that.process.stderr.setEncoding( that.encoding );
			}
			that.process.stdout.on('data', function( data ){
				that._stdout( data );
			});
			that.process.stderr.on('data', function( data ){
				that._stderr( data );
			});
			that.process.on('error', function( err ){
				console.warn('tshark error: ', err );
			});
			that.process.on('close', function (code) {
				that._onEnd();
				console.log('tshark exited with code ' + code);
			});
		});		
	},
	stop: function(){
		this.process.kill();
	},
	_stdout: function( data ){
		var parsed = false;
		if( this.parseRaw ){
			parsed = {
				hex: this.extractHex( data ),
				packets: this.extractPackets( data )
			};
		}
		if( typeof this.stdout === 'function' ){
			this.stdout( data, parsed );
		}
	},
	_stderr: function( data ){
		if( typeof this.stderr === 'function' ){
			this.stderr( data );
		}
	},
	_onEnd: function(){
		if( typeof this.onEnd === 'function' ){
			this.onEnd();
		}	
	},
	stdout: function( data ){ /* ... override ... */ },
	stderr: function( data ){ /* ... override ... */ },
	onEnd: function(){ /* ... override ... */ },
	removeASCII: function( raw ){
	    var hexLines = raw.split('\n');
	    var hex = '';
	    for( var j = 0; j < hexLines.length; j++ ){
	        var line = hexLines[j];
	        var parts = line.split( ' ' );
	        if( parts.length === 21 ){
	            for( var k = 2; k < 18; k++ ){;
	                if( !isNaN( parseInt( parts[k], 16 ) ) ){
	                    hex += parts[k];
	                }
	            }
	        }
	    }
	    return hex;
	},
	extractHex: function( data ){
	    var sections = data.split( '\n\n' );
	    var hex = '';
	    for( var i = 0; i < sections.length; i++ ){
	        if( sections[i].indexOf( '\n') != -1 ){
	            hex += this.removeASCII( sections[i] );
	        }
	    }
	    return hex;
	},
	extractTimestamp: function( header ){
	    var sections = header.trim().split( ' ' );
	    return sections[1];
	},
	extractPackets: function( data ){
	    var sections = data.split( '\n\n' );
	    var packets = [];
	    for( var i = 0; i < sections.length; i++ ){
	         if( sections[i].indexOf( '\n') === -1 ){
	            var timestamp = this.extractTimestamp( sections[i] );
	            if( timestamp && timestamp.length > 0 ){
	                var packet = {                
	                    'header': sections[i],
	                    'timestamp': timestamp,
	                    'length': 0,
	                    'hex': ''
	                };
	                if( typeof sections[i + 1] !== 'undefined' ){
	                    if( sections[i + 1].indexOf( '\n') != -1 ){
	                        packet.length = sections[i+1].length;
	                        packet.hex = this.removeASCII( sections[ i + 1 ] );;
	                    }
	                }
	                packets.push( packet );
	            }
	         }
	    }
	    return packets;
	}
};

module.exports = TShark;