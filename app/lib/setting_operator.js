'use strict';

const fs = require('fs');
const {AccessInfo} = require('./token_operator');
const {AppError} = require('./err_handler');

class AppSetting{
    post_num;
    top_thre;
    ac;
    is_valid;

    constructor(post_num, top_thre, igID, token){
        if(post_num && top_thre && igID && token){
            this.post_num = post_num;
            this.top_thre = top_thre;
            this.ac = new AccessInfo(igID, token);
            this.is_valid = false;
        } else {
            this.post_num = "9";
            this.top_thre = "25";
            this.ac = new AccessInfo();
            this.is_valid = false;
        }
    }

    importFile(path){
        const import_json = require(path);
            this.post_num = import_json.post_num;
            this.top_thre = import_json.top_thre;
            this.ac = new AccessInfo(import_json.igID, import_json.token);
            this.is_valid = false;
    }

    exportFile(path){
        const export_json = {"post_num": this.post_num,
                           "top_thre": this.top_thre,
                           "igID": this.ac.igID,
                           "token": this.ac.token};
        fs.writeFile(path, JSON.stringify(export_json, null, 1), (err) => {
            if(err){
                throw new AppError(true, 0, err);
            }
        });
    }
}

module.exports = AppSetting;
