import { ethers } from 'ethers';
import { CID, create } from 'ipfs-http-client';

export async function pinToCrust(hash) {
    try {

        const pair = ethers.Wallet.createRandom();
        const sig = await pair.signMessage(pair.address);
        const authHeaderRaw = `eth-${pair.address}:${sig}`;
        const authHeader = Buffer.from(authHeaderRaw).toString('base64');

        const ipfs = create({
            url: 'https://crustwebsites.net/api/v0',
            headers: {
                authorization: `Basic ${authHeader}`
            }
        });

        const cid = CID.parse(hash)
        const res = await ipfs.pin.add(cid);
        console.log(res);
        return res;
    }
    catch (error) {
        console.log('pinToCrust.error', error);
    }
}
