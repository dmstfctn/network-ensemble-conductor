var child_process = require( 'child_process' );

var NetworkDevices = {
	list: function( callback ){
		child_process.exec('ifconfig', function( err, stdin, stderr ){
			var result = [];
			if(err){
				console.log( err )
			} else {
				var lines = stdin.split('\n');
				for( var i = 0; i < lines.length; i++ ){
					var line = lines[i];
					if( line.slice( 0,2) === 'en' ){
						result.push( line.split(':')[0] );
					}
				}
			}
			this.devices = result;
			if( typeof callback === 'function' ){
				callback( result );
			}
		})
	}
};

module.exports = NetworkDevices;