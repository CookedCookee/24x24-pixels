// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IFiveHundredAndSeventySixPixels} from "../contracts/IFiveHundredAndSeventySixPixels.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PixelsOpenEdition is Ownable, ERC721, ReentrancyGuard {
    using SafeMath for uint256;

    IFiveHundredAndSeventySixPixels public fiveHundredAndSeventySixPixels;

    uint256 public nonce;

    uint256 public fee;

    mapping(uint256 => address) public minter;

    mapping(uint256 => string[576]) public pixels;

    mapping(uint256 => string) public memo;

    event Minted(uint256 indexed tokenId);

    event WithdrawETH(uint256 indexed amount);

    constructor(IFiveHundredAndSeventySixPixels _fiveHundredAndSeventySixPixels) ERC721("Pixels Open Edition", "POE") {
        transferOwnership(0xc37AEDFd7cC5d2f8Cf04885077555ff4524CF726);
        fiveHundredAndSeventySixPixels = _fiveHundredAndSeventySixPixels;
        fee = 0.001e18 wei;
    }

    function mint(string[576] memory _pixels, string memory _memo) external payable nonReentrant {
        require(msg.value >= fee, "Insufficient fee paid");

        _mint(msg.sender, nonce);
        minter[nonce] = msg.sender;
        pixels[nonce] = _pixels;
        memo[nonce] = _memo;
        emit Minted(nonce);

        nonce++;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        _requireMinted(_tokenId);

        string memory svgHTML = fiveHundredAndSeventySixPixels.draw(pixels[_tokenId], true);
        svgHTML = string.concat('{"name": "#', Strings.toString(_tokenId), '", "description": "", "image": "', svgHTML, '", "attributes": [{ "trait_type": "Minter", "value": "', Strings.toHexString(minter[_tokenId]),'"}, { "trait_type": "Memo", "value": "', memo[_tokenId],'"}], "royalties": [{ "recipient": "', Strings.toHexString(address(this)),'", "percentage": 1 }]}');
        svgHTML = string.concat('data:application/json;base64,', Base64.encode(bytes(svgHTML)));
        return svgHTML;
    }

    receive() external payable {}

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = (owner()).call{value: balance * 1 wei}("");
        require(success, "transfer to owner failed");

        emit WithdrawETH(balance);
    }
}