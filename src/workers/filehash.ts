
/* eslint-disable no-restricted-globals */
import CryptoJS from 'crypto-js';
import { processList } from "../util/enums";
import { arrayBufferToWordArray } from "../util/arraybuffer";

interface messageProps {
    type: string;
    chunk?: ArrayBuffer;
}

let sha256: any;

self.onmessage = (e: MessageEvent<messageProps>) => {
    
    if (e.data.type === processList.create) {
        sha256 = CryptoJS.algo.SHA256.create();
        self.postMessage({type: processList.create});
    } else if (e.data.type === processList.update) {
        if (!e.data.chunk) {
            throw new Error('data chunk missing');
        }
        sha256.update(arrayBufferToWordArray(e.data.chunk));
        self.postMessage({type: processList.update});
    } else if (e.data.type === processList.finish) {
        self.postMessage({type: processList.finish, hash: "" + sha256.finalize()});
    }
}

export {};