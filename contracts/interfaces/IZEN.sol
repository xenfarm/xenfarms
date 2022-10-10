pragma solidity ^0.6.0;

interface IZEN {
    function mint(address _to, uint256 _amount) external;

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}
