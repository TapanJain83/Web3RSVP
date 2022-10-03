const hre = require("hardhat");

const main = async () => {
    // deploy the contract locally
    const rsvpContractFactory = await hre.ethers.getContractFactory("Web3RSVP");
    const rsvpContract = await rsvpContractFactory.deploy();
    await rsvpContract.deployed();
    console.log("Contract deployed to:", rsvpContract.address);
    // Hardhat allows us to access different test wallets inside our script 
    const [deployer, address1, address2] = await hre.ethers.getSigners();
    // console.log(deployer, address1, address2);
    // define the event data we are going to use
    // IPFS CID we already created for testing purpose
    let deposit = hre.ethers.utils.parseEther("1");
    let maxCapacity = 3;
    let timestamp = 1718926200;
    let eventDataCID =
        "bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi";


    // create a new event with our mock data
    let txn = await rsvpContract.createNewEvent(
        timestamp,
        deposit,
        maxCapacity,
        eventDataCID
    );

    // Once the transaction is done, txn.wait will return data about the transaction including an array of the emitted events
    let wait = await txn.wait();
    console.log("NEW EVENT CREATED:", wait.events[0].event, wait.events[0].args);

    let eventID = wait.events[0].args.eventID;
    console.log("EVENT ID:", eventID);


    // We can have each account we pulled from getSigners RSVP to the event. 
    // By default, Hardhat will call our contract functions from the deployer wallet address. 
    // To call a contract function from another wallet, we can use the .connect(address) modifier.
    txn = await rsvpContract.createNewRSVP(eventID, {
        value: deposit
    });
    wait = await txn.wait();
    console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args);


    txn = await rsvpContract.connect(address1).createNewRSVP(eventID, {
        value: deposit
    });
    wait = await txn.wait();
    console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args);

    txn = await rsvpContract
        .connect(address2)
        .createNewRSVP(eventID, {
            value: deposit
        });
    wait = await txn.wait();
    console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args);


    // confirmAllAttendees calls function confirmAttendee whcih emits an event.
    // Therefore wait will have array of events  
    txn = await rsvpContract.confirmAllAttendees(eventID);
    wait = await txn.wait();
    wait.events.forEach((event) =>
        console.log("CONFIRMED:", event.args.attendeeAddress)
    );


    // wait 10 years - hardhat lets us simulate the passing of time
    await hre.network.provider.send("evm_increaseTime", [15778800000000]);

    txn = await rsvpContract.withdrawUnclaimedDeposits(eventID);
    wait = await txn.wait();
    console.log("WITHDRAWN:", wait.events[0].event, wait.events[0].args);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();