import React, { useState, useRef, useEffect } from "react";
import "./Minting.scss";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "../../redux/blockchain/blockchainActions";
import { fetchData } from "../../redux/data/dataActions";

function Minting({ setpopup }) {
  const modal = useRef();
  const closeBtn = useRef();

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  const getEvent = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      blockchain.smartContract.events
        .minted()
        .on("connected", function (subscriptionId) {
          console.log(subscriptionId);
        })
        .on("data", function (event) {
          //console.log(event); // same results as the optional callback above
          getData();
        });
    }
  };

  const handlePopupClose = (e) => {
    if (modal.current && !modal.current.contains(e.target)) {
      setpopup(false);
    }
    if (closeBtn.current && closeBtn.current.contains(e.target)) {
      setpopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handlePopupClose, false);
    getConfig();
    getData();
    getEvent();

    return () => {
      document.removeEventListener("mousedown", handlePopupClose, false);
    };
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <div className="modal">
      <div className="modal-content" ref={modal}>
        <span className="close" ref={closeBtn} onClick={handlePopupClose}>
          &times;
        </span>
        {blockchain.account === "" || blockchain.account == null ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                dispatch(connect());
              }}
            >
              connect
            </button>
            <p style={{ color: "red" }}>
              {blockchain.errorMsg !== "" ? blockchain.errorMsg : null}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <p>Minting!</p>
            Total Supply: {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  decrementMintAmount();
                }}
              >
                -
              </button>
              {mintAmount}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  incrementMintAmount();
                }}
              >
                +
              </button>
            </div>
            <span>{data.paused ? "The sale is not start yet" : "Started"}</span>
            <span>
              {data.whitelistMintEnabled
                ? "Whitelist only"
                : "Everyone can buy"}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                claimNFTs();
                getData();
              }}
            >
              Mint
            </button>
            {feedback}
            {blockchain.errorMsg !== "" ? blockchain.errorMsg : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default Minting;
