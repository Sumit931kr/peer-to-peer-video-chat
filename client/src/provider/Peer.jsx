import React, { useState, useEffect, useCallback } from "react";

const PeerContext = React.createContext(null)

export const usePeer = () => React.useContext(PeerContext)

export const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null);

    
    const handleTrackEvents = useCallback((ev) => {
        const streams = ev.streams
        setRemoteStream(streams[0])
    }, [])
    
    useEffect(() => {
        peer.addEventListener('track', handleTrackEvents)
        return (() => {
            peer.removeEventListener('track', handleTrackEvents)
        })
    }, [handleTrackEvents])
    const handleNegotiation = useCallback(() => {

    },[])

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
    }

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, sendStream,remoteStream }}>
            {props.children}
        </PeerContext.Provider>
    )
}