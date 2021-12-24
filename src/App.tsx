import React from "react";
import { Route, Routes } from "react-router-dom";
import "./global.scss";
import { Home } from "./Home/Home";
import { Room } from "./Room/Room";

function App() {
  return (
    <Routes>
      <Route path="/videocall" element={<Home />} />
      <Route path="/videocall/room/:roomId" element={<Room />} />
    </Routes>
  );
}

export default App;
