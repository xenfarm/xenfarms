// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.0;

import "./interfaces/IUniswapRouterETH.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "./interfaces/IZEN.sol";

contract Burner {
    using SafeMath for uint256;

    address public zen;
    address public xen;
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    address unirouter;
    address[] public zenToWethRoute;
    address[] public wethToXenRoute;
    address[] public xenToZenRoute;

    constructor(
        address _unirouter,
        address _zen,
        address _xen
    ) public {
        zen = _zen;
        xen = _xen;
        unirouter = _unirouter;

        _giveAllowances();

        zenToWethRoute = new address[](2);
        zenToWethRoute[0] = zen;
        zenToWethRoute[1] = WETH;

        wethToXenRoute = new address[](2);
        wethToXenRoute[0] = WETH;
        wethToXenRoute[1] = xen;

        xenToZenRoute = new address[](2);
        xenToZenRoute[0] = xen;
        xenToZenRoute[1] = zen;
    }

    function burn() public {
        // Sell all ZEN for WETH
        uint256 zenBalance = IERC20(zen).balanceOf(address(this));
        IUniswapRouterETH(unirouter).swapExactTokensForTokens(
            zenBalance,
            0,
            zenToWethRoute,
            address(this),
            now
        );

        // 10% is rewarded to the function caller
        // 90% is used to buy xen buy zen and burn both
        //  50% of xen is burned
        //  50% of xen is used to purchase zen.

        uint256 wethBalance = IERC20(WETH).balanceOf(address(this));
        uint256 callerReward = wethBalance.div(10);

        IERC20(WETH).transferFrom(address(this), msg.sender, callerReward);

        uint256 buyBalance = wethBalance.sub(callerReward);

        IUniswapRouterETH(unirouter).swapExactTokensForTokens(
            buyBalance,
            0,
            wethToXenRoute,
            address(this),
            now
        );

        uint256 xenBalance = IERC20(xen).balanceOf(address(this));

        IUniswapRouterETH(unirouter).swapExactTokensForTokens(
            xenBalance.div(2),
            0,
            xenToZenRoute,
            address(this),
            now
        );

        ERC20Burnable(zen).burn(IERC20(zen).balanceOf(address(this)));
        ERC20Burnable(xen).burn(IERC20(xen).balanceOf(address(this)));
    }

    function _giveAllowances() internal {
        IERC20(zen).approve(address(unirouter), uint256(-1));
        IERC20(xen).approve(address(unirouter), uint256(-1));
        IERC20(WETH).approve(address(unirouter), uint256(-1));
    }
}
