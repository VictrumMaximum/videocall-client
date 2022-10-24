import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Welcome } from './Room/Welcome/Welcome';

import './global.scss';
import { Room } from './Room/Room';

function App() {
  return (
    <Routes>
      <Route path="/videocall" element={<Welcome />} />
      <Route path="/videocall/:roomId" element={<Welcome />} />
      <Route path="/videocall/room/:roomId" element={<Room />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;

const PageNotFound = () => {
  return <div>Page not found.</div>;
};
