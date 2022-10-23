const supportedchains={

    56:'BNB Mainnet',
    250:'Fantom Mainnet',
    137:"Polygon Mainnet",
    43114:"Avax Mainnet",
    1:'Ethereum Mainnet',
    4:'Rinkeby'
  
  }

export const getNetworkNamefromChainid = (_chainid) => {
    return supportedchains[_chainid]
  
    }