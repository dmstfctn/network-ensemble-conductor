var os = require( 'os' );
var child_process = require( 'child_process' );

var PLAT_MAC = 'MAC';
var PLAT_BBB = 'BEAGLE';


var PLATFORM = (function(){
	if( os.type() == 'Linux'  ){
		return PLAT_BBB;
	}
	if( os.type() == 'Darwin' ){
		return PLAT_MAC;
	}
})();

var MAX_CHANNELS = 13;

var NetworkConnectionConfiguration = function( _iwinterface, _channel ){		
	console.log( _iwinterface );
	this.iface = _iwinterface;
	this.channel = _channel || 1;
	console.log( 'NetworkConnectionConfiguration initialisation. Platform: ' + PLATFORM + '. Interface: ' + this.iface + '. Channel: ' + this.channel );
	this.DEBUG = false;
	//this.dissociate();
};

NetworkConnectionConfiguration.prototype = {
	debugOn: function(){
		this.DEBUG = true;
	},
	debugOff: function(){
		this.DEBUG = false
	},
	up: function( callback ){
		var configProcess;
		if( PLATFORM === PLAT_BBB ){
			configProcess = child_process.spawn( 'ifup', [ this.iface ] );
		} else if( PLATFORM === PLAT_MAC ){
			configProcess = child_process.spawn( 'ifconfig', [ this.iface, 'up' ] );
		}
		configProcess.on( 'error', function( err ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Up Error:' );
				console.log( err );
			}
			configProcess.kill();
		});
		configProcess.stdout.on( 'data', function( data ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Up Msg: ');
				console.log( data );
			}
		});
		configProcess.on('close', function(){
			if( this.DEBUG ){
				console.log( 'NetConConf: Up Closed.');
			}
			if( typeof callback === 'function' ){
				callback();
			}
		});
	},
	down: function( callback ){
		var configProcess;
		if( PLATFORM === PLAT_BBB ){
			configProcess = child_process.spawn( 'ifdown', [ this.iface ] );
		} else if( PLATFORM === PLAT_MAC ){
			configProcess = child_process.spawn( 'ifconfig', [ this.iface, 'down' ] );
		}
		configProcess.on( 'error', function( err ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Down Error:' );
				console.log( err );
			}
			configProcess.kill();
		});
		configProcess.stdout.on( 'data', function( data ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Down Msg: ');
				console.log( data );
			}
		});
		configProcess.on('close', function(){
			if( this.DEBUG ){
				console.log( 'NetConConf: Down Closed.');
			}
			if( typeof callback === 'function' ){
				callback();
			}
		})
	},
	dissociate: function( callback ){
		var configProcess;
		if( PLATFORM === PLAT_BBB ){
			// this should dissociate from the network
			configProcess = child_process.spawn( 'iwconfig', [ this.iface, 'ap', '00:00:00:00:00:00' ] );
		} else if( PLATFORM === PLAT_MAC ){
			configProcess = child_process.spawn( '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport', ['-z'] );	
		}
		configProcess.on( 'error', function( err ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Dissociate Error:' );
				console.log( err );
			}
			configProcess.kill();
		});
		configProcess.stdout.on( 'data', function( data ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Dissociate Msg: ');
				console.log( data );
			}
		});
		configProcess.on('close', function(){
			if( this.DEBUG ){
				console.log( 'NetConConf: Dissosciate Closed.');
			}
			if( typeof callback === 'function' ){
				callback();
			}
		})
	},
	changeChannelByFraction: function( val, callback ){
		// val should be 0 - 1 
		if( val > 1 ){
			val = 1;
		}
		if( val < 0 ){
			val = 0;
		}
		if( this.DEBUG ){
			console.log( 'CHANNEL VAL: ' + val );
		}
		var channel = Math.round( MAX_CHANNELS * val );
		if( channel !== this.channel ){
			if( this.DEBUG ){
				console.log( 'CHANNEL: ' + channel );
			}
			this.changeChannel( channel, callback );
		}
	},
	changeChannel: function( to, callback ){
		var configProcess;
		var arg;
		var channel = parseInt(to);
		if( channel > MAX_CHANNELS ){
			channel = MAX_CHANNELS;
		} else if( channel < 1 ){
			channel = 1;
		}
		if( PLATFORM === PLAT_BBB ){
			configProcess = child_process.spawn( 'iwconfig', [ this.iface, 'channel', channel ] );
			/* there is also the potential to change to frequencies, when using iwconfig. From the man page:
				freq/channel
					Set the operating frequency or channel in the  device.  A  value
					below 1000 indicates a channel number, a value greater than 1000
					is a frequency in Hz. You may append the suffix k, M or G to the
					value  (for  example,  "2.46G"  for  2.46 GHz frequency), or add
					enough ’0’.
			*/
		} else if( PLATFORM === PLAT_MAC ){
			arg = '--channel=' + to;
			configProcess = child_process.spawn( '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport', [ arg ] );	
		}
		configProcess.on('error', function( err ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Channel Change Error:' );
				console.log( err );
			}
			configProcess.kill();
		});
		configProcess.stdout.on( 'data', function( data ){
			if( this.DEBUG ){
				console.log( 'NetConConf: Channel Change Msg: ');
				console.log( data );
			}
		});
		configProcess.on('close', function(){
			if( this.DEBUG ){
				console.log( 'NetConConf: Channel Change Closed.');
			}
			if( typeof callback === 'function' ){
				callback();
			}
		})
		this.channel = channel;
	},
	nextChannel: function( callback ){
		var channel = this.channel;
		channel++;
		if( channel > MAX_CHANNELS ){
			channel = 1;
		} else if( channel < 1 ){
			channel = MAX_CHANNELS;
		}
		this.changeChannel( channel, callback );
	},
	prevChannel: function( callback ){
		var channel = this.channel;
		channel--;
		if( channel > MAX_CHANNELS ){
			channel = 1;
		} else if( channel < 1 ){
			channel = MAX_CHANNELS;
		}
		this.changeChannel( channel, callback );
	}
}

module.exports = NetworkConnectionConfiguration;