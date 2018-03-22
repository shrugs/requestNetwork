const BigNumber = require('bignumber.js');

const BurnContract = artifacts.require("./core/Burn.sol");
const RequestToken = artifacts.require("./test/RequestToken.sol");
const KyberContract = artifacts.require("./test/vendor/KyberMock.sol");

contract('burn contract ', accounts => {
  const admin = accounts[0];
  let reqInstance = null;
  let burnInstance = null;

  beforeEach(async () => {
    // Create 1000 REQ
    reqInstance = await RequestToken.new(
      1000,
      0,
      admin,
      admin,
    );
    
    // Create kyberMock
    const kyberInstance = await KyberContract.new();
    
    // Give 100 REQ (/e+18) to kyberMock
    reqInstance.transfer(kyberInstance.address, 100);
    
    // Create burn contract
    burnInstance = await BurnContract.new(reqInstance.address, kyberInstance.address);
    
    // Send 100 ETH (/e+18) to burn contract (simulates request creations fees)
    await burnInstance.send(100);
  });

	// Creation and event
	it("converts the ETH and burns the REQ", async () => {
    // Call burn. It will burn all 100 ETH
    await burnInstance.doBurn(0,0,0);

    // Check REQ burn. REQ supply should now be (1000 - 100) REQ
    const initialSupply = new BigNumber(10).pow(18).times(1000);
    const totalSupply = await reqInstance.totalSupply();

    assert.ok(totalSupply.plus(100).eq(initialSupply));
  });
  
	// Creation and event
	it("converts a maximum of `maxSrcAmount` ETH", async () => {
    // Call burn. It will burn only 5 ETH
    await burnInstance.doBurn(5,0,0);

    // Check REQ burn. REQ supply should now be (1000 - 5) REQ
    const initialSupply = new BigNumber(10).pow(18).times(1000);
    const totalSupply = await reqInstance.totalSupply();

    assert.ok(totalSupply.plus(5).eq(initialSupply));
	});
});


