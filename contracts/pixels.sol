// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract fiveHundredAndSeventySixPixels {
    using SafeMath for uint256;

    struct coordinates {
        uint256 x;
        uint256 y;
    }

    struct template {
        string name;
        address author;
        uint256[] positions;
        string[] colours;
    }

    mapping(address => bytes32[]) public userTemplates;

    //Not sure if this is necessary
    //mapping(address => uint256) public numberOfUsersTemplates;

    mapping(bytes32 => template) public templates;

    mapping(bytes32 => bool) public templateExists;

    //events

    constructor() {
    }

    function createTemplate(string memory _name, uint256[] memory _positions, string[] memory _colours) external {
        bytes32 keyHash = keccak256(abi.encodePacked(_name, msg.sender));

        require(templateExists[keyHash] == false, "Template already exists");
        require(_positions.length < 576 && _colours.length < 576, "Too many pixels");
        require(_positions.length == _colours.length, "Positions and Colours array must be the same length");

        for (uint256 i=0; i<_positions.length; i++) {
            require(_positions[i] < 576, string.concat('Invalid pixel location in index #', Strings.toString(i)));
        }

        template memory newTemplate;
        newTemplate.name = _name;
        newTemplate.author = msg.sender;
        newTemplate.positions = _positions;
        newTemplate.colours = _colours;

        userTemplates[msg.sender].push(keyHash);
        templates[keyHash] = newTemplate;
        templateExists[keyHash] = true;

        //emit event
    }

    function deleteTemplate(bytes32 _template) external {
    }

    function overlayer(string[576] memory _base, bytes32[] memory _templates) public view returns (string[576] memory) {
        string[576] memory result = _base;
        template memory temp;

        for (uint256 a=0; a<_templates.length; a++) {
            require(templateExists[_templates[a]], string.concat('Template #', Strings.toString(a), ' does not exist'));

            temp = templates[_templates[a]];

            for (uint256 b=0; b<temp.positions.length; b++) {

                result[temp.positions[b]] = temp.colours[b];
            }
        }

        return result;
    }
    
    function getMonochromePixelsArray(string memory _colour) public pure returns (string[576] memory) {
        string[576] memory monochrome;

        for (uint256 i=0; i<576; i++) {
            monochrome[i] = _colour;
        }

        return monochrome;
    }

    //main draw functions

    function draw(string[576] memory _pixels, bool _encode) external pure returns (string memory) {
        string memory svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 24 24">';
        svgHTML = string.concat(svgHTML, generateSVG(_pixels));
        svgHTML = string.concat(svgHTML, '</svg>');

        if (_encode) {
            svgHTML = string.concat('data:image/svg+xml;base64,', Base64.encode(bytes(svgHTML)));   
        }

        return svgHTML;
    }

    function generateSVG(string[576] memory _pixels) public pure returns (string memory) {
        string memory svgHTML = '<svg x="0" y="0">';
        string memory y;
        uint256 r;
        string memory temp;

        for (uint256 i=0; i<24; i++) {
            y = Strings.toString(i);
            r = i*24;

            temp = string.concat('<rect width="1.01" height="1.01" x="0" y="', y,'" fill="', _pixels[r+0], '" /><rect width="1.01" height="1.01" x="1" y="', y,'" fill="' , _pixels[r+1], '" /><rect width="1.01" height="1.01" x="2" y="', y,'" fill="' , _pixels[r+2], '" /><rect width="1.01" height="1.01" x="3" y="', y,'" fill="', _pixels[r+3], '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="4" y="', y,'" fill="', _pixels[r+4], '" /><rect width="1.01" height="1.01" x="5" y="', y,'" fill="' , _pixels[r+5], '" /><rect width="1.01" height="1.01" x="6" y="', y,'" fill="' , _pixels[r+6], '" /><rect width="1.01" height="1.01" x="7" y="', y,'" fill="', _pixels[r+7], '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="8" y="', y,'" fill="', _pixels[r+8], '" /><rect width="1.01" height="1.01" x="9" y="', y,'" fill="' , _pixels[r+9], '" /><rect width="1.01" height="1.01" x="10" y="', y,'" fill="' , _pixels[r+10], '" /><rect width="1.01" height="1.01" x="11" y="', y,'" fill="', _pixels[r+11], '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="12" y="', y,'" fill="', _pixels[r+12], '" /><rect width="1.01" height="1.01" x="13" y="', y,'" fill="' , _pixels[r+13], '" /><rect width="1.01" height="1.01" x="14" y="', y,'" fill="' , _pixels[r+14], '" /><rect width="1.01" height="1.01" x="15" y="', y,'" fill="', _pixels[r+15], '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="16" y="', y,'" fill="', _pixels[r+16], '" /><rect width="1.01" height="1.01" x="17" y="', y,'" fill="' , _pixels[r+17], '" /><rect width="1.01" height="1.01" x="18" y="', y,'" fill="' , _pixels[r+18], '" /><rect width="1.01" height="1.01" x="19" y="', y,'" fill="', _pixels[r+19], '" />');
            temp = string.concat(temp, '<rect width="1.01" height="1.01" x="20" y="', y,'" fill="', _pixels[r+20], '" /><rect width="1.01" height="1.01" x="21" y="', y,'" fill="' , _pixels[r+21], '" /><rect width="1.01" height="1.01" x="22" y="', y,'" fill="' , _pixels[r+22], '" /><rect width="1.01" height="1.01" x="23" y="', y,'" fill="', _pixels[r+23], '" />');

            svgHTML = string.concat(svgHTML, temp);
        }
        
        svgHTML = string.concat(svgHTML, '</svg>');
        return svgHTML;
    }

    //Helper functions for navigating the pixels array

    function positionToCoordinates(uint256 _position) public pure returns (coordinates memory) {
        require(_position < 576, "Invalid position");

        coordinates memory coords;

        coords.x = _position%24;
        coords.y = _position/24;

        return coords;
    }

    function coordinatesToPosition(coordinates memory _coords) public pure returns (uint256) {
        require(_coords.x < 24 && _coords.y < 24, "Invalid coordinates");

        uint256 position;

        position = (24 * _coords.y) + _coords.x;

        return position;
    }
}