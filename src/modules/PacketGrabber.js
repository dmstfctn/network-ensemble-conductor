var TS = require( './TShark.js' );

var PacketGrabber = function( _fields, _interface, _config ){
	var that = this;
	this.FIELD_SEPARATOR = '\t';
	this.config = _config;
	this.fields = _fields;
	this.fieldsAsFlags = this.fieldsToFlags( this.fields );
	this.interface = _interface;
	this.ts = new TS( '-I -E separator=' + this.FIELD_SEPARATOR + ' -T fields ' + this.fieldsAsFlags + ' -i ' + this.interface, 'ascii', false );
	this.ts.stdout = function( data ){
		that.parseData( data );
	};
};

PacketGrabber.config = {
    "packets": [
        {
            "name": "Block Acknowledgement",
            "searchString": "Block Ack",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Action No Acknowledgement",
            "searchString": "Action No Ack",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Acknowledgement",
            "searchString": "Acknowledgement",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Request to Send",
            "searchString": "Request-to-send",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Clear To Send",
            "searchString": "Clear-to-send",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Probe Request",
            "searchString": "Probe Request",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Probe Response",
            "searchString": "Probe Response",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Deauthentication",
            "searchString": "Deauthentication",
            "category": "Gatekeeping",
            "categoryIndex": 3
        },
        {
            "name": "Authentication",
            "searchString": "Authentication",
            "category": "Gatekeeping",
            "categoryIndex": 3
        },
        {
            "name": "Beacon Frame",
            "searchString": "Beacon Frame",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Reassociation Request",
            "searchString": "Reassociation Request",
            "category": "Gatekeeping",
            "categoryIndex": 3
        },
        {
            "name": "Association Request",
            "searchString": "Association Request",
            "category": "Gatekeeping",
            "categoryIndex": 3
        },
        {
            "name": "Disassociate",
            "searchString": "Disassociate",
            "category": "Gatekeeping",
            "categoryIndex": 3
        },
        {
            "name": "Grant Acknowledgement",
            "searchString": "Grant Acknowledgement",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Grant",
            "searchString": "Grant",
            "category": "Communication",
            "categoryIndex": 1
        },
        {
            "name": "Control Frame Acknowledgement",
            "searchString": "CF-Acknowledgement",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Control Frame Acknowledgement",
            "searchString": "CF-Ack",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Control Frame Poll",
            "searchString": "CF-Poll",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Power Save Poll",
            "searchString": "Power-Save poll",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Poll",
            "searchString": "Poll",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Control Wrapper",
            "searchString": "Control Wrapper",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Control Frame",
            "searchString": "Control-frame",
            "category": "Structure",
            "categoryIndex": 2
        },
        {
            "name": "Data",
            "searchString": "Data",
            "category": "Data",
            "categoryIndex": 4
        },
        {
            "name": "Data",
            "searchString": "QoS Data",
            "category": "Data",
            "categoryIndex": 4
        },
        {
            "name": "Null Packet",
            "searchString": "NULL",
            "category": "Broken",
            "categoryIndex": 5
        },
        {
            "name": "Unknown Packet",
            "searchString": "Unknown",
            "category": "Broken",
            "categoryIndex": 5
        },
        {
            "name": "Fragmented Packet",
            "searchString": "Fragmented",
            "category": "Broken",
            "categoryIndex": 5
        },
        {
            "name": "Malformed Packet",
            "searchString": "Malformed",
            "category": "Broken",
            "categoryIndex": 5
        },
        {
            "name": "Bogus Packet",
            "searchString": "Bogus",
            "category": "Broken",
            "categoryIndex": 5
        },
        {
            "name": "Null Data Packet",
            "searchString": "VHT NDP Announcement",
            "category": "Broken",
            "categoryIndex": 5
        }
    ],
    "categories": [
        "Unknown",
        "Communication",
        "Structure",
        "Gatekeeping",
        "Data",
        "Broken"
    ]
}

PacketGrabber.prototype = {
	run: function(){
		this.ts.run();
	},
	stop: function(){
		this.ts.stop();
	},
	_onPacket: function( packet ){
		if( typeof this.onPacket === 'function' ){
			this.onPacket( packet );
		}
	},
	fieldsToFlags: function( fields ){
		var flags = '';
		for( var i = 0; i < fields.length; i++ ){
			if( i > 0 ){
				flags += ' ';
			}
			flags += '-e ' + fields[i].identifier;
		}
		return flags;
	},
	onPacket: function( packet ){ /* ... override ... */ },
	parsePacket: function( packet ){
		var that = this;
		var inferPacketType = function( packet ){
			for( var i = 0; i < PacketGrabber.config.packets.length; i++ ){
                var lowerWLAN = packet.wlan.toLowerCase();
                var lowerSearch = PacketGrabber.config.packets[i].searchString.toLowerCase();
				if( lowerWLAN.indexOf( lowerSearch ) !== -1 ){
					return {
						'category': PacketGrabber.config.packets[i].category,
						'categoryIndex': PacketGrabber.config.packets[i].categoryIndex,
						'name': PacketGrabber.config.packets[i].name
					};
					break;
				}
			}
			return {
				'category': "Unknown",
				'categoryIndex': 0,
				'name': "Unknown"
			};
		};
		var packet = packet.split( this.FIELD_SEPARATOR );
		var parsed = {};
		for( var i = 0; i < this.fields.length; i++ ){
			parsed[ this.fields[i].slug ] = (!!packet[ i ]) ? packet[i] : '';
		}
		parsed.type = inferPacketType( parsed )
		return parsed;
	},
	parseData: function( data ){
		var packets = data.trim().split( '\n' );
		for( var i = 0; i < packets.length; i++ ){
			this._onPacket( this.parsePacket( packets[i] ) );
		}
	}
};


module.exports = PacketGrabber;
