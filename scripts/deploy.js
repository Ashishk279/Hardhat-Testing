const hre = require("hardhat");
// console.log(hre);

async function main(){
    const currentTImestampInSeconds = Math.round(Date.now() / 1000);
    const ONE_YEARS_IN_SECONDS = 365 * 24 * 60 * 60;
    const unlockTIme = currentTImestampInSeconds + ONE_YEARS_IN_SECONDS;
    

    const lockedAmount = hre.ethers.parseEther("0.001");
    // console.log(currentTImestampInSeconds)
    // console.log(ONE_YEARS_IN_SECONDS)
    // console.log(unlockTIme)
    console.log(lockedAmount);

    const MyTest = await hre.ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockTIme, {value: lockedAmount});
    await myTest.waitForDeployment();

    console.log(`Contract contain ETh & address: ${myTest.target}`)

    console.log(myTest);
}

main().catch((err)=> {
    console.log(err);
    process.exitCode = 1;
})