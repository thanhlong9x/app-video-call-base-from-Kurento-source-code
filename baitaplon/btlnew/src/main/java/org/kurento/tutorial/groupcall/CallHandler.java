/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.kurento.tutorial.groupcall;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import com.google.gson.JsonArray;
import org.kurento.client.IceCandidate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

import javax.print.attribute.HashAttributeSet;

/**
 * @author Ivan Gracia (izanmail@gmail.com)
 * @since 4.3.1
 */
public class CallHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(CallHandler.class);

    private static final Gson gson = new GsonBuilder().create();

    @Autowired
    private RoomManager roomManager;

    @Autowired
    private UserRegistry registry;

    private HashMap<String, HashSet> listDisable = new HashMap<String, HashSet>();
    private HashMap<String, WebSocketSession> tempSession = new HashMap<String, WebSocketSession>();
    private ArrayList<String> listOnline = new ArrayList<String>();
    private HashMap<String,WebSocketSession> listSession = new HashMap<String,WebSocketSession>();
    private HashMap<String,String> listShareScreen = new HashMap<String, String>(0);

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        final JsonObject jsonMessage = gson.fromJson(message.getPayload(), JsonObject.class);

        final UserSession user = registry.getBySession(session);
        ConcurrentHashMap<String, UserSession> users = registry.getAll();
        if (user != null) {
            log.debug("Incoming message from user '{}': {}", user.getName(), jsonMessage);
        } else {
            log.debug("Incoming message from new user: {}", jsonMessage);
        }

        switch (jsonMessage.get("id").getAsString()) {
            case "login":
                String userName = jsonMessage.get("name").getAsString();
                listOnline.add(userName);
                listSession.put(userName, session);
                System.out.println("add session");
                JsonObject loginMsg = new JsonObject();
                loginMsg.addProperty("id","login" );
                loginMsg.addProperty("name",userName);
                sendMsg(listSession.get(userName),loginMsg);
                break;
            case "joinRoom":
                String nameRoom = jsonMessage.get("room").getAsString();
                String joinName = jsonMessage.get("name").getAsString();
                Room room = roomManager.getRoom(nameRoom);
                if (room == null) {
                    joinRoom(jsonMessage, session);
                } else {
                    String hostOfRoom = room.getHostRoom();
                    if (hostOfRoom == joinName) {
                        joinRoom(jsonMessage, session);
                    } else {
                        JsonObject requestJoin = new JsonObject();
                        requestJoin.addProperty("id", "requestJoin");
                        requestJoin.addProperty("user", joinName);
                        requestJoin.addProperty("room", nameRoom);
                        users.get(hostOfRoom).sendMessage(requestJoin);
                        tempSession.put(joinName, session);
                    }
                }

                break;
            case "joinShareRoom":
                String nameShareRoom = jsonMessage.get("room").getAsString();
                String joinShareName = jsonMessage.get("name").getAsString();
//                Room roomShare = roomManager.getRoom(nameShareRoom);
                joinShareRoom(jsonMessage,session);
                break;
            case "viewShareRoom":
                viewShareRoom(jsonMessage,session);
                break;
            case "receiveVideoFrom":
                final String senderName = jsonMessage.get("sender").getAsString();
                final UserSession sender = registry.getByName(senderName);
                final String sdpOffer = jsonMessage.get("sdpOffer").getAsString();
                user.receiveVideoFrom(sender, sdpOffer);
                String nameOfRoom2 = user.getRoomName();
                if (listDisable.containsKey(nameOfRoom2)) {
                    if (listDisable.get(nameOfRoom2).contains(senderName)) {
                        System.out.println("da vao day roi ............");
                        user.disableAudio(sender);
                    }
                }
//        for(String key : listDisable){
//          System.out.println("Day la key "+key);
//          UserSession sender3 = registry.getByName(key);
//          users.get(name).disableAudio(sender);
//        }
                break;
            case "leaveRoom":
                String leaver = jsonMessage.get("leaver").getAsString();
                String requester = jsonMessage.get("requester").getAsString();
                JsonObject leaveMsg = new JsonObject();


//        users.get(leaveMsg);
                if (leaver.equals(requester)) {
                    leaveMsg.addProperty("id", "leave");
                    leaveMsg.addProperty("typeuser", "1"); // same user request and leaver
                    leaveRoom(users.get(leaver), leaver);
                    user.sendMessage(leaveMsg);
                } else if (roomManager.getRoom(user.getRoomName()).getHostRoom().equals(requester)) {
                    leaveMsg.addProperty("id", "leave");
                    leaveMsg.addProperty("typeuser", "0"); // not same user request and leaver
                    leaveRoom(users.get(leaver), leaver);
                    user.sendMessage(leaveMsg);
                    JsonObject leaveMsg2 = new JsonObject();
                    leaveMsg2.addProperty("id", "leave");
                    leaveMsg2.addProperty("typeuser", "2"); // user leaver
                    users.get(leaver).sendMessage(leaveMsg2);
                } else {
                    leaveMsg.addProperty("id", "permisson");
                    user.sendMessage(leaveMsg);
                }

                break;
            case "disableSound":
//        if(){
//
//        }
                String requester1 = jsonMessage.get("requester").getAsString();
                String senderName1 = jsonMessage.get("disabler").getAsString();
                String nameOfRoom1 = user.getRoomName();
                JsonObject disableSoundMsg = new JsonObject();
                if (requester1.equals(senderName1)) {
                    listDisable.get(nameOfRoom1).add(senderName1);
                    for (String key : users.keySet()) {
                        UserSession sender1 = registry.getByName(senderName1);
                        users.get(key).disableAudio(sender1);
                        JsonObject soundMsg = new JsonObject();
                        soundMsg.addProperty("id", "soundtoggle");
                        soundMsg.addProperty("type", "disable"); //
                        soundMsg.addProperty("user", senderName1); //
                        users.get(key).sendMessage(soundMsg);
                    }
                    disableSoundMsg.addProperty("id", "disableSound");
                    disableSoundMsg.addProperty("type", "0");
                    user.sendMessage(disableSoundMsg);
                } else if (roomManager.getRoom(user.getRoomName()).getHostRoom().equals(requester1)) {
                    listDisable.get(nameOfRoom1).add(senderName1);

                    for (String key : users.keySet()) {

                        UserSession sender1 = registry.getByName(senderName1);
                        users.get(key).disableAudio(sender1);
                        JsonObject soundMsg = new JsonObject();
                        soundMsg.addProperty("id", "soundtoggle");
                        soundMsg.addProperty("type", "disable"); //
                        soundMsg.addProperty("user", senderName1); //
                        users.get(key).sendMessage(soundMsg);

                    }
                    disableSoundMsg.addProperty("id", "disableSound");
                    disableSoundMsg.addProperty("type", "1");
                    users.get(senderName1).sendMessage(disableSoundMsg);
                } else {
                    disableSoundMsg.addProperty("id", "permisson");
                    user.sendMessage(disableSoundMsg);
                }


                break;
            case "enableSound":
                String requester2 = jsonMessage.get("requester").getAsString();
                String senderName2 = jsonMessage.get("disabler").getAsString();
                String nameOfRoom = user.getRoomName();
                JsonObject enableSoundMsg = new JsonObject();
                if (requester2.equals(senderName2)) {
                    listDisable.get(nameOfRoom).remove(senderName2);
                    for (String key : users.keySet()) {

                        UserSession sender2 = registry.getByName(senderName2);
                        users.get(key).enableSound(sender2);
                        JsonObject soundMsg = new JsonObject();
                        soundMsg.addProperty("id", "soundtoggle");
                        soundMsg.addProperty("type", "enable"); //
                        soundMsg.addProperty("user", senderName2); //
                        users.get(key).sendMessage(soundMsg);

                    }
                    enableSoundMsg.addProperty("id", "enableSound");
                    enableSoundMsg.addProperty("type", "0");
                    user.sendMessage(enableSoundMsg);
                } else if (roomManager.getRoom(user.getRoomName()).getHostRoom().equals(requester2)) {
                    listDisable.get(nameOfRoom).remove(senderName2);
                    for (String key : users.keySet()) {
                        UserSession sender2 = registry.getByName(senderName2);
                        users.get(key).enableSound(sender2);
                        JsonObject soundMsg = new JsonObject();
                        soundMsg.addProperty("id", "soundtoggle");
                        soundMsg.addProperty("type", "enable"); //
                        soundMsg.addProperty("user", senderName2); //
                        users.get(key).sendMessage(soundMsg);
                    }
                    enableSoundMsg.addProperty("id", "enableSound");
                    enableSoundMsg.addProperty("type", "1");
                    users.get(senderName2).sendMessage(enableSoundMsg);
                } else {
                    enableSoundMsg.addProperty("id", "permisson");
                    user.sendMessage(enableSoundMsg);
                }

                break;
            case "onIceCandidate":
                JsonObject candidate = jsonMessage.get("candidate").getAsJsonObject();

                if (user != null) {
                    IceCandidate cand = new IceCandidate(candidate.get("candidate").getAsString(),
                            candidate.get("sdpMid").getAsString(), candidate.get("sdpMLineIndex").getAsInt());
                    user.addCandidate(cand, jsonMessage.get("name").getAsString());
                }
                break;
            case "acceptJoin":
                System.out.println("da nhan mess");
                JsonObject acceptMsg = new JsonObject();
                acceptMsg.addProperty("room", jsonMessage.get("roomAccept").getAsString());
                acceptMsg.addProperty("name", jsonMessage.get("userAccept").getAsString());
                joinRoom(acceptMsg, tempSession.get(jsonMessage.get("userAccept").getAsString()));
                break;
            case "getListOnline":
                JsonArray listOnlineArrMsg = new JsonArray();
                for(int i=0; i<listOnline.size();i++){
                    listOnlineArrMsg.add(listOnline.get(i));
                }
                JsonObject listOnlineMsg = new JsonObject();
                listOnlineMsg.addProperty("id","getListOnline" );
                listOnlineMsg.add("listOnline", listOnlineArrMsg);
//                for(WebSocketSession asession:listSession ){
//                    sendMsg(asession, listOnlineMsg);
//                }
                String requester4 = jsonMessage.get("requester").getAsString();
                for(String nameSession : listSession.keySet() ){
                    if(!nameSession.equals(requester4)){
                        sendMsg(listSession.get(nameSession),listOnlineMsg);
                    }
                }
                sendMsg(listSession.get(requester4),listOnlineMsg);
                break;
            case "getListRoom":

                JsonArray listRoomArrMsg = new JsonArray();
                for(String abc: roomManager.getRooms().keySet()){
                    listRoomArrMsg.add(abc);
                }
                JsonObject listRoomMsg = new JsonObject();
                listRoomMsg.addProperty("id","getListRoom" );
                listRoomMsg.add("listRoom", listRoomArrMsg);
                String requester3 = jsonMessage.get("requester").getAsString();
                for(String nameSession : listSession.keySet() ){
                    if(!nameSession.equals(requester3)){
                        sendMsg(listSession.get(nameSession),listRoomMsg);
                    }
                }
                sendMsg(listSession.get(requester3),listRoomMsg);

                break;
            case "getHostOfRoom":
                JsonObject hostOfRoomMsg = new JsonObject();
                hostOfRoomMsg.addProperty("id", "getHostOfRoom");
                String hostOfRoomMsgString = roomManager.getRoom(user.getName()).getHostRoom();
                hostOfRoomMsg.addProperty("hostOfRoom", hostOfRoomMsgString);
                user.sendMessage(hostOfRoomMsg);
                break;
            case "demo":
                System.out.println("demo ok");
                break;
            default:
                break;
        }
    }
    public void sendMsg(WebSocketSession session, JsonObject Msg) throws IOException {
        synchronized (session) {
            session.sendMessage(new TextMessage(Msg.toString()));
            System.out.println(Msg.toString());
        }
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
//        UserSession user = registry.removeBySession(session);
//        Room room = roomManager.getRoom(user.getRoomName());
//        if (room != null) {
////      room.leave(user);
//        }
    }

    private void joinRoom(JsonObject params, WebSocketSession session) throws IOException {
        final String roomName = params.get("room").getAsString();
        final String name = params.get("name").getAsString();
        log.info("PARTICIPANT {}: trying to join room {}", name, roomName);
        if (!roomManager.checkExitRoom(roomName)) {
            HashSet<String> disable = new HashSet<String>();
            listDisable.put(roomName, disable);
        }
        Room room = roomManager.getRoomAndHost(roomName, name);
//    if(name == room.getHostRoom()){
        final UserSession user = room.join(name, session);
        registry.register(user);
//    }else {
//      System.out.println("doi cap quyen ");
//    }

//    System.out.println("host of room is: " + room.getHostRoom());
//    ConcurrentHashMap<String, UserSession> users = registry.getAll();
//
//    for(String key : listDisable){
//      System.out.println("Day la key "+key);
//      UserSession sender = registry.getByName(key);
//      users.get(name).disableAudio(sender);
//    }
    }
    private void joinShareRoom(JsonObject params, WebSocketSession session) throws IOException{
        final String roomName = params.get("room").getAsString();
        final String name = params.get("name").getAsString();
        Room room = roomManager.getRoomAndHost(roomName, name);
        final UserSession user = room.joinShare(name, session);
        registry.register(user);
    }
    private void viewShareRoom(JsonObject params, WebSocketSession session) throws IOException{
        final String roomName = params.get("room").getAsString();
        final String name = params.get("name").getAsString();
        Room room = roomManager.getRoomAndHost(roomName, name);
        final UserSession user = room.viewShare(name, session);
        registry.register(user);
    }
    private void leaveRoom(UserSession user, String leaver) throws IOException {
        final Room room = roomManager.getRoom(user.getRoomName());
        room.leave(user);
        if (room.getParticipants().isEmpty()) {
//            roomManager.removeRoom(room);
            listDisable.remove(user.getRoomName());
        }
        listDisable.get(user.getRoomName()).remove(leaver);
    }


}
