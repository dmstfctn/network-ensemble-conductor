#Network Ensemble

MacOS only for now (due to permissions requirements and wifi card specifics). Linux is a possibility, Windows will probably never happen.

##Requirements

Wireshark is needed to actually undertake the packet filtering. The *entire app* (this should and will, one day, be changed) should be added to the src/bin directory. Tested with v1.12.2.

The code needs to be run with ```nwjs```, so that should be added to the root directory. The program can then be run with ```./nwjs.app/Contents/MacOS/nwjs src```

##Packaging

The whole thing *can* be packed up as a nice little app. The general nwjs method should be used, which can be found on [the nwjs wiki](https://github.com/nwjs/nw.js/wiki/How-to-package-and-distribute-your-apps#mac-os-x). In the ```nwjs``` directory you will find an ```.icns``` file that can be dropped in, and a modified ```.plist``` file which can either be dropped in (it was made for/from v41.0.2272.76 of nwjs) or referred to.

A packaging & dependecy adding script should probably be put together to make this all a lot simpler.

##Release

