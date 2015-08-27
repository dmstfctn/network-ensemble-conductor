// a million thanks to a combination of these two packages:
// Sudo: https://www.npmjs.com/package/sudo
// and Sudo Prompt: https://www.npmjs.com/package/sudo-prompt
// the cannibalisation of which helped me figure this out.

var child_process = require( 'child_process' );
var fs = require( 'fs' )
var os = require( 'os' );
var path = require( 'path' );

function escapeDoubleQuotes(string) {
  return string.replace(/"/g, '\\"');
}

var prepForOsascript = function( target, callback ){
	child_process.exec('which osascript', function(error, stdout, stderr) {
        if (error){ console.log( error ) };
        var source = stdout.trim();        
		fs.readFile(source, function(error, buffer) {
			if( error ){ console.log( error ) };
			fs.writeFile(target, buffer, function(error) {
				if( error ){ console.log( error ) };
				fs.chmod(target, 0755, callback);
			});
		});
	});
};

var osascriptPrompt = function( target, callback ){
	var command = '"' + escapeDoubleQuotes( target ) + '" -e \'do shell script "mkdir -p /var/db/sudo/$USER; touch /var/db/sudo/$USER" with administrator privileges\'';
	child_process.exec( command, function(error, stdout, stderr) {		
		if( /user canceled/i.test( error ) ){ 
			error = new Error('User did not grant permission.');
		}
		if( error ){
			return callback( error );
		}
		fs.unlink( target, callback );
	});
};

var sudoPrompt = function( _name, callback ){
	var title = _name || process.title;
	var target = path.join( os.tmpdir(), title );
	prepForOsascript( target, function(){
		osascriptPrompt( target, function(){
			callback();
		});
	});
}

var spawn = function( _name, _args, callback ){
	var args = ['-n'].concat( _args );
	var name = _name || 'Default';
	sudoPrompt( _name, function(){
		var proc = child_process.spawn( 'sudo', args );
		if( typeof callback === 'function' ){
			callback( proc );
		}
	});
}


module.exports = {
	'prompt': sudoPrompt,
	'spawn': spawn
};