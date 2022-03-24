import path from 'path'
import bfj from 'bfj'
import fs from 'fs'

export function prettyDate() {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let timestamp = Date.now();
    const dt = new Date(parseInt(timestamp));
    const d = dt.getDate();
    const month = monthNames[dt.getMonth()];
    const y = dt.getFullYear();
    const hh = dt.getHours();
    const mm = dt.getMinutes();
    return `${d}-${month}-${y}-${hh}-${mm}`;
}

export async function bfjStringify(data){
    let promise = new Promise((res, rej) => {

        bfj.stringify(data)
            .then(jsonString => {
                res(jsonString)
            })
            .catch(error => {
                console.error('bfjStringify.error', error);
                rej(error)
            });

    });
    let result = await promise;
    return result;
}

export async function saveToFile(fileName, data){
    let promise = new Promise((res, rej) => {

        let fullPath = path.join(process.cwd(), fileName);
        fs.writeFile(fullPath, data, err => {
            if (err) {
                console.error(err)
                rej({
                    success: false,
                    error
                })
            }
            else {
                res({
                    success: true,
                    path: fullPath
                })
            }
        })

    });
    let result = await promise;
    return result;
}

