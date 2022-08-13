import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
// import BarChart from "./component/BarChart";
// import NewChart from "./component/LineChart";
// import LineChart from "./component/LineChart";
import Chart from "./component/Chart";
import axios from "axios";

// import CoinGecko from 'coingecko-api';

function App() {
  //2. Initiate the CoinGecko API Client
  // const CoinGeckoClient = new CoinGecko();

  // What we need : CoinIcon, Coin Name, Price, 24 hour Change, 24 Hour Change Percentage,  Price in USD
  //
  //
  //
  //
  //
  //

  useEffect(() => {
    // func()
    var func2 = async () => {
      let url =
        "https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a/market_chart/?vs_currency=usd&days=1000";
      try {
        const response = await axios.get(url);
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };
    // Returns : Price, 24 hour Volume, 24 Hour Price Change,  Price in USD
    // Coingecko URL : /simple/token_price/{id}
    var getERC20PriceData = async () => {
      let contractAddress = "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a";

      let baseURL = "https://api.coingecko.com/api/v3/simple/token_price";
      let coingeckoNetwork = "polygon-pos";
      let contract_addresses = "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a";
      let url = `${baseURL}/${coingeckoNetwork}?contract_addresses=${contract_addresses}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
      try {
        const response = await axios.get(url);
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };
    // getERC20PriceData();

    // Returns : Coin Name, Logo,
    // Coingecko URL : /coins/{id}/contract/{contract_address}
    // image = response.data.data.image.small
    // name = response.data.data.name
    // symbol = response.data.data.symbol
    var getERC20CoinInfo = async () => {
      let contractAddress = "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a";
      let url = `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/${contractAddress}`;
      // let url = `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a`;
      try {
        const response = await axios.get(url);
        console.log(response);
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    };
    // getERC20CoinInfo()

    // Returns : Coin Name, Logo,
    // Coingecko URL : /coins/{id}/contract/{contract_address}
    // image = response.data.data.image.small
    // name = response.data.data.name
    // symbol = response.data.data.symbol
    var getERC20CoinChartInfo = async () => {
      let contractAddress = "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a";
      // let url = `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/${contractAddress}`;
      // let url = `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a/market_chart/?vs_currency=usd&days=1`;
      let url = `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6%2C0xd6df932a45c0f255f85145f286ea0b292b21c90b%2C0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a%2C0x2791bca1f2de4661ed88a30c99a7a9449aa84174%2C0xc2132d05d31c914a87c6611c10748aeb04b58e8f%2C0x8f3cf7ad23cd3cadbd9735aff958023239c6a063%2C0x3cef98bb43d732e2f285ee605a8158cde967d219%2C0xdb7cb471dd0b49b29cab4a1c14d070f27216a0ab%2C0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c%2C0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
      // let url = `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/${contractAddress}/market_chart/?vs_currency=usd&days=1`;
      // let url1 = `https://api.etherscan.io/api?module=account&action=txlist&address=0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=2ITGYS1ITD1IF1ADVZQ96HRFFCQ235BZXD`;
      try {
        const response = await axios.get(url);
        // let prices =response.data;
        // let prices =response.data.prices;
        // console.log(prices);
        // console.log(prices.length);
        // console.log(prices[0][0]);
        // console.log(prices[0][1]);
        console.log("sss", response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    // HOME PAGE WORKING
    const fetchTokensData = async (contractAddressess) => {
      const BASE_URL = "https://api.coingecko.com/api/v3";
      const END_POINT = "simple/token_price";
      const ASSET_PLATFORM = "polygon-pos";
      const CONTRACT_ADDRESSESS = contractAddressess;
      const OTHER_PARAMS =
        "vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true";
      let url = `${BASE_URL}/${END_POINT}/${ASSET_PLATFORM}?contract_addresses=${CONTRACT_ADDRESSESS}&${OTHER_PARAMS}`;
      try {
        const response = await axios.get(url);
        let result = response.data;
        let newObj = {};
        console.log("RESULT TOKENS DATA", result);
        // Iterate through the object
        for (const key in result) {
          // newObj[key] = result[key];
          newObj[`${key}`] = {};
          newObj[`${key}`]["priceInUSD"] = result[key]["usd"];
          newObj[`${key}`]["percentagePriceChange24h"] =
            result[key]["usd_24h_change"];
          newObj[`${key}`]["priceChange24h"] =
            (result[key]["usd_24h_change"] * result[key]["usd"]) / 100;
        }
        return newObj;
      } catch (error) {
        console.error(error);
      }
    };
    const fetchNativeData = async () => {
      const BASE_URL = "https://api.coingecko.com/api/v3";
      const END_POINT = "coins/matic-network";
      let url = `${BASE_URL}/${END_POINT}`;
      try {
        const response = await axios.get(url);
        // console.log("rajanNative", response.data);
        let returnObj = {
          contractAddress: "0xeth",
          name: response.data.name,
          symbol: response.data.symbol,
          priceInUSD: response.data.market_data.current_price.usd,
          priceChange24h: response.data.market_data.price_change_24h,
          percentagePriceChange24h:
            response.data.market_data.price_change_percentage_24h,
        };
        // console.log("RESULT TOKENS DATA", returnObj);
        return returnObj;
      } catch (error) {
        console.error(error);
      }
    };
    function urlUtility(arrayOfContracts) {
      console.log("rajan------------------");
      let newArray = [];
      let native = false;
      let nonnative = false;
      arrayOfContracts.forEach((element) => {
        if (element === "0xeth") {
          native = true;
        } else {
          newArray.push(element.toLowerCase().toString());
        }
      });

      // Making URL Converter Compatible with API
      let url = "";
      if (newArray.length > 0) {
        nonnative = true;
        url = newArray[0];
        if (newArray.length > 1) {
          for (let i = 1; i < newArray.length; i++) {
            url = url + "%2C" + newArray[i];
          }
        }
      }

      console.log("rajan------------------>>>>>>>>");
      let returnObj = { native: native, url: url, nonnative: nonnative };
      return returnObj;
    }

    const getAggregatedData = async (arrayOfContracts) => {
      let urlManipulator = urlUtility(arrayOfContracts);
      // console.log("rajanURLManipulator", urlManipulator);
      // console.log("rajannewArray", newArray);
      // Native Token Data Fetch
      let nativeTokenData = "";
      if (urlManipulator.native) {
        nativeTokenData = await fetchNativeData();
        console.log("rajanNativeFinal", nativeTokenData);
      }
      // ERC20 Token Data Fetch
      let nonNativeTokenData = "";
      if (urlManipulator.nonnative) {
        nonNativeTokenData = await fetchTokensData(urlManipulator.url);
        console.log("rajanNonNativeFinal", nonNativeTokenData);
      }
      let mergeNativeAndNonNative = nonNativeTokenData;
      if (urlManipulator.native) {
        mergeNativeAndNonNative["0xeth"] = {};
        mergeNativeAndNonNative["0xeth"]["priceInUSD"] =
          nativeTokenData["priceInUSD"];
        mergeNativeAndNonNative["0xeth"]["priceChange24h"] =
          nativeTokenData["priceChange24h"];
        mergeNativeAndNonNative["0xeth"]["percentagePriceChange24h"] =
          nativeTokenData["percentagePriceChange24h"];
      }
      return mergeNativeAndNonNative;
      // console.log("rajanNonNativeFinalmer", mergeNativeAndNonNative);
    };

    const Test = async () => {
      let contractMapping = {
        "0xcb1e72786a6eb3b44c2a2429e317c8a2462cfeb1":
          "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        "0xe03489d4e90b22c59c5e23d45dfd59fc0db8a025":
          "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
        "0x742dfa5aa70a8212857966d491d67b09ce7d6ec7":
          "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "0x3813e82e6f7098b9583fc0f33a962d02018b6803":
          "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        "0x5b67676a984807a212b1c59ebfc9b3568a474f0a":
          "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        "0xeth": "0xeth",
      };

      function contractAddressChanger(inputTestnetContract) {
        return contractMapping[inputTestnetContract];
      }

      // const IOHandlerBetweenBackendAndFrontendData(backendOutput){
      // }
      let inputObject = contractMapping;
      let outputArray = [];
      // Iterate through the object
      for (const key in inputObject) {
        console.log("outputArray", inputObject[key]);
        console.log("outputArrayXXXX", contractAddressChanger(key));
        outputArray.push(contractAddressChanger(key));
      }

      console.log("outputArray0000", outputArray);

      ///////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////
      // Mainnet Contract Addressess
      const arrayOfContracts = [
        "0xbbba073c31bf03b8acf7c28ef0738decf3695683",
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        "0xeth",
      ];

      console.log("FINAL");
      let result = await getAggregatedData(arrayOfContracts);
      console.log("FINAL", result);
    };
    Test();

    // function switchContractAddress(){

    //   arrayOfContracts.forEach((element) => {
    //     if (element === "0xeth") {
    //       native = true;
    //     } else {
    //       newArray.push(element.toLowerCase().toString());
    //     }
    //   });

    // }
  });

  return (
    <div className="App">
      <Chart />
      hello
      {/* <LineChart/> */}
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
