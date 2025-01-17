class ApiError extends Error{
    constructor(
        statuscode,
        message= "something went wrong",
        error =[],
        statck =""   
    ){
        super(message),
        this.statuscode=statuscode
        ,this.data =null,
        this.message = message,
        this.success =false;
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this ,this.costructor)
        }

    }
}
export {ApiError};
//humne ye file islie bnyi h kyunki jab apierror aye to yhi se manage ho