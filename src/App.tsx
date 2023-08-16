import { useFormik } from "formik";
import { Button } from "@chakra-ui/react";
import { useRef } from "react";

export default function App() {
  const fileRef = useRef(null);
  
  const formik = useFormik({
    initialValues: {
      file: '',
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2))
    },
  })
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