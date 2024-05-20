const {time, loadFixture} = require("@nomicfoundation/hardhat-network-helpers");

// console.log(time);
// console.log(loadFixture);

// console.log(time.days)

const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

// console.log(anyValue)

const {expect} = require("chai");
const {ethers} = require("hardhat");
const { extendConfig } = require("hardhat/config");

// console.log(expect);

describe("MyTest", function(){
    async function runEveryTime(){
        const ONE_YEARS_IN_SECONDS = 365 * 24 *60 *60;
        const ONE_GWEI = 1_000_000_000;
        
        const lockedAmount = ONE_GWEI;
        const unlockTime = (await time.latest()) + ONE_YEARS_IN_SECONDS;
        // console.log(unlockTIme, lockedAmount);
        // console.log(ONE_YEARS_IN_SECONDS, ONE_GWEI);

        const [owner, otherAccount] = await ethers.getSigners();
        // const [owner, act1, act2, act3, act20] = await ethers.getSigner();
        // console.log(owner)
        // console.log(otherAccount)

        const MyTest = await ethers.getContractFactory("MyTest");
        const myTest = await MyTest.deploy(unlockTime, {value: lockedAmount});

        return {myTest, unlockTime, lockedAmount, owner, otherAccount};
    }

    describe("Deployment" , function(){
        // Checking Unlocked Time
        it('Should check unlocked time', async function(){
            const {myTest, unlockTime} = await loadFixture(runEveryTime);
            // console.log(unlockTime)
            // console.log(myTest)
            expect(await myTest.unlockedTime()).to.equal(unlockTime);
            // const ab = expect(await myTest.unlockedTime()).to.equal(unlockTime);
            // console.log(ab);
        })

        // Checking Owner

        it('Should set the right owner', async function(){
            const{myTest, owner} = await loadFixture(runEveryTime);
            expect(await myTest.owner()).to.equal(owner.address)
        })

        // Check thebalance

        it('Should set the right Balance', async function(){
            const{myTest, lockedAmount} = await loadFixture(runEveryTime);

            // const contractBal = await ethers.provider.getBalance(myTest.target);
            // console.log(contractBal);

            expect(await ethers.provider.getBalance(myTest.target)).to.equal(lockedAmount)
        })

        // Condition check

        it('Should fail if the unlocked is not in the future', async function(){
            const latestTime = await time.latest();
            // console.log(latestTime/60/60/60/24);

            const MyTest = await ethers.getContractFactory("MyTest");
            await expect(MyTest.deploy(latestTime, {value: 1})).to.be.revertedWith("Unlocked time should be in future")
        })
    })

    describe("Withdrawals", function(){
        describe("Validations", function(){
            //Time Check for withdraw
            it("Should revert with the right if called to soon", async function(){
                const {myTest} = await loadFixture(runEveryTime);

                await expect(myTest.withdraw()).to.be.revertedWith("Wait till the time period complete.");
            })

            it("Should revert the message for right owner", async function(){
                const {myTest, unlockTime, otherAccount} = await loadFixture(runEveryTime);
              //  const newTime = await time.increaseTo(unlockTime);
                // console.log(newTime);
                await time.increaseTo(unlockTime);
                await expect(myTest.connect(otherAccount).withdraw()).to.be.revertedWith("Your are not an owner");

            });

            it("Should not fail if the unlockTime has arrived and the owner calls it", async function(){
                const {myTest, unlockTime} = await loadFixture(runEveryTime);
                await time.increaseTo(unlockTime);
                await expect(myTest.withdraw()).not.to.be.reverted;
            })

           
        })
    })

    // Now Lets check for events
    describe("Events", function(){
        it("Should emit the event on withdrawals", async function(){
            const {myTest, unlockTime, lockedAmount} = await loadFixture(runEveryTime);

            await time.increaseTo(unlockTime);
            await expect(myTest.withdraw()).to.emit(myTest, "Withdrawal").withArgs(lockedAmount, anyValue);
        })
    })

    describe("Transfer", function(){
        it("Should transfer the funds to the owner", async function(){
            const {myTest, unlockTime, lockedAmount, owner} = await loadFixture(runEveryTime);
            await time.increaseTo(unlockTime);
            await expect(myTest.withdraw()).to.changeEtherBalances([owner, myTest], [lockedAmount, -lockedAmount]);
        })
    })

    runEveryTime();
})
