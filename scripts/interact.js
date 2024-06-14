const hre = require("hardhat");

async function main() {
  // Contract related
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const Contract = await hre.ethers.getContractFactory("CompanyRegistry");
  const contract = await Contract.attach(contractAddress);
  // Accounts related
  const [account1, account2, account3] = await hre.ethers.getSigners();

  const accounts = [account1, account2, account3];

  // Send transaction from each account
  accounts.map(async (account, i) => {
    let tx = await contract.connect(account).addCompany(`name${i}`, `logo${i}`, true, `token${i}`);
    await tx.wait();
    console.log(`Transaction ${i} confirmed`);
  });

  let total = await contract.totalCompanies();
  console.log("Total companies:", total);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
