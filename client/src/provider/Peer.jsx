import React, { useState, useEffect, useCallback } from "react";

const PeerContext = React.createContext(null)

export const usePeer = () => React.useContext(PeerContext)

export const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null);

    const peer = new RTCPeerConnection({
        iceServers: [{
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:global.stun.twilio.com:3478'
            ]
        }]
    })

    const createOffer = async () => {
        const offer = await peer.createOffer()
        peer.setLocalDescription(offer)
        return offer
    }

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            peer.addTrack(track, stream)
        }
        const videoTrack = stream.getVideoTracks()[0];
        console.log("Sender video track muted:", videoTrack.muted);
        console.log("Sender video track ended:", videoTrack.readyState === "ended");

    }


    const handleTrackEvents = useCallback((ev) => {
        console.log("tracks started at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
        const streams = ev.streams

        const [remoteStreamm] = ev.streams;
        // console.log("Got remote stream:", remoteStreamm);
        // console.log("Video Tracks:", remoteStreamm.getVideoTracks());
        // console.log("Audio Tracks:", remoteStreamm.getAudioTracks());

        const videoTrack = remoteStreamm.getVideoTracks()[0];
        // console.log("Video Track - ended:", videoTrack?.ended);
        // console.log("Video Track - muted:", videoTrack?.muted);

        // videoTrack.onunmute = () => console.log("Remote video track unmuted");
        // videoTrack.onmute = () => console.log("Remote video track muted");
        // videoTrack.onended = () => console.log("Remote video track ended");
        // videoTrack.onloadedmetadata = () => console.log("Remote video track loaded metadata");


        console.log(streams)
        setRemoteStream(streams[0])
    }, [])

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvents)
        return (() => {
            peer.removeEventListener('track', handleTrackEvents)
        })
    }, [handleTrackEvents, peer])

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, sendStream, remoteStream }}>
            {props.children}
        </PeerContext.Provider>
    )
}