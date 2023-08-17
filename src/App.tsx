import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CircularProgress,
  Flex,
  HStack,
  Heading,
  Progress,
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
  const [progress, setProgress] = useState({
    max: 100,
    value: 0
  })
  
  useEffect(() => {
    if (window.Worker) {
      fhWorker.postMessage(processList.create);
    }
  }, [fhWorker]);


  const handleSubmitFile = () => {
    if (fileRef && fileRef.current && fileRef.current.files) {
      let file = fileRef.current.files[0];

      if (window.Worker) {
        hashFileInput(
          file,
          fhWorker,
          (chunks, chunksProcessed) => {
            console.log('progress: ', chunksProcessed, chunks);
            setProgress({
              ...progress,
              max: chunks,
              value: chunksProcessed
            });
          },
          (hash, timeProcessed) => {
            console.log('finished: ', hash, timeProcessed);
            setFileMeta({
              ...filemeta,
              hash: hash,
              name: file.name,
              size: file.size
            });
          });
      }
    }
  };

  return (
    <Flex bg="gray.100" align="center" justify="center" h="100vh">
      <HStack alignItems={"stretch"}>
      <Box bg="white" p={6} rounded="md">
          <VStack spacing={4} align="flex-start">
            <label htmlFor='file'>Select file to hash</label>
            <input
              id='file'
              type='file'
              ref={fileRef}
              onChange={handleSubmitFile}
            />
            
            <Textarea
              id='filedescription'
              placeholder='Enter file description'
              maxLength={500}
              onChange={(e) => {
                setFileMeta({
                  ...filemeta,
                  description: e.target.value
                })
              }}
             />

          </VStack>
      </Box>
      <Card size={"lg"} minW={'600px'}>
        <CardHeader >
          <Heading size='md'>File Hash Report
          <CircularProgress value={progress.value} color='green.400' max={progress.max} size='30px' pl={10} />
          </Heading>
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