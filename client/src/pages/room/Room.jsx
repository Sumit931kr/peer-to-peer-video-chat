import React, { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../../provider/Socket'
import { usePeer } from '../../provider/Peer';
import ReactPlayer from 'react-player'

const Room = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, sendStream, remoteStream } = usePeer();
    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log("new User joined with emailid " + emailId)
        const offer = await createOffer();
        socket.emit("call-user", { emailId, offer })
        setRemoteEmailId(emailId)

    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async data => {
        const { from, offer } = data;
        // console.log("incoming call from " + from + " " + offer)
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans })
    }, [])

    const handleCallAccepted = useCallback(async data => {
        const { ans } = data;
        console.log("Call got accepted ", ans)
        await peer.setRemoteDescription(ans)

    }, [myStream, sendStream])

    const getUserMedia = useCallback(
        async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            setMyStream(stream)
        },
        [],
    )

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined)
        socket.on('incomming-call', handleIncommingCall);
        socket.on('call-accepted', handleCallAccepted)

        return (() => {
            socket.off('user-joined', handleNewUserJoined)
            socket.off('incomming-call', handleIncommingCall)
            socket.off('call-accepted', handleCallAccepted)
        })

    }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted])

    const handleNegotiation = useCallback(() => {
        const localOffer = peer.localDescription
        socket.emit('call-user', {emailId: remoteEmailId, offer: localOffer});
    }, [peer.localDescription, remoteEmailId, socket])

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation)
        return (() => {
            peer.removeEventListener('negotiationneeded', handleNegotiation)
        })
    }, [])



    useEffect(() => {
        getUserMedia()
    }, [])



    return (
        <div className='room-container'>
            <h1>ROOM</h1>
            <h4>You are connected to {remoteEmailId}</h4>
            <button onClick={() => sendStream(myStream)}>Send MY Video</button>
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing />
        </div>
    )
}

export default Room