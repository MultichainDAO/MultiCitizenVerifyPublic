import { useEffect, useState } from "react";

import {
  connectWallet,
  getCurrentWalletConnected,

  getDaiBalanceAllowance,

  verifyOwnerGeneric,
} from "./util/interact.js";
import Web3 from 'web3';

import { getNetworkNamefromChainid } from "./util/networknames";
require('dotenv').config()
const testing=process.env.REACT_APP_testingbool
console.log(`testing bool is ${testing}`)


const supportedchains=[
  
  // '0x1',
// '0x61',
// '0x4',

// '0x38',
56,
97,
137,
250,
1,
4
// '0xfa'
]


const discordauthurl={
  1:'https://discord.com/api/oauth2/authorize?client_id=1018299383286075405&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=token&scope=identify',
  0:"https://discord.com/api/oauth2/authorize?client_id=1018299383286075405&redirect_uri=https%3A%2F%2Fmultidao.netlify.app%2F&response_type=token&scope=identify"
}
//testing url and real
const vemultidiscordapi={
  '1':'http://localhost:8081',
  // '1':'https://vemultidiscordapi.herokuapp.com',
  '0':process.env.prodapi
}

const VerifyUi = (props) => {
  const [walletAddress, setWallet] = useState("");
  const [receiverAddress, setreceiverAddress] = useState("");
  const [daiBalance, setdaiBalance] = useState("0");
  const [daiAllowance, setdaiAllowance] = useState("");
  const [status, setStatus] = useState("");
  const [status2, setStatus2] = useState("");
  const [chainid, setChainid] = useState("");
  const [chainidList, setChainidList] = useState(new Set());
  const [chainidTxsuccess, setChainidTxsuccess] = useState({
    // 250:0,
    // 137:0
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");
  const [discordUser, setDiscordUser] = useState();

  useEffect(async () => {
    const { address, status ,chainid} = await getCurrentWalletConnected();
    await discord_codefortoken()
    setWallet(address);

    
    setreceiverAddress(address)
    setStatus(status);
    setChainid(chainid)

    if (supportedchains.includes(chainid)){
    const {daiBalance,daiAllowance}=await getDaiBalanceAllowance(address,chainid)
    setdaiBalance(daiBalance)
    setdaiAllowance(daiAllowance)}



    // console.log(chainidList)
    addWalletListener();
    changeChainListener();
  }, []);

  useEffect(async () => {
    const { address, status ,chainid} = await getCurrentWalletConnected();

    setWallet(address);

    setreceiverAddress(address)

    if (supportedchains.includes(chainid)){
    const {daiBalance,daiAllowance}=await getDaiBalanceAllowance(address,chainid)
    setdaiBalance(daiBalance)
    setdaiAllowance(daiAllowance)
  }
    setStatus(status);
    setChainid(chainid)

    // console.log(chainidList)

  }, [walletAddress]);

  async function discord_codefortoken(){
    const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

  const fetchUsers = () => {
      fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      })
      .then(result => result.json())
      .then(response => {
        // response format 
        /*
        {
              "id": "<user_id>",
              "username": "Poopeye",
              "avatar": "3118e64af30fc703b9bf3328d156155c",
              ...
          }
        */
        // user as avatar URL: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        setDiscordUser(response);
      })
      .catch(console.error);
  };

  if (accessToken) {
    fetchUsers();
  }
  
  }


  async function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          // setdaiBalance(await getDaiBalance(walletAddress,chainid))
          setStatus("");
          // window.location.reload();
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  function changeChainListener() {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (_chainid) => {
        
        window.location.reload();
    } )
  
  }}

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onVerifyPressed = async () => {
    
    const { success, status,mes,_discorduser } = await verifyOwnerGeneric(discordUser)
    setStatus(status);

    console.log(success, status,mes,_discorduser)
    if (success&&_discorduser) {
      setStatus2('granting role...')

      console.log(testing)
      const redirecturl= `${vemultidiscordapi[testing]}/discordrole?&mes=${mes}&user=${_discorduser.id}`
      console.log( redirecturl)
      const res=await fetch(redirecturl)
      console.log(res.status)
      setStatus2('You are now a Multi-Citizen! You may go back to discord.')
      // window.location.replace( redirecturl)
    }
  };


  // 1018299383286075405


  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">MultiDao SBT</h1>
      <p>
        {`Hi ${discordUser?discordUser['username']:''} This dapp verifies your ownership of SBT and grant you your discord role. Please use the wallet with the SBT`}
        
      </p>

      <p>
        {discordUser?'':`You are not connected to discord. Please use this link to connect: `}
        {discordUser?'':<a  href={discordauthurl[testing]}  target="_blank" >Connect Discord</a>}
      </p>
      
      {/* <a href="https://bscscan.com/address/0xe80E5de02eB7E3726eeaB3FeE82E0177c53D64D3" target="_blank">Contract Address</a>

         */}
      <h2>Your VePower: {daiBalance}</h2>

      
  
          {/* <ChainidButtons chainid={chainid} chainidList={chainidList} setChainidList={setChainidList}/> */}
      {/* <form>
    

        <h2>Receiver: </h2>
        <input
          type="text"
          placeholder="The address you want gas..."
          value={receiverAddress}
          onChange={(event) => setreceiverAddress(event.target.value)}
        />
        
      </form> */}

      
      {supportedchains.includes(chainid)?
      <div>
      
      <button id="button" className={daiBalance>20?"":""} onClick={daiBalance>20?()=>onVerifyPressed(discordUser):""}>
         {daiBalance>20?"Sign to Verify":"Not Enough Vepower "} 
      </button>

      </div>:<></>
      }
      <p id="status" style={{ color: "white" }}>
        {status}
      </p>

      <p id="status" style={{ color: "white" }}>
        {status2}
      </p>
        {/* <SendGasStatus chainidTxsuccess={chainidTxsuccess}/> */}
      {/* <p id="transferstatus1" style={{ color: "black" }}>
        {}
      </p>
      <p id="transferstatus2" style={{ color: "black" }}>
        {}
      </p> */}

      <p id="chainid">
      {supportedchains.includes(chainid)?`🟢 You're connected to ${getNetworkNamefromChainid(chainid)}`:'🔴 Please connect to Polygon mainnet'}
      </p>
      
      {/* <p id="chainidlist">
        {Array.from(chainidList).join(' ')}
      </p> */}
      
      {/* <div/> */}
    </div>
  );
};

export default VerifyUi;
