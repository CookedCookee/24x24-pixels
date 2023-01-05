// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title  Pixels On Chain
/// @author Cooki.eth
/// @notice This contract is a generalized on-chain 24x24 (576) pixel SVG generator and repository. It allows
///         users to create pixel art images, such as Cryptopunks, using a 576-element array of strings (colors)
///         representing each pixel in the image. The pixels are arranged in rows, starting at the top left of 
///         the image and progressing horizontally for 24 pixels before starting a new row. It is recommended 
///         that the colors used in the array conform to the hexadecimal standard (e.g. #dc143c), although SVG
///         keywords such as "crimson" will also work. Users have the option of encoding the created images using
///         base 64. In addition, this contract facilitates the creation and storage of templates, which are
///         discrete pixel patterns that can be re-used and overlaid over pre-existing images. For example, a
///         Cryptopunk silhouette or pipe can be saved as a template and reused by anyone in the future. Templates
///         are defined using a subset of the 576 pixels, enabling a wide range of composability.
contract PixelsOnChain is ReentrancyGuard {
    using SafeMath for uint256;

    /////////////
    //Variables//
    /////////////

    /// @notice A struct used to store all of the relevant information about a template created by a user. The
    ///         information recorded is the name of the template, the author, an array of pixel positions, and
    ///         an array of pixel colours. It is required at the time of creation that the positions and colours
    ///         array are of equal length.
    struct template {
        string name;
        address author;
        uint256[] positions;
        string[] colours;
    }
    
    /// @notice An array of keys to access all templates that have been created.
    bytes32[] public templateList;

    /// @notice A mapping from keys to templates.
    mapping(bytes32 => template) public templates;

    /// @notice A mapping from keys to booleans used to determine whether any given template exists or not.
    mapping(bytes32 => bool) public templateExists;

    //////////
    //Events//
    //////////

    /// @notice The key and author of a template when it is created.
    event templateCreated(bytes32 indexed keyHash, address indexed author);

    /// @notice The key and author of a template when it is deleted.
    event templateDeleted(bytes32 indexed keyHash, address indexed author);

    //////////////////
    //Core Functions//
    //////////////////

    /// @notice This function allows for anyone to create a template of pixels.
    /// @param _name The name of the template.
    /// @param _positions An array of positions for each pixel.
    /// @param _colours An array of colours that corresponds to _positions array.
    function createTemplate(string memory _name, uint256[] memory _positions, string[] memory _colours) external nonReentrant {
        bytes32 keyHash = keccak256(abi.encodePacked(_name, msg.sender));

        require(!templateExists[keyHash], "Template already exists");
        require(_positions.length > 0, "Insuffient pixels");
        require(_positions.length < 576, "Too many pixels");
        require(_positions.length == _colours.length, "Positions and Colours array must be the same length");

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

    /// @notice This function allows for an author to delete their template.
    /// @param _index The index of the template in the templateList array.
    /// @param _template The key of the template.
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

    /// @notice This function overlays templates on top of each other and a base layer to create an image. Templates
    ///         are overlaid corresponding to the order in which they appear in the _templates array.
    /// @param _base The base, or background, image that the templates will be overlaid on.
    /// @param _templates An array of templates that will be overlaid in the order that they appear in this array.
    /// @return string[] An array of pixels that can be passed to the generateSVG function to create an image.
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

    /// @notice This function accepts an array of pixel colours and returns an SVG object.
    /// @param _pixels An array of pixels.
    /// @return string An SVG object of the pixels when arranged.
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

    /// @notice This function accepts an array of pixel colours and returns an SVG image.
    /// @param _pixels An array of pixels.
    /// @param _encode A boolean determining whether or not the iamge is base 64 encoded or not.
    /// @return string An SVG image of the pixels when arranged.
    function draw(string[576] memory _pixels, bool _encode) external pure returns (string memory) {
        string memory svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 24 24">';
        svgHTML = string.concat(svgHTML, generateSVG(_pixels), '</svg>');

        if (_encode) {
            svgHTML = string.concat('data:image/svg+xml;base64,', Base64.encode(bytes(svgHTML)));   
        }

        return svgHTML;
    }

    ////////////////////
    //Helper Functions//
    ////////////////////

    /// @notice This function returns an array of pixels that all share the same colour. This may be useful
    ///         for creating background colours before overlaying templates.
    /// @param _colour The colour that all pixels will have.
    /// @return string[576] An array of 576 pixels all in the same colour.
    function getMonochromePixelsArray(string memory _colour) public pure returns (string[576] memory) {
        string[576] memory monochrome;

        for (uint256 i=0; i<576; i++) {
            monochrome[i] = _colour;
        }

        return monochrome;
    }

    /// @notice This function allows for an easy way of seeing the number of templates stored in this registry.
    /// @return uint256 The length of the templateList array.
    function getTemplateListLength() external view returns (uint256) {
        return templateList.length;
    }

    /// @notice This function allows for an easy way of seeing the colours array of any given template.
    /// @param _template The key hash of the template.
    /// @return string[] The colours array of the template.
    function getTemplateColoursArray(bytes32 _template) external view returns (string[] memory) {
        require(templateExists[_template], "Template doesn't exist");
        return templates[_template].colours;
    }

    /// @notice This function allows for an easy way of seeing the positions array of any given template.
    /// @param _template The key hash of the template.
    /// @return uint256[] The positions array of the template.
    function getTemplatePositionsArray(bytes32 _template) external view returns (uint256[] memory) {
        require(templateExists[_template], "Template doesn't exist");
        return templates[_template].positions;
    }
}