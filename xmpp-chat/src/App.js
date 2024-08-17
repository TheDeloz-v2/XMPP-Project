import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from "./components/SignIn/SignIn";
import MainPage from "./components/MainPage/MainPage";

function App() {
  const [xmppClient, setXmppClient] = useState(null);

  // La función setXmppClient simplemente guarda la instancia del cliente XMPP en el estado
  const handleSetXmppClient = (xmpp) => {
    setXmppClient(xmpp);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn setXmppClient={handleSetXmppClient} />} />
        <Route path="/chat" element={<MainPage xmppClient={xmppClient} />} />
      </Routes>
    </Router>
  );
}

export default App;


