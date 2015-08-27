/*
	- list all devices (NetworkDevices.js)
	- choose one
	- ask for permission
	- initialise packetDistributor
	- 
*/

/*var Audio = new AudioContext();
var bufferSize = 2048;
var processor = Audio.createScriptProcessor( bufferSize, 0, 1 );
var samp = -1;

var pulse = true;
setInterval( function(){
	pulse = true;
	console.log( 'pulse' );
	setTimeout( function(){
		pulse = false;
		console.log( 'pulse end' );
	}, 70);
}, 100);

processor.onaudioprocess = function( e ){
	var out = e.outputBuffer.getChannelData( 0 );
	for(var i = 0; i<out.length; i++ ){
		if( pulse ){
			if( i % Math.floor(bufferSize*0.001) === 0 ){
				samp = samp * -1;
			}
			out[i] = samp;
		} else {
			out[i] = 0;
		}
 	}
}

processor.connect( Audio.destination );*/

var gui = require('nw.gui');
var NetworkEnsemble = require('./modules/NetworkEnsemble.js');
var UI = require('./modules/UI.js');

var ne = new NetworkEnsemble();
var ui = new UI();

ne.onReady = function(){
	ui.populateStartPage( ne.interfaces, function( result ){
		console.log( 'RESULT' );
		ne.setInterface( result );
		ui.enableStartButton();
		ui.onStart = function(){
			ne.run();
			ui.hideStartPage( function(){
				ui.enablePacketFilters(function( result ){
					//console.log( 'Filter result: ', result );
					ne.setFilter( result );
				});
				ui.enableModeSelection(function( result ){
					//console.log( 'Mode result: ', result );
					ne.setMode( result );
				});
				ui.enableRawSpeed(function( result ){
					ne.setRawSpeed( result );
				});
				ui.showMainPage(function(){

				});
			});
		}
	});	
};
