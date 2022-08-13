import React, { useState, useEffect, useContext, useCallback } from "react";
import { LoginContext } from "../../Constants/AllContext";
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  Text,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { BigNumber } from "bignumber.js";
import { GET_TOKEN_LIST } from "../../GraphqlOperations/query/query";
import { useQuery } from "@apollo/client";
import { useFocusEffect } from "@react-navigation/native";

import GradientBackGround from "../../Components/GradientBackGround";
import { colors } from "../../Styles/theme";
import Input from "../../Components/Input";
import DropDown from "../../Components/DropDown";
import Button from "../../Components/Button";
import AntDesign from "react-native-vector-icons/AntDesign";
import Model from "../../Components/Model";
import Loader from "../../Components/Loader";
import { TokenValueRegix } from "../../Utils/regexPattern";

import { erc20_abi } from "../../Utils/ABI";
import { swapContractDetails } from "../../ABIs/swapContract";
import { optimalRoutePath } from "../../Utils/multihopScript";
import MyWallet from "../../Utils/myWallet";
import { convertToEther, convertToWei } from "../../Utils/conversions";

const loggedInUser = MyWallet?.getWallet()?.address
  ? MyWallet.getWallet().address
  : "";
const actionIn = "IN";
const actionOut = "OUT";
const etherAddress = "0x5B67676a984807a212b1c59eBFc9B3568a474F0a";
const privateKey = MyWallet?.getWallet()?.privateKey
  ? MyWallet.getWallet().privateKey
  : "";
const approvalAmount = "9999999999999999999999999999999999999999999999999";

