import React, {useState, useEffect, useCallback} from 'react'
import './homepage.css'
import { useSocket } from '../../provider/Socket'
import { useNavigate } from 'react-router-dom'

const Homepage = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("dev@dev.co")
    const [roomId, setRoomId] = useState("yyy")
    const {socket}  = useSocket();

    const handleJoinRoom = (e) => {
        e.preventDefault()
        // console.log("join-room with email: "+email + " roomId: "+roomId + " at" + new Date().toLocaleTimeString() + ' ' + new Date().getMilliseconds())
        socket.emit('join-room', {emailId:email, roomId: roomId})

    }

    const handleRoomJoined = useCallback(({roomId}) => {
        navigate(`/room/${roomId}`)
    },[])

    useEffect(() => {
      socket.on('joined-room', handleRoomJoined)

      return(()=>{
        socket.off('joined-room', handleRoomJoined)
      })
    }, [socket])
    

    return (
        <div className='homepage_container'>
            <form className="form" onSubmit={handleJoinRoom}>
                <p className="form-title">Enter in the ROOM</p>
                <div className="input-container">
                    <input placeholder="Enter email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div className="input-container">
                    <input placeholder="Enter Room Id" type="text" value={roomId} onChange={(e)=>setRoomId(e.target.value)} />
                </div>
                <button className="submit" type="submit">
                    GO TO ROOM
                </button>
            </form>
        </div>
    )
}

export default Homepage