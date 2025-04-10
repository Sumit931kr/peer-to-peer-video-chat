
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Homepage from './pages/homepage/Homepage';
import { SocketProvider } from './provider/Socket';
import { PeerProvider } from './provider/Peer';
import Room from './pages/room/Room';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path='/' element={<Homepage />} />
            <Route path='/room/:roomid' element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App
