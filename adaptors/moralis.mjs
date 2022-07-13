import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });
const { MORALIS_MASTER_KEY } = process.env;
import Moralis from "moralis/node.js";

export async function storeOnMoralis( fn, stringified ){

    try {
        console.log("🔃 Backing up data to Moralis");

        const serverUrl = `https://godepqpv7rsn.usemoralis.com:2053/server`;
        const appId = "5lhtN6Bgtei5n6gRox7WCgBA6N4cnDkgjhkLAONr";

        await Moralis.start({
            serverUrl,
            appId,
            masterKey: MORALIS_MASTER_KEY
        });
        console.log('🟢 Started Moralis Server');

        const buf = Buffer.from(stringified);

        const moralisFile = new Moralis.File(fn, {
            base64: buf.toString('base64')
        });
        await moralisFile.saveIPFS({useMasterKey:true});
        // console.log(moralisFile);

        const backup = new Moralis.Object("Backups");
        backup.set("name", fn);
        backup.set("resume", moralisFile);
        await backup.save();

        // console.log(backup);


        if (Object.keys(moralisFile).includes('_hash') == true){
            console.log('🟢 Backup to Moralis Successful');
        }
        else {
            console.log('🔴 Backup to Moralis Failed')
            console.log(json);
        }

        return moralisFile;

    } catch (error) {
        console.log('🔴 Moralis Backup Error', error);
    }

}
