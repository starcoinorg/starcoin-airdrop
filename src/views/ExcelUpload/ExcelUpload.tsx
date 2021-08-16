import React from 'react'
import Dropzone from 'react-dropzone'
import API from '../../api/api'


const ExcelUpload:React.FC = () => {
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
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {!isDragActive && 'Click here or drop a file to upload!'}
            </div>
          )}
        }
      </Dropzone>
  )
}

export default ExcelUpload