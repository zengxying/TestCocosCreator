export class Log{
    static log(...data: any[]){
        console.log(...data);
    }
    static warn(...data: any[]){
        console.warn(...data);
    }
   
    static error(...data: any[]){
        console.error(...data);
    }
}