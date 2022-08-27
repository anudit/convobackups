import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });
const { MORALIS_API_KEY } = process.env;
import Moralis from "moralis";

export async function storeOnMoralis( fn, stringified ){

    try {
        console.log("🔃 Backing up data to Moralis");

        const serverUrl = `https://qintlf1wodcu.usemoralis.com:2053/server`;
        const appId = "dYW4M2NnUD6sfmo3KoLOPoGhRtBdF33gIU8f2ZOH";

        await Moralis.start({
            apiKey: MORALIS_API_KEY
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
