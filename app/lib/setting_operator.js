'use strict';

const {AccessInfo} = require('./token_operator');
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
}

module.exports = AppSetting;
