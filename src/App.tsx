import { useFormik } from "formik";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Heading,
  Stack,
  StackDivider,
  Text,
  Textarea,
  VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import { processList } from "./util/enums";
import { hashFileInput } from "./util/hashfileinput";


export interface FormValues {
  file: string;
  filedescription: string;
};

const App: React.FC = () => {
  const fhWorker: Worker = useMemo(
    () => new Worker(new URL("./workers/filehash.ts", import.meta.url)),
    []
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [filemeta, setFileMeta] = useState({
    hash: '',
    name: '',
    size: 0,
    description: ''
  });
  
  useEffect(() => {
    if (window.Worker) {
      fhWorker.postMessage(processList.create);
    }
  }, [fhWorker]);


  const handleSubmitFile = (values: FormValues) => {
    if (fileRef && fileRef.current && fileRef.current.files) {
      let file = fileRef.current.files[0];

      if (window.Worker) {
        hashFileInput(
          file,
          fhWorker,
          (chunks, chunksProcessed) => {
            console.log('progress: ', chunksProcessed, chunks);
          },
          (hash, timeProcessed) => {
            console.log('finished: ', hash, timeProcessed);
            setFileMeta({
              ...filemeta,
              hash: hash,
              name: file.name,
              size: file.size,
              description: values.filedescription
            });
          });
      }
    }
  };
  
  const formik = useFormik({
    initialValues: {
      file: '',
      filedescription: ''
    },
    onSubmit: handleSubmitFile,
  });

  return (
    <Flex bg="gray.100" align="center" justify="center" h="100vh">
      <HStack alignItems={"stretch"}>
      <Box bg="white" p={6} rounded="md">
        <form onSubmit={formik.handleSubmit}>
          <VStack spacing={4} align="flex-start">
            <label htmlFor='file'>Select file to hash</label>
            <input
              id='file'
              type='file'
              ref={fileRef}
              {...formik.getFieldProps('file')}
            />

            <Textarea
              id='filedescription'
              placeholder='Enter file description'
              maxLength={500}
              {...formik.getFieldProps('filedescription')}
             />

            {formik.errors.file ? <div>{formik.errors.file}</div> : null}
            <Button type='submit'>Submit</Button>
          </VStack>
        </form>
      </Box>
      <Card size={"lg"}>
        <CardHeader>
          <Heading size='md'>File Hash Report</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing='4'>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                SHA256
              </Heading>
              <Text pt='2' fontSize='sm' color="green">
                {filemeta.hash}
              </Text>
            </Box>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                File name
              </Heading>
              <Text pt='2' fontSize='sm'>
                {filemeta.name}
              </Text>
            </Box>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                File Size
              </Heading>
              <Text pt='2' fontSize='sm'>
                {filemeta.size}
              </Text>
            </Box>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                File Description
              </Heading>
              <Text pt='2' fontSize='sm'>
                {filemeta.description}
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>
      </HStack>
    </Flex>
  )
}

export default App;