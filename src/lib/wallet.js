import {bcs, providers} from "@starcoin/starcoin"
import {Buffer} from "buffer/index.js";

export class Wallet {
    chain = "";
    wallet_name = "";
    provider = {};

    constructor(provider, chain, wallet_name) {
        this.chain = chain
        this.provider = provider
        this.wallet_name = wallet_name
    }

    async signAndSubmitTransaction(payload) {
        const payloadInHex = (function () {
            const se = new bcs.BcsSerializer()
            payload.serialize(se)
            return "0x" + Buffer.from(se.getBytes()).toString('hex')
        })()

        const txParams = {
            data: payloadInHex,
        }
        let provider = new providers.Web3Provider(
            this.provider,
            "any"
        )
        return await provider.getSigner().sendUncheckedTransaction(txParams)
    }

    async account() {
            return this.provider.selectedAddress;
    }

    async connect() {
        return await this.provider.request({
            method: "stc_requestAccounts",
        });
    }

    async network() {
        return this.provider.networkVersion;
    }

}