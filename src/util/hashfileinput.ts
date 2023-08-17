import { processList } from "./enums";


function series(tasks: Array<Function>, done: Function) {
    if(!tasks || tasks.length === 0) {
        done();
    } else {
        tasks[0](function(){
            series(tasks.slice(1), done);
        });
    }
}

export function hashFileInput(
    file: File,
    worker: Worker,
    cbProgress: (chunks: number, chunksProcessed: number) => void,
    cbFinished: (hash: string, timeProcessed: string) => void
    )
{	
    const chunksize = 1000000;
    let chunks = Math.ceil(file.size / chunksize),
        chunkTasks: Array<Function> = [],
        startTime = (new Date()).getTime();

    worker.onmessage = function(e) {
        // create callback
        
        for(let j = 0; j < chunks; j++){
            (function(j, f){
                chunkTasks.push(function(next: Function){
                    let blob = f.slice(j * chunksize, Math.min((j+1) * chunksize, f.size));
                    let reader = new FileReader();
                    
                    reader.onload = function(e) {
                        let chunk = e.target && e.target.result ? e.target.result : null;
                        worker.onmessage = function(e) {
                            // update callback
                            cbProgress(chunks, j+1);
                            next();
                        };
                        worker.postMessage({type: processList.update, chunk: chunk});
                    };
                    reader.readAsArrayBuffer(blob);
                });
            })(j, file);
        }
        series(chunkTasks, function(){
            worker.onmessage = function(e) {
                // finish callback
                cbFinished(e.data.hash, "in " + Math.ceil(((new Date()).getTime() - startTime) / 1000) + " seconds");
            };
            worker.postMessage({type: processList.finish});
        });
    };
    worker.postMessage({type: processList.create});
}