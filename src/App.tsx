import { useFormik } from "formik";
import { Button } from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import { processList } from "./util/enums";
import { hashFileInput } from "./util/hashfileinput";
//import { getFileHash } from "./util/FileHash";


export interface FormValues {
  file: string;
};

const App: React.FC = () => {
  const fhWorker: Worker = useMemo(
    () => new Worker(new URL("./workers/filehash.ts", import.meta.url)),
    []
  );

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.Worker) {
      fhWorker.postMessage(processList.create);
    }
  }, [fhWorker]);


  const handleSubmitFile = (values: FormValues) => {
    console.log(values);
    if (fileRef && fileRef.current && fileRef.current.files) {
      let file = fileRef.current.files[0];
      console.log(file.size);

      if (window.Worker) {
        hashFileInput(
          file,
          fhWorker,
          (chunks, chunksProcessed) => {
            console.log('progress: ', chunksProcessed, chunks,)
          },
          (hash, timeProcessed) => {
            console.log('finished: ', hash, timeProcessed);
          });
      }
      
      let reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target) {
          return;
        }
        let data = event.target.result;
        if (typeof(data) !== 'string') {
          return;
        }
        console.log(data);
        let encrypted = 'foo';// getFileHash(data);
        console.log('encrypted: ' + encrypted);
      };
      reader.readAsBinaryString(file);
    }
  };
  
  const formik = useFormik({
    initialValues: {
      file: ''
    },
    onSubmit: handleSubmitFile,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <label htmlFor='file'>Select file to hash</label>
      <input
        id='file'
        type='file'
        ref={fileRef}
        {...formik.getFieldProps('file')}
      />
      {formik.errors.file ? <div>{formik.errors.file}</div> : null}
      <Button type='submit'>Submit</Button>
    </form>
  )
}

export default App;