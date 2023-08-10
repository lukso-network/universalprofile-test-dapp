// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract CustomERC20AndERC165 is ERC20, ERC20Burnable, Ownable, ERC165 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Implement the ERC165 supportsInterface function
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(ERC165).interfaceId || super.supportsInterface(interfaceId);
    }
}
