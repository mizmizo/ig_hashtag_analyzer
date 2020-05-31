'use strict';

const common_errmessage = 'Instagram Graph APIエラーを検知しました。';
const api_errmessage_header = 'API error: ';
const sustainable_message = '分析を中止します。';
const critical_message = 'アプリを終了します。';
const transient_message = '一時的なエラーが発生しています。時間をおいて再度お試しください。';
const api_errcode = {
    803:{sustainable:true,
         message:'ビジネスアカウントIDが間違っています。'},
    190:{sustainable:true,
         message:'アクセストークンが間違っています。'},
    100:{sustainable:true,
         message:'アクセストークンの設定が間違っています。'},
    2500:{sustainable:false,
          message:'アプリサポートにご連絡ください。'},
    18:{sustainable:true,
          message:'分析するハッシュタグの数を減らしてお試しください。'}
};

// code : 0 -> Built-in error, 1 -> App-sequence error, other -> API error
class AppError extends Error {
    constructor(sustainable, code, err) {
        super(err);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
        if(err instanceof Error){
            this.stack = err.stack;
        }

        this.sustainable = sustainable;
        this.code = code;
        this.message += sustainable ? '\n' + sustainable_message :  '\n' + critical_message;
    }
}

// If json contains 'error' field, throw AppError.
function checkAPIRes (json) {
    if(json.error){
        let message = common_errmessage + '\n';
        let sustainable = true; // treat non-listed errors as non-critical
        // if the error-code is registered to api_errcode, add help-message
        if(api_errcode[json.error.code]){
            sustainable = api_errcode[json.error.code].sustainable;

            message += api_errcode[json.error.code].message + '\n';
        }

        // copy API error
        message += '\n' + api_errmessage_header + json.error.message + '\n' + json.error.error_user_msg;;

        throw new AppError(sustainable, json.error.code, message);
    }
}

module.exports = {
    AppError,
    checkAPIRes
}
