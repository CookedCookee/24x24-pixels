// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IFiveHundredAndSeventySixPixels {
    function draw(string[576] memory _pixels, bool _encode) external pure returns (string memory);
}