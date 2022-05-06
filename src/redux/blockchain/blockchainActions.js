// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    const { ethereum } = window;
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (metamaskIsInstalled) {
      Web3EthContract.setProvider(ethereum);
      let web3 = new Web3(ethereum);
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const networkId = await ethereum.request({
          method: "net_version",
        });

        if (networkId == CONFIG.NETWORK.ID) {
          const SmartContractObj = new Web3EthContract(
            abi,
            CONFIG.CONTRACT_ADDRESS
          );
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
            })
          );
          localStorage.setItem("isWalletConnected", true);
          // Add listeners start
          ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
            //console.log("accountsChanged")
            //console.log(accounts[0])
            if (accounts[0] === "" || accounts[0] == null) {
              localStorage.setItem("isWalletConnected", false);
              //console.log("isWalletConnected = false")
            }
          });
          ethereum.on("chainChanged", () => {
            window.location.reload();
            console.log("chainChanged");
          });
          // Add listeners end
        } else {
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
          await web3.currentProvider
            .request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: Web3.utils.toHex(CONFIG.NETWORK.ID) }],
            })
            .then(() => {
              console.log("switched");
              localStorage.setItem("isWalletConnected", true);
              window.location.reload();
            });
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong. " + err.message));
      }
    } else {
      dispatch(connectFailed("Please Install Metamask."));
      window.open("https://metamask.app.link/dapp/modaltest1.netlify.app/");
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};

export const updateChain = (account) => {
  return async (dispatch) => {
    try {
      const CONFIG = await configResponse.json();
      const { ethereum } = window;
      const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch {}
  };
};
