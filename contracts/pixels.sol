// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract pixels {
    using SafeMath for uint256;

    //variables

    //events

    constructor() {
    }

    function drawImage() external pure returns (string memory) {
        return "";
    }
}