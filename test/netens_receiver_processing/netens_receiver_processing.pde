/*
  Network Ensemble Receiver
  
  Example of receiving the OSC communications from the Network Ensemble application
  Receives all OSC messages and displays the latest one each draw loop. 
  Prints ALL messages to the console.
  
  See the oscEvent function for an example of how to get the values from the message.
*/

import oscP5.*;

PFont fontMono;

OscP5 oscP5;

boolean hasData = false;

String category, name, timestamp, sourceIp, destIp, sourceMac, destMac, wlan;
int frameLength;

void setup(){
  size(640,210);
  oscP5 = new OscP5(this,12099);
  fontMono = createFont( "monospaced", 30 );
  textFont( fontMono );
  textSize( 15 );
}

void draw(){
  background(0);
  if( hasData ){
    text( "Category:", 20, 30 );       text( category, 200, 30 );
    text( "Name:", 20, 50 );           text( name, 200, 50 );
    text( "Timestamp:", 20, 70 );      text( timestamp, 200, 70 );
    text( "Frame Length:", 20, 90 );   text( frameLength, 200, 90 );
    text( "Source IP:", 20, 110 );     text( sourceIp, 200, 110 );
    text( "Dest IP:", 20, 130 );       text( destIp, 200, 130 );
    text( "Source Mac:", 20, 150 );    text( sourceMac, 200, 150 );
    text( "Dest Mac:", 20, 170 );      text( destMac, 200, 170 );
    text( "Wlan Details:", 20, 190 );  text( wlan, 200, 190 );
  } else {
    text( "No data received.", 20, 30 );
    text( "Is Network Ensemble Application running?", 20, 50 );
  }
}

void oscEvent(OscMessage oscMsg ) {
  println( "RECEIVED OSC MESSAGE", oscMsg.addrPattern() );
  if( oscMsg.checkAddrPattern( "/packet" ) ){
    println( "(probably) from Network Ensemble");
  
    //typetag should be: ssfisssss
    category = trim(oscMsg.get( 0 ).stringValue());
    name = trim(oscMsg.get( 1 ).stringValue());
    timestamp = oscMsg.get( 2 ).stringValue();
    frameLength = oscMsg.get( 3 ).intValue();
    sourceIp = trim(oscMsg.get( 4 ).stringValue());
    destIp = trim(oscMsg.get( 5 ).stringValue());
    sourceMac = trim(oscMsg.get( 6 ).stringValue());
    destMac = trim(oscMsg.get( 7 ).stringValue());
    wlan = trim(oscMsg.get( 8 ).stringValue());
    
    println( "Category:\t\t", category );
    println( "Name:\t\t", name );
    println( "Timestamp:\t\t", timestamp );
    println( "Frame Length:\t", frameLength );
    println( "Source IP:\t\t", sourceIp );
    println( "Dest IP:\t\t", destIp );
    println( "Source Mac:\t", sourceMac );
    println( "Dest Mac:\t\t", destMac );
    println( "Wlan Details:\t", wlan );
    
    hasData = true;
  }
}