// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IPixelsOnChain} from "./../IPixelsOnChain.sol";

/// @title  Pixels On Chain: Open Edition
/// @author Cooki.eth
/// @notice This contract utilisies and extends the utility enabled by the Pixels On Chain registry by 
///         turning the images into NFTs. Users can mint an NFT by passing an array of pixels and a memo
///         to the mint function. The NFT will then be created on-chain using the Pixels On Chain registry
///         in the Opensea format. Minting will remain open forever; therere is no upper bound on the number
///         of NFTs available to mint. Mint cost is 0.1 Metis and 1% of royalties are returned to the owner.
///         No further utility will be provided after minting.
contract PixelsOnChainOpenEdition is Ownable, ERC721, ReentrancyGuard {
    using SafeMath for uint256;

    /////////////
    //Variables//
    /////////////

    /// @notice The Pixels On Chain registry.
    IPixelsOnChain public pixelsOnChain;

    /// @notice The number of NFTs that have been minted.
    uint256 public nonce;

    /// @notice The mint fee.
    uint256 public fee;

    /// @notice A mapping from token IDs to minting addresses.
    mapping(uint256 => address) public minter;

    /// @notice A mapping from token IDs to pixels array.
    mapping(uint256 => string[576]) public pixels;

    /// @notice A mapping from token IDs to memo of the NFT.
    mapping(uint256 => string) public memo;

    //////////
    //Events//
    //////////

    /// @notice The token ID of an NFT when it is minted.
    event Minted(uint256 indexed tokenId);

    /// @notice The amount of Metis withdrawn by the owner when the withdraw function is called.
    event WithdrawMetis(uint256 indexed amount);

    /// @notice The new fee updated by the owner when the updateFee function is called.
    event UpdatedFee(uint256 indexed fee);

    ///////////////
    //Constructor//
    ///////////////

    constructor(address _owner, IPixelsOnChain _pixelsOnChain) ERC721("Pixels On Chain", "POC") {
        transferOwnership(_owner);
        pixelsOnChain = _pixelsOnChain;
        fee = 0.1e18 wei;
    }

    //////////////////
    //Core Functions//
    //////////////////

    /// @notice This function allows anyone to mint an NFT.
    /// @param _pixels The pixels array of colours.
    /// @param _memo A memo message forever associated with the NFT.
    function mint(string[576] memory _pixels, string memory _memo) external payable nonReentrant {
        require(msg.value >= fee, "Insufficient fee paid");
        require(bytes(_memo).length < 100, "Memo is too long");

        _safeMint(msg.sender, nonce);
        minter[nonce] = msg.sender;
        pixels[nonce] = _pixels;
        memo[nonce] = _memo;
        emit Minted(nonce);

        nonce++;
    }

    /// @notice This function returns the Token URI metadata of any minted NFT.
    /// @param _tokenId The token ID of the NFT.
    /// @return string The metadata, in the Opensea format, of the NFT.
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        _requireMinted(_tokenId);

        string memory svgHTML = pixelsOnChain.draw(pixels[_tokenId], true);
        svgHTML = string.concat('{"name": "#', Strings.toString(_tokenId), '", "description": "Pixels On Chain: Open Edition", "image": "', svgHTML, '", "attributes": [{ "trait_type": "Minter", "value": "', Strings.toHexString(minter[_tokenId]),'"}, { "trait_type": "Memo", "value": "', memo[_tokenId],'"}], "royalties": [{ "recipient": "', Strings.toHexString(address(this)),'", "percentage": 1 }]}');
        svgHTML = string.concat('data:application/json;base64,', Base64.encode(bytes(svgHTML)));
        return svgHTML;
    }

    /// @notice This function allows the owner to withdraw any Metis this contract has earned.
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = (owner()).call{value: balance * 1 wei}("");
        require(success, "Transfer to owner failed");

        emit WithdrawMetis(balance);
    }

    /// @notice This function returns the Token URI metadata of any minted NFT.
    /// @param _fee The token ID of the NFT.
    function changeFee(uint256 _fee) external onlyOwner {
        require(_fee < 1e18 wei, "Fee may not exceed 1 Metis");
        fee = _fee;
        emit UpdatedFee(_fee);
    }

    /// @notice This function allows the contract to recieve Metis.
    receive() external payable {}

    ////////////////////
    //Helper Functions//
    ////////////////////

    /// @notice This function returns the pixels array for any given NFT that has been minted.
    /// @param _tokenId The token ID of the NFT.
    /// @return string[576] The pixels array.
    function getEntirePixelsArray(uint256 _tokenId) public view returns (string[576] memory) {
        require(_tokenId < nonce, "Token has not been minted");
        return pixels[_tokenId];
    }
}