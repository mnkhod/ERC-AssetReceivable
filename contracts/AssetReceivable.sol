// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AssetReceivable {
  address private _receiveOwner;

  event ReceivableOwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  constructor() {
    _receiveOwner = msg.sender;
  }

  receive() external payable {}

  function getRecieveOwnership() view public returns(address){
    return _receiveOwner;
  }

  function rescueToken(IERC20 _token,address _to,uint _amount) public virtual onlyReceivableOwner {
    _token.transfer(_to,_amount);
  }

  function rescueNft(IERC721 _nft,address _from,address _to,uint _id) public virtual onlyReceivableOwner {
    _nft.transferFrom(_from, _to, _id);
  }

  function rescueCoin(address _to,uint _amount) public virtual onlyReceivableOwner {
    bool sent = payable(_to).send(_amount);
    require(sent, "AssetReceivable: failed to send coin");
  }

  function changeRecievableOwner(address newOwner) public virtual onlyReceivableOwner {
      require(newOwner != address(0), "ReceivableOwnable: new owner is the zero address");
      address oldOwner = _receiveOwner;
      _receiveOwner = newOwner;
      emit ReceivableOwnershipTransferred(oldOwner, newOwner);
  }

  modifier onlyReceivableOwner() {
      require(_receiveOwner == msg.sender, "ReceivableOwnable: caller is not the owner");
      _;
  }
}
