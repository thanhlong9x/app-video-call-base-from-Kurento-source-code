

const VIEW_MAIN_CLASS = 'view main';
const VIEW_CLASS = 'view';

function View(name, idAppend) {
    this.name = name;
    var sound = true;
    var container = document.createElement('div');
    container.className = isPresentMainParticipant() ? VIEW_CLASS : VIEW_MAIN_CLASS;
    container.id = name;
    var span = document.createElement('span');
    var video = document.createElement('video');
    var div = document.createElement('div');
    var rtcPeer;

    container.appendChild(video);
    container.appendChild(span);
    container.appendChild(div);
    var apppendneed = document.getElementById(idAppend);
    if( apppendneed != null){
        apppendneed.appendChild(container);
    }else{
        document.getElementById('headerOverview').appendChild(container);
    }




    span.appendChild(document.createTextNode(name));

//    div.id = 'playpause';
    video.id = 'video-' + name;
    video.autoplay = true;
    video.controls = false;


    this.getElement = function() {
        return container;
    }

    this.getVideoElement = function() {
        return video;
    }


    function isPresentMainParticipant() {
        return ((document.getElementsByClassName(VIEW_MAIN_CLASS)).length != 0);
    }

    this.offerToReceiveVideo = function(error, offerSdp, wp){
        if (error) return console.error ("sdp offer error")
        console.log('Invoking SDP offer callback function');
        var newName = name;
        var msg =  { id : "receiveVideoFrom",
            sender : newName,
            sdpOffer : offerSdp
        };
        sendMessage(msg);
    }

    this.onIceCandidate = function (candidate, wp) {
        console.log("Local candidate" + JSON.stringify(candidate));
        var message = {
            id: 'onIceCandidate',
            candidate: candidate,
            name: name
        };
        sendMessage(message);
    }

    Object.defineProperty(this, 'rtcPeer', { writable: true});

    this.dispose = function() {
        console.log('Disposing participant ' + this.name);
        this.rtcPeer.dispose();
        container.parentNode.removeChild(container);
    };
    this.removeOut = function(){
        container.parentNode.removeChild(container);
    }
    this.getSound = function(){
        return sound;
    }
    this.setSound = function(soundset){
        sound = soundset;
    }
    this.soundToggleEnable = function(){
        mainclass = document.getElementsByClassName(VIEW_MAIN_CLASS);
        nameID = mainclass[0].id;
        if(nameID == this.name){
            document.getElementById('button-sound').value = "Enable Sound";
        }
    }
    this.soundToggleDisable = function(){
        mainclass = document.getElementsByClassName(VIEW_MAIN_CLASS);
        nameID = mainclass[0].id;
        if(nameID == this.name){
            document.getElementById('button-sound').value = "Disable Sound";
        }
    }
//	this.outOfRoom = function(outOfRoomName){
//	    if(outOfRoomName == this.name){
//	    }
//	}
}