const Swap = ({ navigation, route }) => {
  const { web3Context } = useContext(LoginContext);
  const web3 = web3Context;
  const [isSwap, setIsSwap] = useState<boolean>(true);
  const [inputPercentage, setInputPercentage] = useState<number>(0);
  const { data, refetch, loading } = useQuery(GET_TOKEN_LIST);

  const [tokenIn, setTokenIn] = useState<any>({ symbol: "" });
  const [tokenOut, setTokenOut] = useState<any>({ symbol: "" });
  const [instanceOfSwapContract, setInstanceOfSwapContract] = useState<any>({});
  const [instanceOfInputTokenContract, setInstanceOfInputTokenContract] =
    useState<any>({});
  const [inputTokenBalance, setInputTokenBalance] = useState<string>("0");
  const [inputAmountToSwap, setInputAmountToSwap] = useState<string>("0");
  const [outputAmountToSwap, setOutputAmountToSwap] = useState<string>("0");
  const [transactionFees, setTransactionFees] = useState<string>("");
  const [transactionFeesAmount, setTransactionFeesAmount] =
    useState<string>("");
  const [inputEquivalentOfOneOutput, setInputEquivalentOfOneOutput] =
    useState<string>("0");
  const [swapAction, setSwapAction] = useState<string>("IN");
  const [tokenRoutesPath, setTokenRoutesPath] = useState<any>([]);
  const [feeRoutesPath, setFeeRoutesPath] = useState<any>([]);
  const [buttonStatus, setButtonStatus] = useState<boolean>(true);
  const [buttonMessage, setButtonMessage] = useState<string>("Enter an amount");
  const [showSmallLoader, setShowSmallLoader] = useState<boolean>(false);
  const [transactionLoader, setTransactionLoader] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(null);
  const [nativeToken, setNativeToken] = useState<boolean>(false);
  const [transactionLoadingMessage, setTransactionLoadingMessage] =
    useState<string>("");
  const [modelsubheaderMessage, setModelsubheaderMessage] =
    useState<string>("");

  // useFocusEffect(() => {
  //   refetch();
  // });

  useEffect(() => {
    if (data) {
      setTokenIn(data?.getTokens?.tokens[0]);
      setTokenOut(data?.getTokens?.tokens[1]);
      const swapContractConnection = async () => {
        let instance = await contractConnection(
          swapContractDetails.abi,
          swapContractDetails.contractAddress
        );
        setTransactionFees(await getTransactionFees(instance));
        setInstanceOfSwapContract(instance);
        await onSelectOfInputToken(data?.getTokens?.tokens[0], 0);
      };
      swapContractConnection();
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setTokenIn(data?.getTokens?.tokens[0]);
      setTokenOut(data?.getTokens?.tokens[1]);
    }
  }, [data]);

  //   const [indicator, setIndicator] = useState<boolean>(false);
  let x = false;
  useEffect(() => {
    if (x == false) {
      const swapContractConnection = async () => {
        let instance = await contractConnection(
          swapContractDetails.abi,
          swapContractDetails.contractAddress
        );
        setTransactionFees(await getTransactionFees(instance));
        setInstanceOfSwapContract(instance);
        await onSelectOfInputToken(data?.getTokens?.tokens[0], 0);
        x = true;
      };
      swapContractConnection();
    }
  }, [tokenIn, tokenOut]);

  useEffect(() => {
    const { selectedToken, selectedFromRoute } = route.params;
    if (selectedToken) {
      const onUpdateDropDownList = async () => {
        if (selectedFromRoute === actionIn) {
          await onSelectOfInputToken(selectedToken, 0);
        } else if (selectedFromRoute === actionOut) {
          await onSelectOfOutputToken(selectedToken);
        }
      };
      onUpdateDropDownList();
    }
  }, [route.params]);

  const checkTokenPairExists = async (
    inputToken,
    outputToken,
    inputAmount,
    indicator
  ) => {
    try {
      if (inputToken === "0xeth") {
        inputToken = etherAddress;
      } else if (outputToken === "0xeth") {
        outputToken = etherAddress;
      }
      let amount;
      if (inputAmount === "0" || inputAmount === "") {
        amount = "1";
      } else {
        amount = inputAmount;
      }

      let value = await optimalRoutePath(
        inputToken,
        outputToken,
        amount,
        indicator
      );
      return value;
    } catch (error) {
      throw new Error("Error in checkTokenPairExists");
    }
  };

  const contractConnection = async (abi, contractAddress) => {
    try {
      var contract = await new web3.eth.Contract(
        abi,
        contractAddress === "0xeth" ? etherAddress : contractAddress
      );
      return contract;
    } catch (error) {
      throw new Error("Error in contractConnection");
    }
  };

  const getUserBalance = async (contractInstance, decimals) => {
    try {
      let balanceInWei;
      if (contractInstance) {
        balanceInWei = await contractInstance.methods
          .balanceOf(loggedInUser)
          .call();
      } else {
        balanceInWei = await web3.eth.getBalance(loggedInUser);
      }
      return await convertToEther(balanceInWei, decimals);
    } catch (error) {
      throw new Error("Error in getUserBalance");
    }
  };

  const getTransactionFees = async (instance) => {
    try {
      let fees = await instance.methods.gieAppFees().call();
      let feesDecimals = await instance.methods.gieAppFeesDecimals().call();
      return (Number(fees) / Number(feesDecimals)).toString();
    } catch (error) {
      return "0";
    }
  };

  const calculateTransactionAmount = async (
    inputAmount,
    tokenPath,
    decimals
  ) => {
    try {
      let fees;
      const amount = await convertToWei(inputAmount, decimals);
      let result = await instanceOfSwapContract.methods
        .calculateFeesForTransaction(amount)
        .call();

      if (
        tokenPath[0] === etherAddress ||
        (feeRoutesPath.path.length === 0 && feeRoutesPath.trade_status === 0)
      ) {
        return await convertToEther(result, decimals);
      } else {
        fees = await instanceOfSwapContract.methods
          .getAmountsOut(result, tokenPath)
          .call();
      }
      return await convertToEther(fees[fees.length - 1], "18");
    } catch (error) {
      throw new Error("Error in calculateTransactionAmount");
    }
  };

  const getInputAndOutputAmount = async (
    amount,
    actionOfSwap,
    tokensPath,
    percentage,
    tokenInDecimals,
    tokenOutDecimals,
    userBalance
  ) => {
    try {
      let resultArray: any[] = [];
      let result;
      if (actionOfSwap === actionOut) {
        const amountInWei = await convertToWei(amount, tokenOutDecimals);
        result = await instanceOfSwapContract.methods
          .getAmountsIn(amountInWei, tokensPath)
          .call();
        resultArray[0] = await convertToEther(result[0], tokenInDecimals);
        resultArray[1] = await convertToEther(
          result[result.length - 1],
          tokenOutDecimals
        );
      } else {
        if (percentage !== 0) {
          const balanceInWei = await convertToWei(userBalance, tokenInDecimals);
          amount = new BigNumber(balanceInWei.toString())
            .multipliedBy(new BigNumber(percentage.toString()))
            .dividedBy(new BigNumber("100"))
            .toFixed(0)
            .toString();
        } else {
          amount = await convertToWei(amount, tokenInDecimals);
        }
        result = await instanceOfSwapContract.methods
          .getAmountsOut(amount, tokensPath)
          .call();
        resultArray[0] = await convertToEther(result[0], tokenInDecimals);
        resultArray[1] = await convertToEther(
          result[result.length - 1],
          tokenOutDecimals
        );
        setInputPercentage(percentage);
      }
      if (result[result.length - 1] === "0" || resultArray[1] == "0") {
        setInputEquivalentOfOneOutput("0");
      } else {
        setInputEquivalentOfOneOutput(
          new BigNumber(result[0])
            .dividedBy(new BigNumber(result[result.length - 1]))
            .toFixed()
            .toString()
        );
      }
      return resultArray;
    } catch (error) {
      setInputEquivalentOfOneOutput("0");
      return ["0", "0"];
    }
  };

  const setButtonMessageAndStatus = async (
    tokenPairExist,
    feesPairExist,
    userBalance,
    inputAmount,
    decimals
  ) => {
    try {
      let result = { message: "", status: true };
      const amount = convertToWei(inputAmount, decimals);
      const balance = convertToWei(userBalance, decimals);
      if (
        tokenPairExist.trade_status === 1 ||
        feesPairExist.trade_status === 1
      ) {
        result.message = "Price impact too high";
        result.status = true;
      } else if (inputAmount === "0" || inputAmount === "") {
        result.message = "Enter an amount";
        result.status = true;
      } else if (parseFloat(amount) > parseFloat(balance)) {
        result.message = "Insufficient amount";
        result.status = true;
        setInputAmountToSwap(inputAmount);
      } else {
        result.message = "Swap";
        result.status = false;
      }
      return result;
    } catch (error) {
      throw new Error("Error in setButtonMessageAndStatus");
    }
  };

  const createDeadline = () => {
    return Math.floor(new Date().getTime() / 1000.0) + 1800;
  };

  const checkAllowance = async (tokenContractInstance) => {
    try {
      let inputInWei = await convertToWei(inputAmountToSwap, tokenIn.decimals);
      let allowance = await tokenContractInstance.methods
        .allowance(loggedInUser, swapContractDetails.contractAddress)
        .call();
      let result = new BigNumber(allowance).comparedTo(
        new BigNumber(inputInWei)
      );
      return result === 0 || result === 1 ? true : false;
    } catch (error) {
      throw new Error("Error in checkAllowance");
    }
  };

  /* Handel input token selection in dropdown*/
  const onSelectOfInputToken = async (inputToken, isInterchange) => {
    setShowSmallLoader(true);
    try {
      let temporaryAction = swapAction;
      let newInputToken;
      let newOutputToken;
      let tokenPair;
      let feesPair;
      let inputTokenContract;
      if (isInterchange === 1 && inputToken === null) {
        newInputToken = tokenOut;
        newOutputToken = tokenIn;
        temporaryAction = actionIn;
      } else {
        newInputToken = inputToken;
        newOutputToken = tokenOut;
      }
      if (newInputToken.contractAddress == "0xeth") {
        setNativeToken(true);
      } else {
        setNativeToken(false);
      }
      inputTokenContract = await contractConnection(
        erc20_abi,
        newInputToken.contractAddress
      );
      setInputTokenBalance(
        await getUserBalance(
          newInputToken.contractAddress === "0xeth" ? null : inputTokenContract,
          newInputToken.decimals
        )
      );
      setInputAmountToSwap("");
      setOutputAmountToSwap("");
      tokenPair = await checkTokenPairExists(
        newInputToken.contractAddress,
        newOutputToken.contractAddress,
        inputAmountToSwap,
        temporaryAction === actionIn ? true : false
      );
      if (tokenPair.trade_status == 0) {
        feesPair =
          newInputToken.contractAddress === "0xeth" ||
          newInputToken.contractAddress === etherAddress
            ? (feesPair = {
                path: [],
                amounts: [],
                pathPairs: undefined,
                symbols: [],
                priceImpact: 0,
                trade_status: 0,
              })
            : await checkTokenPairExists(
                newInputToken.contractAddress,
                etherAddress,
                "1",
                temporaryAction === actionIn ? true : false
              );
      } else {
        feesPair = {
          path: [],
          amounts: [],
          pathPairs: undefined,
          symbols: [],
          priceImpact: 0,
          trade_status: 1,
        };
      }
      setTokenRoutesPath(tokenPair);
      setFeeRoutesPath(feesPair);
      setInstanceOfInputTokenContract(
        newInputToken.contractAddress === "0xeth" ? null : inputTokenContract
      );
      setInputEquivalentOfOneOutput("0");
      setTransactionFeesAmount("0");
      setButtonMessage("Enter an amount");
      setButtonStatus(true);
      setTokenIn(newInputToken);
      setTokenOut(newOutputToken);
      setShowSmallLoader(false);
      setSwapAction(temporaryAction);
    } catch (error) {
      setShowSmallLoader(false);
    }
  };

  const onSelectOfOutputToken = async (outputToken) => {
    setShowSmallLoader(true);
    try {
      let tokenPair;
      tokenPair = await checkTokenPairExists(
        tokenIn.contractAddress,
        outputToken.contractAddress,
        inputAmountToSwap,
        swapAction === actionIn ? true : false
      );
      setTokenRoutesPath(tokenPair);
      setInputEquivalentOfOneOutput("0");
      setTransactionFeesAmount("0");
      setInputAmountToSwap("");
      setOutputAmountToSwap("");
      setButtonMessage("Enter an amount");
      setButtonStatus(true);
      setTokenOut(outputToken);
      setShowSmallLoader(false);
    } catch (error) {
      setShowSmallLoader(false);
    }
  };
  const onChangeOfInputFieldOfInputToken = async (inputAmount, percentage) => {
    setShowSmallLoader(true);
    try {
      let temporaryAction = actionIn;
      let amounts;
      let value = !!parseFloat(inputAmount);
      if (value || inputAmount === "0") {
        if (tokenRoutesPath.trade_status === 0) {
          let tokenPair = await checkTokenPairExists(
            tokenRoutesPath.path[0],
            tokenRoutesPath.path[tokenRoutesPath.path.length - 1],
            inputAmount,
            temporaryAction === actionIn ? true : false
          );
          if (
            Math.abs(tokenPair.priceImpact) <= 15 &&
            tokenPair.trade_status == 0
          ) {
            amounts = await getInputAndOutputAmount(
              new BigNumber(inputAmount).toFixed(),
              temporaryAction,
              tokenRoutesPath.path,
              percentage,
              tokenIn.decimals,
              tokenOut.decimals,
              inputTokenBalance
            );
            if (percentage > 0) {
              setInputAmountToSwap(amounts[0]);
            }

            setOutputAmountToSwap(amounts[1]);

            if (feeRoutesPath.trade_status === 0) {
              setTransactionFeesAmount(
                await calculateTransactionAmount(
                  amounts[0],
                  feeRoutesPath.path,
                  tokenIn.decimals
                )
              );
            }
            let buttonCondition = await setButtonMessageAndStatus(
              tokenRoutesPath,
              feeRoutesPath,
              inputTokenBalance,
              inputAmount,
              tokenIn.decimals
            );
            setButtonStatus(buttonCondition.status);
            setButtonMessage(buttonCondition.message);
          } else {
            setInputAmountToSwap("");
            setOutputAmountToSwap("");
            setButtonMessage("Price impact too high");
            setButtonStatus(true);
            setInputEquivalentOfOneOutput("0");
            setTransactionFeesAmount("0");
          }
        } else {
          setInputAmountToSwap("");
          setOutputAmountToSwap("");
          setButtonMessage("Token pair not exist");
          setButtonStatus(true);
          setInputEquivalentOfOneOutput("0");
          setTransactionFeesAmount("0");
        }
        setSwapAction(temporaryAction);
      } else {
        setInputAmountToSwap(inputAmount);
        setOutputAmountToSwap("0");
        setButtonMessage("Enter an amount");
        setButtonStatus(true);
        setInputEquivalentOfOneOutput("0");
        setTransactionFeesAmount("0");
      }
      setShowSmallLoader(false);
    } catch (error) {
      setShowSmallLoader(false);
    }
  };

  const onChangeOfInputFieldOfOutputToken = async (outputAmount) => {
    setShowSmallLoader(true);
    try {
      let temporaryAction = actionOut;
      let amounts;
      let messageResult;
      let value = !!parseFloat(outputAmount);
      if (value || outputAmount === "0") {
        if (tokenRoutesPath.trade_status === 0) {
          let tokenPair = await checkTokenPairExists(
            tokenRoutesPath.path[0],
            tokenRoutesPath.path[tokenRoutesPath.path.length - 1],
            outputAmount,
            temporaryAction === actionIn ? true : false
          );
          if (
            Math.abs(tokenPair.priceImpact) <= 15 &&
            tokenPair.trade_status == 0
          ) {
            amounts = await getInputAndOutputAmount(
              new BigNumber(outputAmount).toFixed(),
              temporaryAction,
              tokenRoutesPath.path,
              0,
              tokenIn.decimals,
              tokenOut.decimals,
              inputTokenBalance
            );
            console.log(amounts, "amt<<<<<");
            setInputAmountToSwap(amounts[0]);
            setOutputAmountToSwap(outputAmount);
            if (feeRoutesPath.trade_status === 0) {
              setTransactionFeesAmount(
                await calculateTransactionAmount(
                  amounts[0],
                  feeRoutesPath.path,
                  tokenIn.decimals
                )
              );
            }
            messageResult = await setButtonMessageAndStatus(
              tokenRoutesPath,
              feeRoutesPath,
              inputTokenBalance,
              amounts[0],
              tokenIn.decimals
            );
            setButtonStatus(messageResult.status);
            setButtonMessage(messageResult.message);
          } else {
            setInputAmountToSwap("");
            setOutputAmountToSwap("");
            setButtonMessage("Price impact too high");
            setButtonStatus(true);
            setInputEquivalentOfOneOutput("0");
            setTransactionFeesAmount("0");
          }
        } else {
          setInputAmountToSwap("");
          setOutputAmountToSwap("");
          setButtonMessage("Token pair not exist");
          setButtonStatus(true);
          setInputEquivalentOfOneOutput("0");
          setTransactionFeesAmount("0");
        }
        setSwapAction(temporaryAction);
      } else {
        setInputAmountToSwap("0");
        setOutputAmountToSwap(outputAmount);
        setButtonMessage("Enter an amount");
        setButtonStatus(true);
        setInputEquivalentOfOneOutput("0");
        setTransactionFeesAmount("0");
      }
      setShowSmallLoader(false);
    } catch (error) {
      setShowSmallLoader(false);
    }
  };

  const approveToSwapContract = async () => {
    try {
      const amountHex = await web3.utils.toHex(approvalAmount);

      const gasLimit = await instanceOfInputTokenContract.methods
        .approve(swapContractDetails.contractAddress, approvalAmount)
        .estimateGas({ from: loggedInUser });

      const encodedData = instanceOfInputTokenContract.methods
        .approve(swapContractDetails.contractAddress, amountHex)
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(gasLimit)
      );
      const balanceInWei = await web3.eth.getBalance(loggedInUser);

      const result = transactionFee.comparedTo(new BigNumber(balanceInWei));
      if (result == 0 || result == -1) {
        const tx = {
          gas: web3.utils.toHex(gasLimit),
          to: tokenIn.contractAddress,
          value: "0x00",
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {
          status: true,
          message: `${tokenIn.symbol} approved successfully`,
        };
      } else {
        return { status: false, message: "Not enough ether for approval" };
      }
    } catch (error) {
      return { status: false, message: "Approval Transaction failed" };
    }
  };

  const swapExactTokensForETHMethod = async () => {
    try {
      const path = tokenRoutesPath.path;
      const deadline = createDeadline();
      const slipageAmount = new BigNumber(outputAmountToSwap).multipliedBy(
        new BigNumber(0.995)
      );
      const amountInWei = await convertToWei(
        inputAmountToSwap.toString(),
        tokenIn.decimals
      );
      const slippageInWei = await convertToWei(
        slipageAmount.toFixed(18),
        tokenOut.decimals
      );
      const totalEthInWei = await convertToWei(
        transactionFeesAmount.toString(),
        "18"
      );

      const gasLimit = await instanceOfSwapContract.methods
        .swapExactTokensForETH(
          amountInWei,
          slippageInWei,
          path,
          loggedInUser,
          deadline
        )
        .estimateGas({
          from: loggedInUser,
          value: totalEthInWei,
        });

      const bufferedGasLimit = Math.round(
        Number(gasLimit) + Number(gasLimit) * Number(0.2)
      );

      const encodedData = instanceOfSwapContract.methods
        .swapExactTokensForETH(
          amountInWei,
          slippageInWei,
          path,
          loggedInUser,
          deadline
        )
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(bufferedGasLimit)
      );

      const balanceInWei = await web3.eth.getBalance(loggedInUser);
      const overallEth = new BigNumber(totalEthInWei).plus(transactionFee);
      let result = overallEth.comparedTo(new BigNumber(balanceInWei));

      if (result === 0 || result === -1) {
        const tx = {
          gas: web3.utils.toHex(bufferedGasLimit),
          to: swapContractDetails.contractAddress,
          value: overallEth.toFixed(),
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return { status: true, message: "Swapped successfully" };
      } else {
        return { status: false, message: "Not enough ether for swapping" };
      }
    } catch (error) {
      return { status: false, message: "Swap transaction failed" };
    }
  };

  const swapTokensForExactETHMethod = async () => {
    try {
      const path = tokenRoutesPath.path;
      const deadline = createDeadline();

      const amountInWei = await convertToWei(
        inputAmountToSwap.toString(),
        tokenIn.decimals
      );
      const outputAmountInWei = await convertToWei(
        outputAmountToSwap.toString(),
        tokenOut.decimals
      );
      const totalEthInWei = await convertToWei(
        transactionFeesAmount.toString(),
        "18"
      );

      const gasLimit = await instanceOfSwapContract.methods
        .swapTokensForExactETH(
          outputAmountInWei,
          amountInWei,
          path,
          loggedInUser,
          deadline
        )
        .estimateGas({
          from: loggedInUser,
          value: totalEthInWei,
        });

      const bufferedGasLimit = Math.round(
        Number(gasLimit) + Number(gasLimit) * Number(0.2)
      );

      const encodedData = instanceOfSwapContract.methods
        .swapTokensForExactETH(
          outputAmountInWei,
          amountInWei,
          path,
          loggedInUser,
          deadline
        )
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(bufferedGasLimit)
      );

      const balanceInWei = await web3.eth.getBalance(loggedInUser);
      const overallEth = new BigNumber(totalEthInWei).plus(transactionFee);
      let result = overallEth.comparedTo(new BigNumber(balanceInWei));

      if (result === 0 || result === -1) {
        const tx = {
          gas: web3.utils.toHex(bufferedGasLimit),
          to: swapContractDetails.contractAddress,
          value: overallEth.toFixed(),
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return { status: true, message: "Swapped successfully" };
      } else {
        return { status: false, message: "Not enough ether for swapping" };
      }
    } catch (error) {
      return { status: false, message: "Swap transaction failed" };
    }
  };

  const swapExactETHForTokensMethod = async () => {
    try {
      const path = tokenRoutesPath.path;
      const deadline = createDeadline();
      const slipageAmount = new BigNumber(outputAmountToSwap).multipliedBy(
        new BigNumber(0.995)
      );
      const totalEth = new BigNumber(inputAmountToSwap).plus(
        new BigNumber(transactionFeesAmount)
      );

      const amountInWei = await convertToWei(
        inputAmountToSwap.toString(),
        tokenIn.decimals
      );
      const slippageInWei = await convertToWei(
        slipageAmount.toFixed(18),
        tokenOut.decimals
      );
      const totalEthInWei = await convertToWei(
        totalEth.toFixed(),
        tokenIn.decimals
      );

      const gasLimit = await instanceOfSwapContract.methods
        .swapExactETHForTokens(
          amountInWei,
          slippageInWei,
          path,
          loggedInUser,
          deadline
        )
        .estimateGas({ from: loggedInUser, value: totalEthInWei });

      const bufferedGasLimit = Math.round(
        Number(gasLimit) + Number(gasLimit) * Number(0.2)
      );

      const encodedData = instanceOfSwapContract.methods
        .swapExactETHForTokens(
          amountInWei,
          slippageInWei,
          path,
          loggedInUser,
          deadline
        )
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(bufferedGasLimit)
      );

      const balanceInWei = await web3.eth.getBalance(loggedInUser);
      const overallEth = new BigNumber(totalEthInWei).plus(transactionFee);

      let result = overallEth.comparedTo(new BigNumber(balanceInWei));
      if (result === 0 || result === -1) {
        const tx = {
          gas: web3.utils.toHex(bufferedGasLimit),
          to: swapContractDetails.contractAddress,
          value: overallEth.toFixed(),
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return { status: true, message: "Swapped successfully" };
      } else {
        return { status: false, message: "Not enough ether for swapping" };
      }
    } catch (error) {
      return { status: false, message: "Swap transaction failed" };
    }
  };

  const swapETHForExactTokensMethod = async () => {
    try {
      const path = tokenRoutesPath.path;
      const deadline = createDeadline();
      const totalEth = new BigNumber(inputAmountToSwap).plus(
        new BigNumber(transactionFeesAmount)
      );

      const amountInWei = await convertToWei(
        inputAmountToSwap.toString(),
        tokenIn.decimals
      );
      const outputAmountInWei = await convertToWei(
        outputAmountToSwap.toString(),
        tokenOut.decimals
      );
      const totalEthInWei = await convertToWei(totalEth.toFixed(), "18");

      const gasLimit = await instanceOfSwapContract.methods
        .swapETHForExactTokens(
          amountInWei,
          outputAmountInWei,
          path,
          loggedInUser,
          deadline
        )
        .estimateGas({ from: loggedInUser, value: totalEthInWei });

      const bufferedGasLimit = Math.round(
        Number(gasLimit) + Number(gasLimit) * Number(0.2)
      );

      const encodedData = instanceOfSwapContract.methods
        .swapETHForExactTokens(
          amountInWei,
          outputAmountInWei,
          path,
          loggedInUser,
          deadline
        )
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(bufferedGasLimit)
      );

      const balanceInWei = await web3.eth.getBalance(loggedInUser);
      const overallEth = new BigNumber(totalEthInWei).plus(transactionFee);

      let result = overallEth.comparedTo(new BigNumber(balanceInWei));
      if (result === 0 || result === -1) {
        const tx = {
          gas: web3.utils.toHex(bufferedGasLimit),
          to: swapContractDetails.contractAddress,
          value: overallEth.toFixed(),
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return { status: true, message: "Swapped successfully" };
      } else {
        return { status: false, message: "Not enough ether for swapping" };
      }
    } catch (error) {
      return { status: false, message: "Swap transaction failed" };
    }
  };

  const swapExactTokensForTokensMethod = async () => {
    try {
      const path = tokenRoutesPath.path;
      const feePath = feeRoutesPath.path;

      const deadline = createDeadline();
      const slipageAmount = new BigNumber(outputAmountToSwap).multipliedBy(
        new BigNumber(0.995)
      );
      const amountInWei = await convertToWei(
        inputAmountToSwap.toString(),
        tokenIn.decimals
      );
      const slippageInWei = await convertToWei(
        slipageAmount.toFixed(18),
        tokenOut.decimals
      );
      const totalEthInWei = await convertToWei(
        transactionFeesAmount.toString(),
        "18"
      );

      const gasLimit = await instanceOfSwapContract.methods
        .swapExactTokensForTokens(
          amountInWei,
          slippageInWei,
          path,
          feePath,
          loggedInUser,
          deadline
        )
        .estimateGas({
          from: loggedInUser,
          value: totalEthInWei,
        });

      const bufferedGasLimit = Math.round(
        Number(gasLimit) + Number(gasLimit) * Number(0.2)
      );
      const encodedData = instanceOfSwapContract.methods
        .swapExactTokensForTokens(
          amountInWei,
          slippageInWei,
          path,
          feePath,
          loggedInUser,
          deadline
        )
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(bufferedGasLimit)
      );

      const balanceInWei = await web3.eth.getBalance(loggedInUser);
      const overallEth = new BigNumber(totalEthInWei).plus(transactionFee);

      let result = overallEth.comparedTo(new BigNumber(balanceInWei));
      if (result === 0 || result === -1) {
        const tx = {
          gas: web3.utils.toHex(bufferedGasLimit),
          to: swapContractDetails.contractAddress,
          value: overallEth.toFixed(),
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return { status: true, message: "Swapped successfully" };
      } else {
        return { status: false, message: "Not enough ether for swapping" };
      }
    } catch (error) {
      return { status: false, message: "Swap transaction failed" };
    }
  };

  const swapTokensForExactTokensMethod = async () => {
    try {
      const path = tokenRoutesPath.path;
      const feePath = feeRoutesPath.path;
      const deadline = createDeadline();

      const amountInWei = await convertToWei(
        inputAmountToSwap.toString(),
        tokenIn.decimals
      );
      const outputAmountInWei = await convertToWei(
        outputAmountToSwap.toString(),
        tokenOut.decimals
      );
      const totalEthInWei = await convertToWei(
        transactionFeesAmount.toString(),
        "18"
      );

      const gasLimit = await instanceOfSwapContract.methods
        .swapTokensForExactTokens(
          outputAmountInWei,
          amountInWei,
          path,
          feePath,
          loggedInUser,
          deadline
        )
        .estimateGas({
          from: loggedInUser,
          value: totalEthInWei,
        });

      const bufferedGasLimit = Math.round(
        Number(gasLimit) + Number(gasLimit) * Number(0.2)
      );

      const encodedData = instanceOfSwapContract.methods
        .swapTokensForExactTokens(
          outputAmountInWei,
          amountInWei,
          path,
          feePath,
          loggedInUser,
          deadline
        )
        .encodeABI();

      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = new BigNumber(gasPrice).multipliedBy(
        new BigNumber(bufferedGasLimit)
      );

      const balanceInWei = await web3.eth.getBalance(loggedInUser);
      const overallEth = new BigNumber(totalEthInWei).plus(transactionFee);

      let result = overallEth.comparedTo(new BigNumber(balanceInWei));
      if (result === 0 || result === -1) {
        const tx = {
          gas: web3.utils.toHex(bufferedGasLimit),
          to: swapContractDetails.contractAddress,
          value: overallEth.toFixed(),
          data: encodedData,
          from: loggedInUser,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          tx,
          privateKey
        );
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return { status: true, message: "Swapped successfully" };
      } else {
        return { status: false, message: "Not enough ether for swapping" };
      }
    } catch (error) {
      return { status: false, message: "Swap transaction failed" };
    }
  };

  const setSwappingCase = async () => {
    setTransactionLoader(true);
    setTransactionLoadingMessage("Transaction in process");
    try {
      if (
        (tokenIn.contractAddress === "0xeth" ||
          tokenIn.contractAddress === etherAddress) &&
        nativeToken
      ) {
        if (swapAction === actionIn) {
          const result = await swapExactETHForTokensMethod();
          setTransactionLoader(false);
          setModelsubheaderMessage(result.message);
          if (result.status) {
            setIsSuccess(true);
            setInputTokenBalance(
              await getUserBalance(
                instanceOfInputTokenContract,
                tokenIn.decimals
              )
            );
          } else {
            setIsSuccess(false);
          }
        } else {
          const result = await swapETHForExactTokensMethod();
          setTransactionLoader(false);
          setModelsubheaderMessage(result.message);
          if (result.status) {
            setIsSuccess(true);
            setInputTokenBalance(
              await getUserBalance(
                instanceOfInputTokenContract,
                tokenIn.decimals
              )
            );
          } else {
            setIsSuccess(false);
          }
        }
      } else if (
        (tokenOut.contractAddress === "0xeth" ||
          tokenOut.contractAddress === etherAddress) &&
        !nativeToken
      ) {
        let result = await checkAllowance(instanceOfInputTokenContract);
        if (swapAction === actionIn) {
          if (result) {
            const swapResult = await swapExactTokensForETHMethod();
            setModelsubheaderMessage(swapResult.message);
            setTransactionLoader(false);
            if (swapResult.status) {
              setIsSuccess(true);
              setInputTokenBalance(
                await getUserBalance(
                  instanceOfInputTokenContract,
                  tokenIn.decimals
                )
              );
            } else {
              setIsSuccess(false);
            }
          } else {
            const approveResult = await approveToSwapContract();
            setTransactionLoadingMessage(approveResult.message);
            if (approveResult.status) {
              const swapResult = await swapExactTokensForETHMethod();
              setTransactionLoader(false);
              setModelsubheaderMessage(swapResult.message);
              if (swapResult.status) {
                setIsSuccess(true);
                setInputTokenBalance(
                  await getUserBalance(
                    instanceOfInputTokenContract,
                    tokenIn.decimals
                  )
                );
              } else {
                setIsSuccess(false);
              }
            } else {
              setModelsubheaderMessage(approveResult.message);
              setTransactionLoader(false);
              setIsSuccess(false);
            }
          }
        } else {
          if (result) {
            const swapResult = await swapTokensForExactETHMethod();
            setTransactionLoader(false);
            setModelsubheaderMessage(swapResult.message);
            if (swapResult.status) {
              setIsSuccess(true);
              setInputTokenBalance(
                await getUserBalance(
                  instanceOfInputTokenContract,
                  tokenIn.decimals
                )
              );
            } else {
              setIsSuccess(false);
            }
          } else {
            const approveResult = await approveToSwapContract();
            setTransactionLoadingMessage(approveResult.message);
            if (approveResult.status) {
              const swapResult = await swapTokensForExactETHMethod();
              setModelsubheaderMessage(swapResult.message);
              setTransactionLoader(false);
              if (swapResult.status) {
                setIsSuccess(true);
                setInputTokenBalance(
                  await getUserBalance(
                    instanceOfInputTokenContract,
                    tokenIn.decimals
                  )
                );
              } else {
                setIsSuccess(false);
              }
            } else {
              setModelsubheaderMessage(approveResult.message);
              setIsSuccess(false);
            }
          }
        }
      } else {
        let result = await checkAllowance(instanceOfInputTokenContract);
        if (swapAction === actionIn) {
          if (result) {
            const swapResult = await swapExactTokensForTokensMethod();
            setModelsubheaderMessage(swapResult.message);
            setTransactionLoader(false);
            if (swapResult) {
              setIsSuccess(true);
              setInputTokenBalance(
                await getUserBalance(
                  instanceOfInputTokenContract,
                  tokenIn.decimals
                )
              );
            } else {
              setIsSuccess(false);
            }
          } else {
            const approveResult = await approveToSwapContract();
            setTransactionLoadingMessage(approveResult.message);
            if (approveResult) {
              const swapResult = await swapExactTokensForTokensMethod();
              setModelsubheaderMessage(swapResult.message);
              setTransactionLoader(false);
              if (swapResult.status) {
                setIsSuccess(true);
                setInputTokenBalance(
                  await getUserBalance(
                    instanceOfInputTokenContract,
                    tokenIn.decimals
                  )
                );
              } else {
                setIsSuccess(false);
              }
            } else {
              setModelsubheaderMessage(approveResult.message);
              setIsSuccess(false);
            }
          }
        } else {
          if (result) {
            const swapResult = await swapTokensForExactTokensMethod();
            setModelsubheaderMessage(swapResult.message);
            setTransactionLoader(false);
            if (swapResult.status) {
              setIsSuccess(true);
              setInputTokenBalance(
                await getUserBalance(
                  instanceOfInputTokenContract,
                  tokenIn.decimals
                )
              );
            } else {
              setIsSuccess(false);
            }
          } else {
            const approveResult = await approveToSwapContract();
            setTransactionLoadingMessage(approveResult.message);
            if (approveResult) {
              const swapResult = await swapTokensForExactTokensMethod();
              setModelsubheaderMessage(swapResult.message);
              setTransactionLoader(false);
              if (swapResult.status) {
                setIsSuccess(true);
                setInputTokenBalance(
                  await getUserBalance(
                    instanceOfInputTokenContract,
                    tokenIn.decimals
                  )
                );
              } else {
                setIsSuccess(false);
              }
            } else {
              setModelsubheaderMessage(approveResult.message);
              setIsSuccess(false);
            }
          }
        }
      }
      setTransactionLoader(false);
    } catch (error) {
      setTransactionLoader(false);
    }
  };

  /**Render to switch between swap and continue */
  const feesAndRateRender = () => {
    if (isSwap) {
      return (
        <View>
          <View style={styles.rateHolder}>
            <Text style={styles.rateTextStyle}>
              1 {tokenOut?.symbol} = {inputEquivalentOfOneOutput}{" "}
              {tokenIn?.symbol}
            </Text>
          </View>
          <Button
            lable={buttonMessage}
            labelStyle={styles.labelStyle}
            buttonWidth={210}
            buttonHeight={52}
            onPress={async () => {
              setIsSwap(false);
            }}
            buttonStyle={{ marginVertical: 30, alignSelf: "center" }}
            disabled={buttonStatus}
            showActivityIndicator={showSmallLoader}
          />
        </View>
      );
    } else if (tokenRoutesPath.trade_status === 1) {
      <View>
        <View style={styles.rateHolder}>
          <Text style={styles.rateTextStyle}>
            1 {tokenOut.symbol} = {inputEquivalentOfOneOutput} {tokenIn.symbol}
          </Text>
        </View>
        <Button
          lable="Pair does not exist"
          labelStyle={styles.labelStyle}
          buttonWidth={210}
          buttonHeight={52}
          buttonStyle={{ marginVertical: 30, alignSelf: "center" }}
          disabled={true}
          showActivityIndicator={showSmallLoader}
        />
      </View>;
    } else if (tokenRoutesPath.trade_status === 0) {
      return (
        <View>
          <View style={styles.feesHolder}>
            <View style={styles.fieldTextHolder}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: 130,
                }}
              >
                <Text style={styles.rateTextStyle}>Transaction Fees </Text>
                <Text style={styles.rateTextStyle}>:</Text>
              </View>
              <Text style={styles.rateTextStyle}>{transactionFees}%</Text>
            </View>
            <View style={styles.fieldTextHolder}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: 130,
                }}
              >
                <Text style={styles.rateTextStyle}>Rate</Text>
                <Text style={styles.rateTextStyle}>:</Text>
              </View>
              <Text style={styles.rateTextStyle}>{transactionFeesAmount}</Text>
            </View>
          </View>
          <Button
            lable="Confirm"
            labelStyle={styles.labelStyle}
            buttonWidth={210}
            buttonHeight={52}
            onPress={async () => {
              setSwappingCase();
            }}
            buttonStyle={{ marginVertical: 30, alignSelf: "center" }}
            showActivityIndicator={showSmallLoader}
          />
        </View>
      );
    }
  };

  /**Handel model */
  const showModelMethod = () => {
    if (isSuccess == true) {
      return (
        <Model
          source={require("../../Assets/Png/check.png")}
          header="Swap Transaction Status"
          subHeader={modelsubheaderMessage}
          HeaderStyle={{ color: "#25BD4F", fontSize: 16 }}
          onClose={() => {
            setIsSuccess(null);
            navigation.goBack();
          }}
        />
      );
    } else if (isSuccess == false) {
      return (
        <Model
          source={require("../../Assets/Png/error.png")}
          header="Swap Transaction Status"
          subHeader="Swap Transaction Failed"
          HeaderStyle={{ color: "rgba(255, 15, 44, 0.75)", fontSize: 16 }}
          onClose={() => setIsSuccess(null)}
        />
      );
    }
    return null;
  };

  return (
    <GradientBackGround>
      <StatusBar hidden={false} barStyle="light-content" />
      <SafeAreaView>
        <View style={styles.subHolder}>
          <ScrollView>
            <View style={styles.fieldHolder}>
              <View
                style={{
                  height: 295,
                  justifyContent: "space-between",
                  marginTop: 15,
                }}
              >
                <View style={styles.subFieldHolder}>
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <DropDown
                        value={tokenIn}
                        onTouchField={() => {
                          navigation.navigate("TokenSearchScreen", {
                            tokenInValueFromRoute: null,
                            tokenOutValueFromRoute: tokenOut,
                            selectedFromRoute: actionIn,
                          });
                        }}
                      />
                      <Text style={styles.balanceText}>
                        Balance:
                        {parseFloat(inputTokenBalance).toFixed(6)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        paddingVertical: 6,
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.percentageHolder,
                          {
                            backgroundColor:
                              inputPercentage == 25
                                ? "#04223C"
                                : "rgba(4, 34, 60, 0.2)",
                          },
                        ]}
                        onPress={() => {
                          onChangeOfInputFieldOfInputToken("0", 25);
                        }}
                      >
                        <Text style={styles.percentageText}>25%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.percentageHolder,
                          {
                            backgroundColor:
                              inputPercentage == 50
                                ? "#04223C"
                                : "rgba(4, 34, 60, 0.2)",
                          },
                        ]}
                        onPress={() => {
                          onChangeOfInputFieldOfInputToken("0", 50);
                        }}
                      >
                        <Text style={styles.percentageText}>50%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.percentageHolder,
                          {
                            backgroundColor:
                              inputPercentage == 75
                                ? "#04223C"
                                : "rgba(4, 34, 60, 0.2)",
                          },
                        ]}
                        onPress={() => {
                          onChangeOfInputFieldOfInputToken("0", 75);
                        }}
                      >
                        <Text style={styles.percentageText}>75%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.percentageHolder,
                          {
                            backgroundColor:
                              inputPercentage == 100
                                ? "#04223C"
                                : "rgba(4, 34, 60, 0.2)",
                          },
                        ]}
                        onPress={() => {
                          onChangeOfInputFieldOfInputToken("0", 100);
                        }}
                      >
                        <Text style={styles.percentageText}>100%</Text>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Input
                          value={inputAmountToSwap}
                          style={styles.textFieldStyle}
                          textStyle={styles.textInputStyle}
                          placeholder="Enter Value"
                          onChangeText={(text) => {
                            if (text.match(TokenValueRegix)) {
                              setInputAmountToSwap(text);
                              onChangeOfInputFieldOfInputToken(text, 0);
                            }
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View>
                        <TouchableOpacity
                          style={styles.maxButton}
                          onPress={() => {
                            onChangeOfInputFieldOfInputToken("0", 100);
                          }}
                        >
                          <Text style={styles.percentageText}>Max</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    onSelectOfInputToken(null, 1);
                  }}
                  style={{
                    height: 30,
                    width: 30,
                    backgroundColor: "rgba(9, 32, 56, 1)",
                    borderRadius: 30,
                    position: "absolute",
                    top: 133,
                    left: 160,
                    zIndex: 3,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <AntDesign
                      name="arrowdown"
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        position: "absolute",
                        top: 8,
                        left: 3,
                      }}
                    />
                    <AntDesign
                      name="arrowup"
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        position: "absolute",
                        top: 6,
                        left: 12,
                      }}
                    />
                  </View>
                </TouchableOpacity>
                <View style={[styles.subFieldHolder]}>
                  <View
                    style={{ height: "100%", justifyContent: "space-between" }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <DropDown
                        value={tokenOut}
                        onTouchField={() => {
                          navigation.navigate("TokenSearchScreen", {
                            tokenInValueFromRoute: tokenIn,
                            tokenOutValueFromRoute: null,
                            selectedFromRoute: actionOut,
                          });
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <Input
                          value={outputAmountToSwap}
                          style={styles.textFieldStyle}
                          textStyle={styles.textInputStyle}
                          placeholder="Enter Value"
                          onChangeText={(text) => {
                            if (text.match(TokenValueRegix)) {
                              setOutputAmountToSwap(text);
                              onChangeOfInputFieldOfOutputToken(text);
                            }
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {feesAndRateRender()}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      {showModelMethod()}
      {transactionLoader && (
        <Loader header="Please Wait" subHeader={transactionLoadingMessage} />
      )}
      {loading && (
        <Loader header="Please Wait" subHeader="Wait while we fetch tokens" />
      )}
    </GradientBackGround>
  );
};

export default Swap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  subHolder: {
    width: Dimensions.get("screen").width - 28,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginTop: Platform.OS == "ios" ? 0 : 70,
  },
  fieldHolder: {
    borderColor: colors.fieldHolderBorder,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    height: Dimensions.get("screen").width * 1.3,
    width: Dimensions.get("screen").width - 28,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 16,
    backgroundColor: colors.fieldHolderBg,
    marginBottom: 25,
  },
  labelStyle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  subFieldHolder: {
    backgroundColor: "#426EA1",
    borderRadius: 8,
    width: 340,
    padding: 16,
    height: 140,
  },
  percentageHolder: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
    backgroundColor: "rgba(4, 34, 60, 0.2)",
    borderColor: "rgba(217, 217, 217, 0.15)",
    marginLeft: 6,
    borderWidth: 1,
  },
  percentageText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 11,
  },
  textFieldStyle: {
    width: 255,
    color: "#fff",
    backgroundColor: "#04223C33",
    paddingLeft: 5,
  },
  textInputStyle: {
    padding: Platform.OS == "ios" ? 7 : 4,
    fontWeight: "500",
  },
  maxButton: {
    borderColor: "rgba(218, 218, 218, 0.1)",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "rgba(48, 42, 42, 0.25)",
  },
  balanceText: {
    color: "#fff",
    fontWeight: "500",
  },
  dropDownStyle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 9,
    borderRadius: 8,
    shadowColor: "rgba(48, 42, 42, 0.25)",
    justifyContent: "space-around",
  },
  rateHolder: {
    borderRadius: 8,
    borderColor: "rgba(217, 217, 217, 0.15)",
    borderWidth: 1,
    width: 340,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 10,
  },
  rateTextStyle: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  feesHolder: {
    backgroundColor: "rgba(4, 23, 48, 0.85)",
    borderRadius: 8,
    width: 340,
    height: 60,
    marginTop: 10,
    zIndex: -1,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldTextHolder: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 295,
  },
});
