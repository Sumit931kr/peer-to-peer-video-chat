import React, { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../../provider/Socket'
import { usePeer } from '../../provider/Peer';
import ReactPlayer from 'react-player'
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer'

const Room = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, sendStream, remoteStream } = usePeer();
    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log("new User joined with emailid " + emailId + " at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())

        const offer = await createOffer();
        socket.emit("call-user", { emailId, offer })
        setRemoteEmailId(emailId)

    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async data => {
        const { from, offer } = data;
        console.log("incoming call from " + from + " with offer" + " at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans })

        setRemoteEmailId(from)
    }, [socket])


    const handleCallAccepted = useCallback(async data => {
        const { ans } = data;
        console.log("Call got accepted " + " at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
        await peer.setRemoteDescription(ans)
    }, [])

    const getUserMedia = useCallback(
        async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            setMyStream(stream)
            console.log("Local video tracks:", stream.getVideoTracks());

            sendStream(stream)
            console.log("Local stream sent to peer connection")
        },
        [],
    );

    const handleIceCandidate = useCallback(async (data) => {
        const { candidate } = data;
        console.log("ice candidate received " + " at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
        await peer.addIceCandidate(candidate)
    }, [peer])

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined)
        socket.on('incomming-call', handleIncommingCall);
        socket.on('call-accepted', handleCallAccepted);
        socket.on('ice-candidate', handleIceCandidate)

        return (() => {
            socket.off('user-joined', handleNewUserJoined)
            socket.off('incomming-call', handleIncommingCall)
            socket.off('call-accepted', handleCallAccepted)
            socket.off('ice-candidate', handleIceCandidate)
        })

    }, [socket, handleNewUserJoined, handleIncommingCall, handleCallAccepted, handleIceCandidate])

    const handleNegotiation = useCallback(async () => {
        // const localOffer = peer.localDescription

        const newOffer = await createOffer()
        socket.emit('call-user', { emailId: remoteEmailId, offer: newOffer });
        console.log("remotetemail " + remoteEmailId)
        console.log("negotiation required at " + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
    }, [peer.localDescription, remoteEmailId, socket])

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation)
        peer.oniceCandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { emailId: remoteEmailId, candidate: event.candidate })
            }
        }
        peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'connected') {
                console.log("Peer connection established")
            }
        }
        return (() => {
            peer.removeEventListener('negotiationneeded', handleNegotiation)
            peer.officeCandidate = null
            peer.onconnectionstatechange = null
        })
    }, [peer, remoteEmailId])



    useEffect(() => {
        getUserMedia()
    }, [])

    // useEffect(() => {
    //     console.log("my stream")
    //     console.log(myStream);
    // }, [myStream])

    // useEffect(() => {
    //     console.log("remote stream")
    //     console.log(remoteStream)
    // }, [remoteStream])


    return (
        <div className='room-container'>
            <h1>ROOM</h1>
            <h4>You are connected to {remoteEmailId}</h4>
            <button onClick={() => sendStream(myStream)}>Send MY Video</button>
            {/* <ReactPlayer url={myStream} playing muted /> */}
            {/* <ReactPlayer url={remoteStream} playing /> */}
            <VideoPlayer stream={myStream} muted={true} />
            {remoteStream && <VideoPlayer stream={remoteStream} muted={false} />}
        </div>
    )
}

export default Room