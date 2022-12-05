import {bcs, starcoin_types} from "@starcoin/starcoin";
import {TxnBuilderTypes} from "@starcoin/aptos"

const {
    StructTag,
} = TxnBuilderTypes;

export class CoinAirdropStrcoin {
    private address: starcoin_types.AccountAddress;
    private coin_type: string;
    private amount: number;

    constructor(address: string, amount: number, coin_type: string) {
        this.address = starcoin_types.AccountAddress.deserialize(new bcs.BcsDeserializer(Buffer.from(address.replace('0x', ''), 'hex')));
        StructTag.fromString(coin_type)
        this.coin_type = coin_type;
        this.amount = Number(amount);

    }

    address_string() {
        return "0x" + Buffer.from(this.address.value).toString('hex')
    }

    get_amount() {
        return this.amount
    }

    get_coin_type() {
        return this.coin_type.toString()
    }

    serialize() {
        let b = new bcs.BcsSerializer()
        this.address.serialize(b)
        b.serializeStr(this.coin_type)
        b.serializeU64(this.amount)
        return b.getBytes()
    }
}