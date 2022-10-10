// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZENToken is ERC20Burnable, Ownable {
    constructor() public ERC20("ZEN Token", "ZEN") {
        _mint(msg.sender, 100000 * 1 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
