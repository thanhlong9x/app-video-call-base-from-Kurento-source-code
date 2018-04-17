

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

function Participant(name, idAppend) {
	this.name = name;
	var sound = true;
	var container = document.createElement('div');
	container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
	container.id = name;
	var span = document.createElement('span');
	var video = document.createElement('video');
	var div = document.createElement('div');
	var rtcPeer;

	container.appendChild(video);
	container.appendChild(span);
	container.appendChild(div);
	container.onclick = switchContainerClass;
	document.getElementById(idAppend).appendChild(container);

	span.appendChild(document.createTextNode(name));
    this.uid = 'playpause-' + this.name;
    div.id = this.uid;
//    div.className = 'playpause';
	video.id = 'video-' + name;
	video.autoplay = true;
	video.controls = false;


	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	function switchContainerClass() {
		if (container.className === PARTICIPANT_CLASS) {
			var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
			elements.forEach(function(item) {
					item.className = PARTICIPANT_CLASS;
				});

				container.className = PARTICIPANT_MAIN_CLASS;
				if(sound == true){
				    document.getElementById('button-sound').value = "Disable Sound";
				    document.getElementById(this.uid).removeAttribute("class");
				}
				if(sound == false){
				    document.getElementById('button-sound').value = "Enable Sound";
				     document.getElementById(this.uid).setAttribute("class", "playpause");
				}
			} else {
			container.className = PARTICIPANT_CLASS;
		}
	}

	function isPresentMainParticipant() {
		return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0);
	}

	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")
		console.log('Invoking SDP offer callback function');
		var msg =  { id : "receiveVideoFrom",
				sender : name,
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
	    document.getElementById(this.uid).setAttribute("class", "playpause");
	    mainclass = document.getElementsByClassName(PARTICIPANT_MAIN_CLASS);
        nameID = mainclass[0].id;
	    if(nameID == this.name){
	        document.getElementById('button-sound').value = "Enable Sound";

	    }

	}
	this.soundToggleDisable = function(){
	     document.getElementById(this.uid).removeAttribute("class");
    	 mainclass = document.getElementsByClassName(PARTICIPANT_MAIN_CLASS);
         nameID = mainclass[0].id;
    	 if(nameID == this.name){
    	     document.getElementById('button-sound').value = "Disable Sound";
    	 }

    }
}
