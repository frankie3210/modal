import React, { useEffect } from "react";
import "./navbar.css";

import { useDispatch, useSelector } from "react-redux";
import { connect } from "../../redux/blockchain/blockchainActions";

function Navbar({ setpopup }) {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem("isWalletConnected") === "true") {
        try {
          dispatch(connect());
        } catch (ex) {
          console.log(ex);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  return (
    <div>
      nav
      <button onClick={() => setpopup(true)}>open</button>
      {blockchain.account === "" || blockchain.account == null ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
          }}
        >
          connect
        </button>
      ) : (
        blockchain.account.substring(0, 4) +
        "..." +
        blockchain.account.substring(
          blockchain.account.length - 3,
          blockchain.account.length
        )
      )}
    </div>
  );
}

export default Navbar;
