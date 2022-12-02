import {Button, InputLabel, makeStyles, TextField} from '@material-ui/core';
import React, {useState} from 'react'
import Dropzone from 'react-dropzone'
import API from '../../api/api'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar, {SnackbarOrigin} from '@material-ui/core/Snackbar';
import {starcoin_contract_address} from "../../lib/contract";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {create_airdrop} from "../../lib/merkletree";
import {useStores} from "../../useStore";
import {bcs, providers, utils} from "@starcoin/starcoin";
import {PROJECT} from "../../lib/project";

const useStyles = makeStyles((theme) => ({
  dropZoneArea: {
    background: '#004c807d',
    padding: '8rem 2rem',
    textAlign: 'center',
    color: '#ffffff',
    border: '1px dashed',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },

}));
const nodeUrlMap: any = {
  '1': 'https://main-seed.starcoin.org',
  '2': 'https://proxima-seed.starcoin.org',
  '251': 'https://barnard-seed.starcoin.org',
  '253': 'https://halley-seed.starcoin.org',
  '254': 'http://localhost:9850',
}

export interface State extends SnackbarOrigin {
  open: boolean;
  message: string
}

const ExcelUpload: React.FC = () => {
  const classes = useStyles();
  const [csv, SetCsv] = useState<string>("");
  const [File, SetFile] = useState<string>();

  const {AccountStore} = useStores()
  const [account, setAccount] = useState<string>();
  const [coin_type_id, setcoin_type_id] = React.useState(0);
  const [airdrop, setAirdrop] = React.useState({
    name: "",
    name_en: "",
    coin_type: "0x1::STC::STC",
    coin_symbol: "STC",
    coin_precision: "9",
    total: "",
    total_amount: 0,
    airdrop_amount: 0,
  });

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [cansub, setCansub] = React.useState(false);
  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: ""
  });
  const {vertical, horizontal, open, message} = state;

  const [balance,setBalance] = React.useState<BigInt>(BigInt(0));

  async function getBalance(
      network: string,
      address: string,
      coin_type: string
  ): Promise<BigInt> {
    setCansub(false);

    try {
      let balance = await new providers.JsonRpcProvider(nodeUrlMap[window.starcoin.networkVersion]).getBalance(address, coin_type) || 0
      return BigInt(balance.toString());
    } catch (e) {
      setState({
        open: true,
        vertical: vertical,
        horizontal: horizontal,
        message: "check balance ERROR !"
      });
    }

    return BigInt(0)
  }

  async function onDrop(file: any) {
    setCansub(false)
    const reader = new FileReader()
    reader.onload = async () => {
      let binaryStr = reader.result || new ArrayBuffer(0)
      let binary: Buffer | void = (binaryStr instanceof ArrayBuffer) ? Buffer.from(binaryStr) : Buffer.from(binaryStr)
      try {
        setAirdrop({...airdrop, total: BigInt(0).toString(), airdrop_amount: 0})
        let {
          total,
          len
        } = create_airdrop(binary.toString('utf8'), airdrop.coin_type, Number(airdrop.coin_precision));
        setAirdrop({
          ...airdrop,
          total: (Number(total) / Math.pow(10, Number(airdrop.coin_precision))).toString(),
          airdrop_amount: len
        })
        SetCsv(binary.toString('utf8'))
        SetFile(file[0].name);

        let balance = await getBalance(
            "starcoin",
            AccountStore.currentAccount,
            airdrop.coin_type
        );
        setBalance( balance)
        if ((balance || BigInt(0)) > total) {
          setCansub(true)
        } else {
          setCansub(false)
        }
      } catch (e) {
        setState({open: true, vertical: vertical, horizontal: horizontal, message: e.message});
      }

    }
    reader.readAsArrayBuffer(file[0]);
  }

  async function onSub() {
    console.log(AccountStore.currentNetworkVersion)
    let data = {
      project: `${PROJECT}`,
      name: airdrop.name,
      name_en: airdrop.name_en,
      token: airdrop.coin_type,
      token_symbol: airdrop.coin_symbol,
      token_precision: airdrop.coin_precision,
      chain: "starcoin",
      chainid: window.starcoin.networkVersion,
      csv: csv,
      address: AccountStore.currentAccount,
      time: new Date().toUTCString(),
      contract: ""
    }

    if (csv === "") {
      setState({open: true, vertical: vertical, horizontal: horizontal, message: "csv is empty"});
      return
    }
      data.contract = starcoin_contract_address;
      let sign = await window.starcoin.request({
        method: 'personal_sign',
        params: [Buffer.from(JSON.stringify(data), 'utf8').toString('hex'), AccountStore.currentAccount],
      })
      let req = await API.upload({data: data, signature: sign})
      if (req.data.error === 400) {
        setState({open: true, vertical: vertical, horizontal: horizontal, message: req.data.data.toString()});
      } else if (req.data.error === 200) {
        const airdropFunctionIdMap: any = {
          '1': `${starcoin_contract_address}::MerkleDistributorScript::create`, // main
          '2': '', // proxima
          '251': '', // barnard
          '253': `${starcoin_contract_address}::MerkleDistributorScript::create`, // halley
          '254': '', // localhost
        }
        const functionId = airdropFunctionIdMap[window.starcoin.networkVersion]
        const tyArgs = [airdrop.coin_type]
        const args = [req.data.data.airdrop_id, req.data.data.root, req.data.data.total, airdrop.airdrop_amount]
       console.log(functionId,tyArgs,args)
        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrlMap[window.starcoin.networkVersion])
        const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return "0x" + Buffer.from(se.getBytes()).toString('hex')
        })()

        const txParams = {
          data: payloadInHex,
        }
        let provider = new providers.Web3Provider(
            window.starcoin,
            "any"
        )
        const transactionHash = await provider.getSigner().sendUncheckedTransaction(txParams)
        try {
          let cli = new providers.JsonRpcProvider(nodeUrlMap[window.starcoin.networkVersion])
          await cli.waitForTransaction(transactionHash, 1, 9000)
          setState({open: true, vertical: vertical, horizontal: horizontal, message: " Airdrop is create !"});
        } catch (e) {
          setState({
            open: true,
            vertical: vertical,
            horizontal: horizontal,
            message: "Airdrop create ERROR !"
          });
        }

      }
  }

  async function set_coin_type(coin_type_id: number) {
      if (coin_type_id === 1) {
        setAirdrop({
          ...airdrop,
          coin_type: "0x1::STC::STC",
          coin_symbol: "STC",
          coin_precision: "9"
        })
        setcoin_type_id(Number(coin_type_id))
      } else if (coin_type_id === 3) {
        setAirdrop({
          ...airdrop,
          coin_type: "0x8c109349c6bd91411d6bc962e080c4a3::STAR::STAR",
          coin_symbol: "STAR",
          coin_precision: "9"
        })
        setcoin_type_id(Number(coin_type_id))
      } else {
        setState({open: true, vertical: vertical, horizontal: horizontal, message: "当前网络不能选择此 Token"});
      }
  }

  const handleClose = () => {
    setState({...state, open: false});
  };


  return (
      <div>
        <Snackbar
            anchorOrigin={{vertical, horizontal}}
            open={open}
            onClose={handleClose}
            message={message}
            key={vertical + horizontal}
        />

        <div>
          <div>
            当前选择的文件:{File}
            <p/>
            空投总量: {airdrop.total}
            <p/>
            空投个数: {airdrop.airdrop_amount}
            <p/>
            空投代币：{airdrop.coin_type}
            <p/>
            空投名称：{airdrop.name}
            <p/>
            空投英文名称：{airdrop.name_en}
            <p/>
          </div>
          <p></p>
          <div>活动中文名:
            <TextField type='text' variant="outlined" defaultValue={airdrop.name} onChange={
              (e) => {
                setAirdrop({...airdrop, name: e.target.value})
              }
            }/>
          </div>
          <p></p>
          <div>活动英文名:<TextField type='text' variant="outlined" defaultValue={airdrop.name_en} onChange={
            (e) => {
              setAirdrop({...airdrop, name_en: e.target.value})
            }
          }/>
          </div>
          <p></p>

          代币类型: <FormControl className={classes.formControl}>
          <Select
              value={coin_type_id}
              onChange={(e) => {
                set_coin_type(e.target.value as number)
              }}
          >
            <MenuItem value={0}>None</MenuItem>
            <MenuItem value={1}>STC</MenuItem>
            <MenuItem value={3}>STAR</MenuItem>
          </Select>
        </FormControl>
          <p></p>
          <Dropzone
              onDrop={onDrop}
              accept=".csv"
              minSize={1}
          >
            {({getRootProps, getInputProps, isDragActive}) => {

              return (
                  <div {...getRootProps()} className={classes.dropZoneArea}>
                    <input {...getInputProps()} />
                    {!isDragActive && '点击上传 csv 文件'}
                  </div>
              )
            }
            }
          </Dropzone>
          <Button variant="outlined" color="primary" onClick={(e) => {
            setConfirmOpen(true)
          }}>
            Submit
          </Button>

          <Dialog
              open={confirmOpen}
              onClose={(e) => {
                setConfirmOpen(false)
              }}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"确认发起空投?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" component={'span'}>
                空投总量: {airdrop.total}
                <p/>
                空投个数: {airdrop.airdrop_amount}
                <p/>
                空投代币：{airdrop.coin_type}
                <p/>
                空投名称：{airdrop.name}
                <p/>
                空投英文名称：{airdrop.name_en}
                <p/>

              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={(e) => {
                setConfirmOpen(false)
              }} color="primary">
                Disagree
              </Button>
              <Button disabled={!cansub} onClick={(e) => {
                setConfirmOpen(false)
                onSub()
              }} color="primary" autoFocus>
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
  )
}

export default ExcelUpload