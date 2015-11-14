#Network Ensemble

MacOS only for now (due to permissions requirements and wifi card specifics). Linux is a possibility, Windows will probably never happen.

##Usage

When opened, the application presents you with a choice of Network Interfaces. To find out which one is your WiFi card, you should hold ```alt``` and click the Airport icon. The first line will be something like *Interface Name: en0*. Select that one in the Network Ensemble drop down and click start.

You will then be presented with a passord box - the application needs root access to read the packets from the WiFi card. 

Once you've authorised it, you will see the main interface. Here you can select which packets you're interested in and how they should be output. There are currently 2 output types, Raw and OSC. They can be used together.

###Raw
The Raw option outputs the sound through your speakers/headphones, this is the raw bytes reeived by the applicaiton converted directly to sound. The slider beneath allows you to change how quickly they're played back & can be useful for hunting for patterns in the data

###OSC
The OSC option outputs the packets via [Open Sound Control](http://opensoundcontrol.org/) for use in other applications (many audio applications, especially can use OSC control, and there is a library for most programming languages). 

To receive the messages you should set your application to listen on port ```12099```.

The messages come to the address ```/packet```, with the values as follows:

    Category [string] 			The category thre packet belongs to (Communication/Data/Structure etc)
    Name [string] 				The name of the specific packet (Beacon Frame etc) 
    timestamp [string] 			The timestamp (from the packet itself)
    frameLength [int] 			The size of the packet
    sourceIp [string] 			The IP that sent the packet
    destIp [string] 			The IP the packet is intended for
    sourceMac [string] 			The MAC address of the sender
    destMac [string] 			The MAC address of the destination
    wlan [string] 				The wlan field as parsed by Wireshark - provides occasional extra info.

Not all fields are necesarily sent with all packets - it's dependent on them & also the amount of traffic - but you should always get a Category and a Name, a length and a timestamp are pretty likely too. 

There is an exampke receiver application (in the test directory, called ```netens_receiver_processing```) that shows how to receive and parse the messages in Processing.

##Requirements

Wireshark is needed to actually undertake the packet filtering. The *entire app* (this should and will, one day, be changed) should be added to the src/bin directory. Tested with v1.12.2.

The code needs to be run with ```nwjs```, so that should be added to the root directory. The program can then be run with ```./nwjs.app/Contents/MacOS/nwjs src```

##Packaging

The whole thing *can* be packed up as a nice little app. The general nwjs method should be used, which can be found on [the nwjs wiki](https://github.com/nwjs/nw.js/wiki/How-to-package-and-distribute-your-apps#mac-os-x). In the ```nwjs``` directory you will find an ```.icns``` file that can be dropped in, and a modified ```.plist``` file which can either be dropped in (it was made for/from v41.0.2272.76 of nwjs) or referred to.

A packaging & dependecy adding script should probably be put together to make this all a lot simpler.

##Release

