import dotenv from 'dotenv'
import { File, Web3Storage } from 'web3.storage';
dotenv.config({ path: '.env.local' });
const { WEB3_STORAGE_API_KEY } = process.env;

export async function storeOnWeb3Storage(fn, stringified) {

    try {
        console.log("🔃 Backing up data to web3.storage");

        const client =  new Web3Storage({ token: WEB3_STORAGE_API_KEY });
        const files = [new File([stringified], fn)];
        const cid = await client.put(files);

        if (cid.slice(0, 3) === 'baf'){
            console.log('🟢 Backup to web3.storage Successful.');
        }
        else {
            console.log('🔴 Backup to web3.storage Failed')
            console.log(cid);
        }

        return cid;

    } catch (error) {
        console.log('🔴 web3.storage Backup Error', error);
    }
}
