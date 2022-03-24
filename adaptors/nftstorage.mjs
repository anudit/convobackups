import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });
const { NFTSTORAGE_KEY } = process.env;

import { NFTStorage, Blob } from "nft.storage";

// Gateway : https://<hash>.ipfs.nftstorage.link/
export async function storeOnNftStorage( stringifiedData ){
    console.log("🔃 Backing up data to NFT.Storage");

    const client = new NFTStorage({ token: NFTSTORAGE_KEY })
    const content = new Blob([stringifiedData]);
    let ipfsHash = await client.storeBlob(content);

    return ipfsHash;

}
