// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract fiveHundredAndSeventySixPixels {
    using SafeMath for uint256;

    //variables and mappings

    //events

    constructor() {  
    }

    function draw(string[576] memory _tiles, bool _encode) external pure returns (string memory) {
        string memory svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 24 24">';
        svgHTML = string.concat(svgHTML, generateSVG(_tiles));
        svgHTML = string.concat(svgHTML, '</svg>');

        if (_encode) {
            svgHTML = string.concat('data:image/svg+xml;base64,', Base64.encode(bytes(svgHTML)));   
        }

        return svgHTML;
    }

    function generateSVG(string[576] memory _tiles) public pure returns (string memory) {
        string memory svgHTML = '<svg x="0" y="0">';
        string memory y;
        string memory temp;

        for (uint256 i=0; i<24; i++) {
            y = Strings.toString(i);

            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="0" y="', y ,'" fill="' , _tiles[(i*24)+0] , '" /><rect width="1.01" height="1.01" x="1" y="', y ,'" fill="' , _tiles[(i*24)+1] , '" /><rect width="1.01" height="1.01" x="2" y="', y ,'" fill="' , _tiles[(i*24)+2] , '" /><rect width="1.01" height="1.01" x="3" y="', y ,'" fill="' , _tiles[(i*24)+3] , '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="4" y="', y ,'" fill="' , _tiles[(i*24)+4] , '" /><rect width="1.01" height="1.01" x="5" y="', y ,'" fill="' , _tiles[(i*24)+5] , '" /><rect width="1.01" height="1.01" x="6" y="', y ,'" fill="' , _tiles[(i*24)+6] , '" /><rect width="1.01" height="1.01" x="7" y="', y ,'" fill="' , _tiles[(i*24)+7] , '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="8" y="', y ,'" fill="' , _tiles[(i*24)+8] , '" /><rect width="1.01" height="1.01" x="9" y="', y ,'" fill="' , _tiles[(i*24)+9] , '" /><rect width="1.01" height="1.01" x="10" y="', y ,'" fill="' , _tiles[(i*24)+10] , '" /><rect width="1.01" height="1.01" x="11" y="', y ,'" fill="' , _tiles[(i*24)+11] , '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="12" y="', y ,'" fill="' , _tiles[(i*24)+12] , '" /><rect width="1.01" height="1.01" x="13" y="', y ,'" fill="' , _tiles[(i*24)+13] , '" /><rect width="1.01" height="1.01" x="14" y="', y ,'" fill="' , _tiles[(i*24)+14] , '" /><rect width="1.01" height="1.01" x="15" y="', y ,'" fill="' , _tiles[(i*24)+15] , '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="16" y="', y ,'" fill="' , _tiles[(i*24)+16] , '" /><rect width="1.01" height="1.01" x="17" y="', y ,'" fill="' , _tiles[(i*24)+17] , '" /><rect width="1.01" height="1.01" x="18" y="', y ,'" fill="' , _tiles[(i*24)+18] , '" /><rect width="1.01" height="1.01" x="19" y="', y ,'" fill="' , _tiles[(i*24)+19] , '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="20" y="', y ,'" fill="' , _tiles[(i*24)+20] , '" /><rect width="1.01" height="1.01" x="21" y="', y ,'" fill="' , _tiles[(i*24)+21] , '" /><rect width="1.01" height="1.01" x="22" y="', y ,'" fill="' , _tiles[(i*24)+22] , '" /><rect width="1.01" height="1.01" x="23" y="', y ,'" fill="' , _tiles[(i*24)+23] , '" />');

            svgHTML = string.concat(svgHTML, temp);
            temp = "";
        }
        
        svgHTML = string.concat(svgHTML, '</svg>');
        return svgHTML;
    }
}