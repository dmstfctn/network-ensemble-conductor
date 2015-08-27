// SETUP
var _o = {
	VERSION: '0.0.18',
	DEBUG : false
};

// UTILS

	// MAP VALUE
	//
	// maps a value from one range to another
	// ta Processing: http://processing.org
	// NOTE: does not clamp the values
	//
	_o.mapValue = function( val, origMin, origMax, newMin, newMax ){
		return newMin + ( newMax - newMin ) * ( ( val - origMin ) / ( origMax - origMin ) );
	};

	// MAP VALUE & CLAMP TO NEW RANGE
	//
	// functions like _o.mapValue, but clamps to new range
	//
	_o.clampValue = function( val, origMin, origMax, newMin, newMax ){
		var low = ( newMin > newMax ) ? newMax : newMin;
		var high = ( newMin > newMax ) ? newMin : newMax;
		var result = low + ( high - low ) * ( ( val - origMin ) / ( origMax - origMin ) );
		return ( result > high ) ? high : (result < low ) ? low : result;
	};

	// RANDOM RANGE
	// gives us a range of values
	_o.randomRange = function( fromValue, toValue ){
		return fromValue + ( Math.random() * ( toValue - fromValue ) );
	};

	// RANDOM HEX COLOUR CODE
	// gives us a 6 digit hexadecimal string, prefixed with a hash ( pass true to remove hash );
	_o.randomHexClr = function( removeHash ){
		var hex = '';
		if( !removeHash ){
			hex += '#';
		}
		for( var i = 0; i < 6; i++ ){
			hex += Math.floor( _o.randomRange(0,16) ).toString(16);
		}
		return hex;
	};

	//ABS
	//absolute value, taken from: http://www.soundstep.com/blog/experiments/jsdetection/js/app.js
	_o.abs = function( value ) {
		return (value ^ (value >> 31)) - (value >> 31);
	};

	// DEGREE / RADIANS CONVERSION
	// 2 functions to convert between degrees and radians
	_o.d2r = function( deg ){
		return deg * ( Math.PI / 180 );
		};
	_o.r2d = function( rad ){
		return rad * ( 180 / Math.PI );
	};


// VECTORS
// basic 2d vector class, courtesy L A Watts...
// 3d version ( _o.vec ) added, 2d remains for compatibility
_o.vec2D = function( x, y ){
	this.x = x || 0;
	this.y = y || 0;
};

_o.vec2D.prototype = {
	copyFrom: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
	},
	plus: function( vect ){
		this.x += vect.x;
		this.y += vect.y;
	},
	equals: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
	},
	mult: function( val ){
		this.x *= val;
		this.y *= val;
	},
	constrain: function( val ){
		this.x = ( this.x > val ) ? val : this.x;
		this.y = ( this.y > val ) ? val : this.y;
	}
};

// VECTORS
// basic 3d vector class
_o.vec = function( x, y, z ){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

_o.vec.prototype = {
	copyFrom: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
		this.z = vect.z;
	},
	plus: function( vect ){
		this.x += vect.x;
		this.y += vect.y;
		this.z += vect.z;
	},
	equals: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
		this.z = vect.z;
	},
	mult: function( val ){
		this.x *= val;
		this.y *= val;
		this.z *= val;
	},
	constrain: function( val ){
		this.x = ( this.x > val ) ? val : this.x;
		this.y = ( this.y > val ) ? val : this.y;
		this.z = ( this.z > val ) ? val : this.z;
	},
	distanceTo: function( vect ){
		var xD = vect.x - this.x;
		var yD = vect.y - this.y;
		var zD = vect.z - this.z;
		return Math.sqrt( (xD * xD) + (yD * yD) + (zD * zD) );
	}
};

module.exports = _o;