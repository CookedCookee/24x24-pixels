// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FiveHundredAndSeventySixPixels is ReentrancyGuard {
    using SafeMath for uint256;

    struct template {
        string name;
        address author;
        uint256[] positions;
        string[] colours;
    }

    bytes32[] public templateList;
    mapping(bytes32 => template) public templates;
    mapping(bytes32 => bool) public templateExists;

    event templateCreated(bytes32 indexed keyHash, address indexed author);
    event templateDeleted(bytes32 indexed keyHash, address indexed author);

    constructor() {
    }

    function createTemplate(string memory _name, uint256[] memory _positions, string[] memory _colours) external nonReentrant {
        bytes32 keyHash = keccak256(abi.encodePacked(_name, msg.sender));

        require(!templateExists[keyHash], "Template already exists");
        require(_positions.length > 0, "Insuffient pixels");
        require(_positions.length < 576, "Too many pixels");
        require(_positions.length == _colours.length, "Positions and Colours array must be the same length");

        //Maybe delete for gas purposes
        for (uint256 i=0; i<_positions.length; i++) {
            require(_positions[i] < 576, string.concat('Invalid pixel location in index #', Strings.toString(i)));
        }

        template memory newTemplate;
        newTemplate.name = _name;
        newTemplate.author = msg.sender;
        newTemplate.positions = _positions;
        newTemplate.colours = _colours;

        templateList.push(keyHash);
        templates[keyHash] = newTemplate;
        templateExists[keyHash] = true;

        emit templateCreated(keyHash, msg.sender);
    }

    function deleteTemplate(uint256 _index, bytes32 _template) external nonReentrant {
        require(templateExists[_template], "Template doesn't exist");
        require(templateList[_index] == _template, "Index does not correspond to template");
        require(templates[_template].author == msg.sender, "Only the author can delete this template");

        template memory emptyTemplate;

        templateList[_index] = templateList[templateList.length - 1];
        templateList.pop();
        templates[_template] = emptyTemplate;
        templateExists[_template] = false;

        emit templateDeleted(_template, msg.sender);
    }
    
    function getMonochromePixelsArray(string memory _colour) public pure returns (string[576] memory) {
        string[576] memory monochrome;

        for (uint256 i=0; i<576; i++) {
            monochrome[i] = _colour;
        }

        return monochrome;
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

    function draw(string[576] memory _pixels, bool _encode) external pure returns (string memory) {
        string memory svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 24 24">';
        svgHTML = string.concat(svgHTML, generateSVG(_pixels));
        svgHTML = string.concat(svgHTML, '</svg>');

        if (_encode) {
            svgHTML = string.concat('data:image/svg+xml;base64,', Base64.encode(bytes(svgHTML)));   
        }

        return svgHTML;
    }
}