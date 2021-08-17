import { makeStyles } from '@material-ui/core';
import React from 'react'
import Dropzone from 'react-dropzone'
import API from '../../api/api'

const useStyles = makeStyles((theme) => ({
  dropZoneArea: {
    background: '#004c807d',
    padding: '8rem 2rem',
    textAlign: 'center',
    color: '#ffffff',
    border: '1px dashed',
  }
}));



const ExcelUpload:React.FC = () => {
  const classes = useStyles()
  async function onDrop(file:any) {
    let rlt = await API.upload(file[0])
    console.log(rlt)
  }

  return (
    <Dropzone
        onDrop={onDrop}
        accept=".csv"
        minSize={0}
      >
        {({getRootProps, getInputProps, isDragActive}) => {
          
          return (
            <div {...getRootProps()} className={classes.dropZoneArea}>
              <input {...getInputProps()} />
              {!isDragActive && 'Click here or drop a file to upload!'}
            </div>
          )}
        }
      </Dropzone>
  )
}

export default ExcelUpload