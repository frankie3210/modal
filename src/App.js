import React, { useState} from "react";
import './App.css';
import {Navbar, FirstContent, Minting} from './Components'

function App() {
  
  const [popup, setpopup] = useState(false);
  
  return (
    <div className="App" style={popup ? {height: "100vh", overflow: "hidden"} : {}}>
      <Navbar setpopup={setpopup}/>
      {popup && <Minting setpopup={setpopup}/>}
      <FirstContent />
    </div>
  );
}

export default App;
