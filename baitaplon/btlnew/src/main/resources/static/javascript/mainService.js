var joinRoom;
angular.module("mainService", [])
    .service('mainService', function ($rootScope) {
        var room;
        var joinUser;
        // var joinRoom;
        var participants = {};
        var video;
        var name;
        var listOnline;
        var calling;
        var sharing;
        //new var
        var listRoom = 0;
        //new var
        var hostOfRoom;
        var self = this;
        ws.onmessage = function (message) {
            var parsedMessage = JSON.parse(message.data);
            console.info('Received message: ' + message.data);
            switch (parsedMessage.id) {
                case 'existingParticipants':
                    console.log("existingParticipants");
                    self.onExistingParticipants(parsedMessage);
                    break;
                case 'participantLeft':
                    console.log("participantLeft");
                    self.onParticipantLeft(parsedMessage);
                    break;
                case 'newParticipantArrived':
                    console.log("newParticipantArrived");
                    self.onNewParticipant(parsedMessage);
                    break;
                case 'login':
                    console.log("chane");
                    name = parsedMessage.name;
                    break;
                case 'sendOverview':
                    self.sendOverview();
                    break;
                case 'receiveVideoAnswer':
                    console.log("receiveVideoAnswer");
                    self.receiveVideoResponse(parsedMessage);
                    break;
                case 'iceCandidate':
                    console.log("iceCandidate");
                    participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
                        if (error) {
                            console.error("Error adding candidate: " + error);
                            return;
                        }
                    });
                    break;
                case 'getListOnline':
                    console.log("change");
                    listOnline = parsedMessage.listOnline;
                    $rootScope.$broadcast('updateListOnline', {message: "update"});
                    break;
                case 'viewShare':
                    self.receiveVideo(parsedMessage.data);
                    break;
                case 'getHostOfRoom':
                    hostOfRoom = parsedMessage.hostOfRoom;
                    console.log("host of room");
                    console.log(hostOfRoom);
                    var boss = document.getElementById('boss');
                    if(boss != null){
                    boss.innerText = "Boss's Room: " + hostOfRoom; // ten boss room
                    }
                    break;
                case 'requestJoin':
                    console.log(parsedMessage.user + "yeu cau join");
                    joinUser = parsedMessage.user;
                    joinRoom = parsedMessage.room;
                    var userJoin = joinUser;
                    var parent = document.getElementById('msg');
                    var newChild = '<div name="'+joinUser+'" class="card w-10 well"><div class="card-block"><h3 class="card-title">'+joinUser+' want talk with you</h3><div class="OkCe"><input type="button" class="btn btn-info" onmouseup="acceptJoin(\'' + userJoin + '\');" value="OK"><input type="button" class="btn btn-warning" onmouseup="cancel(\'' + userJoin + '\');" value="Cancel"></div></div></div>';
                    parent.insertAdjacentHTML('beforeend', newChild);
                    break;
                case 'permisson':
                    console.log("you haven't permisson");
                    break;
                case 'soundtoggle':
                    if(parsedMessage.type == "disable"){
                        participants[parsedMessage.user].setSound(false);
                        participants[parsedMessage.user].soundToggleEnable();
                    }
                    if(parsedMessage.type == "enable"){
                        participants[parsedMessage.user].setSound(true);
                        participants[parsedMessage.user].soundToggleDisable();
                    }
                    break;
                case 'disableSound':
                    if(parsedMessage.type==0){
                        console.log("ban da tat tieng");
                    }
                    if(parsedMessage.type==1){
                        console.log("ban bi tat tieng");
                    }
                    break;
                case 'enableSound':
                    if(parsedMessage.type==0){
                        console.log("ban da bat tieng");
                    }
                    if(parsedMessage.type==1){
                        console.log("ban duoc bat tieng");
                    }
                    break;
                case 'leave':
                    if(parsedMessage.typeuser === "1"){
                        console.log("You had out of room");
                        for(var propName in participants) {
                            if(propName != name){
                                participants[propName].removeOut();
                            }
                        }
                    }
                    if(parsedMessage.typeuser === "0"){
                        console.log("Duoi thanh cong");
                    }
                    if(parsedMessage.typeuser === "2"){
                        console.log("Ban bi duoi khoi phong");
                        console.log(participants);
//            participants["chiennv2"].dispose();
                        for(var propName in participants) {
                            if(propName != name){
                                participants[propName].removeOut();
                            }
                        }
                    }
                    break;
                case 'getListRoom':
                    listRoom = parsedMessage.listRoom;
                    console.log("list room");
                    console.log(listRoom);
                    break;
                default:
                    console.log("default");
                    console.error('Unrecognized message', parsedMessage);
            }
        };
        this.sendMessage = function (message) {
            var jsonMessage = JSON.stringify(message);
            console.log('Senging message: ' + jsonMessage);
            ws.send(jsonMessage);
        };
        this.getListOnline = function () {
            return listOnline;
        };
        this.sendOverview = function () {
            var constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    }
                }
            };
            // console.log(name + " registered in room " + room);
            var participant = new View(name, 'overview');
            participants[name] = participant;
            video = participant.getVideoElement();

            var options = {
                localVideo: video,
                mediaConstraints: constraints,
                onicecandidate: participant.onIceCandidate.bind(participant)
            };
            participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
                function (error) {
                    if (error) {
                        return console.error(error);
                    }
                    this.generateOffer(participant.offerToReceiveVideo.bind(participant));
                });
        };
        this.receiveVideoResponse = function (result) {
            participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, function (error) {
                if (error) return console.error(error);
            });
        };
        this.receiveVideo = function (sender) {
            var participant = new View(sender, 'overview');
            participants[sender] = participant;
            var video = participant.getVideoElement();

            var options = {
                remoteVideo: video,
                onicecandidate: participant.onIceCandidate.bind(participant)
            }

            participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
                function (error) {
                    if (error) {
                        return console.error(error);
                    }
                    this.generateOffer(participant.offerToReceiveVideo.bind(participant));
                });
        };
        this.onExistingParticipants = function (msg) {
            var constraints = {
                audio : true,
                video : {
                    mandatory : {
                        maxWidth : 320,
                        maxFrameRate : 15,
                        minFrameRate : 15
                    }
                }
            };
            console.log(name + " registered in room " + room);
            var participant = new Participant(name, 'participants');
            participants[name] = participant;
            video = participant.getVideoElement();

            var options = {
                localVideo: video,
                mediaConstraints: constraints,
                onicecandidate: participant.onIceCandidate.bind(participant)
            };
            participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
                function (error) {
                    if(error) {
                        return console.error(error);
                    }
                    this.generateOffer (participant.offerToReceiveVideo.bind(participant));
                });

            if(msg.data != null){
                msg.data.forEach(self.receiveVideoNew);
            }
        };
        this.receiveVideoNew = function(sender) {
            var participant = new Participant(sender,'participants');
            participants[sender] = participant;
            var video = participant.getVideoElement();

            var options = {
                remoteVideo: video,
                onicecandidate: participant.onIceCandidate.bind(participant)
            }

            participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
                function (error) {
                    if(error) {
                        return console.error(error);
                    }
                    this.generateOffer (participant.offerToReceiveVideo.bind(participant));
                });
        };
        this.onNewParticipant = function(request) {
            self.receiveVideoNew(request.name);
        };
        this.onParticipantLeft = function(request) {
            console.log('Participant ' + request.name + ' left');
            var participant = participants[request.name];
            participant.dispose();
            delete participants[request.name];
        };
        this.disableSound = function () {
            x = document.getElementsByClassName('participant main');
            c = x[0].id;
            sound = participants[c].getSound();
            console.log(sound);
            if(sound == true){
//        document.getElementById('button-sound').value = "Enable Sound";
//        participants[c].setSound(false);
                self.sendMessage({
                    id : 'disableSound',
                    disabler: c,
                    requester: name
                });
                console.log("gui request");
            }
            if(sound == false){
//        document.getElementById('button-sound').value = "Disable Sound";
//        participants[c].setSound(true);
                self.sendMessage({
                    id : 'enableSound',
                    disabler: c,
                    requester: name
                });
                console.log("gui request");
            }
        };
        this.leaveRoom = function () {
            x = document.getElementsByClassName('participant main');
            c = x[0].id;
            console.log(c);
            self.sendMessage({
                id : 'leaveRoom',
                leaver: c,
                requester: name
            });
        };
        this.getListRoom = function(){
            self.sendMessage({
                id : 'getListRoom',
                requester: name
            });
        }
        this.goToHome = function () {
            console.log(participants);
            for(var propName in participants) {
                participants[propName].removeOut();
            }
        }
    });
function acceptJoin(userJoin){

    sendMessage({
        id : 'acceptJoin',
        userAccept: userJoin,
        roomAccept: joinRoom
    });
    console.log("da gui mess");
    document.getElementsByName(userJoin)[0].style.display='none';
}
function cancel(userJoin){
    document.getElementsByName(userJoin)[0].style.display = 'none';
    console.log(userJoin);
}
function callResponse(message) {
    if (message.response != 'accepted') {
        console.info('Call not accepted by peer. Closing call');
        stop();
    } else {
        webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
            if (error) return console.error (error);
        });
    }
}