'use strict';

const fetch = require('node-fetch');
// let gallery = new Object();

// window.onload = function(){
//     gallery = document.getElemeentById("gallery");
// };

class TagAnalyzer {
    num = 9;   // max 9 object
    igID  = "17841408371705236";
    token = "EAAFsQOxDEXUBAKQrPJ3VZCut6GLyRV1jx0ZAHN2hQpJFQYw8CUhBL4Y41zMZAkxjZCPJnHasL5HegmpcRQnaEF5ySbvnZAbl69VDMSb1BTzcoHwIR02lIsj3xWtZAo8Q9yvNYFwjZCr77m0oZAPBd07hHAJwV7yKGEe4ZAnVTu8gWwgZDZD";
    fAPI = "https://graph.facebook.com/v7.0/";   // Ver.7.0
    post_data; // [(post-id, permalink, like_count, timestamp, media_url, [tags])]
    all_taglist; // {tag : count}
    selected_taglist; // {tag : [post-id]}
    tag_infolist; // {tag : {status, [top_id], [recent_id]}} : status = 1(success), 0(fail)
    result;  // [(id, permalink, like_count, timestamp, media_url, [tag, status])]

    constructor(){
        this.selected_taglist = {};
        //todo : get igID&token from setting file.
    }

    // API -> post_data, all_taglist
    async requestPostData() {
        // === generate API query ===>
        let query =
              "username," // Account data
              + "media.limit(" + this.num + ")" // the number of media to analyse
              + "{caption,id,like_count,media_url,permalink,timestamp}"; // post data
        let gURL   = this.fAPI + this.igID + "?fields=" + query + "&access_token=" + this.token;
        // <=== generate API query ===

        try {
            // === get post data ===>
            const res = await fetch(gURL, {method: 'GET'});
            const json = await res.json();
            const media_data = json["media"]["data"];
            this.post_data = [];
            for(const item of media_data) {
                // 各投稿のハッシュタグ一覧を抽出
                const hashtags = item.caption.match(/[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー._-]+/gm);
                let tags = [];
                for(const tag of hashtags) {
                    tags.push(tag.slice(1)); // #を除去してリストに追加
                }
                // 投稿データの生成
                this.post_data.push({
                    id:item.id,
                    permalink:item.permalink,
                    like_count:item.like_count,
                    timestamp:item.timestamp,
                    media_url:item.media_url,
                    tags:tags
                });
            }
            // console.log(this.post_data);
            // <=== get post data ===

            // === organize tags ===>
            this.__organizeTagList();
        } catch (err) {
            console.log('error : ' + err);
            //TODO : error handling
        }
    }

    getAllTagList() {
        return this.all_taglist;
    }

    // [tags] + post_data -> *selected_taglist + API-res -> *tag_infolist + selected_taglist + post_data -> *result
    async analyse(selected_tags) {
        // console.log('target : ' + selected_tags);
        this.__genSelectedTagList(selected_tags);
        await this.__requestTagInfo();
        this.__integrateTagInfo();
    }

    // result -> return innerHTML
    getGalleyData() {
        return this.result;
    }

    // post_data -> all_taglist
    __organizeTagList() {
        this.all_taglist = {};
        for(const item of this.post_data) {
            // 重複を除去したハッシュタグ一覧を生成
            for(const tag of item.tags) {
                if(this.all_taglist[tag]){
                    this.all_taglist[tag]++;
                } else {
                    this.all_taglist[tag] = 1;
                }
            };
        };
        // console.log(this.all_taglist);
    }

    // selected_tags + post_data -> *selected_taglist
    __genSelectedTagList(selected_tags) {
        this.selected_taglist = {};
        for(const tag of selected_tags){
            if(!this.all_taglist[tag]){
                // error
                throw 'tag : ' + tag + 'is not exist!';
            } else {
                // 選択されたタグを含む投稿IDを抽出
                let postids = [];
                for(const item of this.post_data) {
                    if(item.tags.includes(tag)){
                        postids.push(item.id);
                    }
                }
                this.selected_taglist[tag] = postids;
            }
        }
        // console.log(this.selected_taglist);
    }

    // selected_taglist + API-res -> *tag_infolist
    async __requestTagInfo() {
        this.tag_infolist = {};
        for(const tag in this.selected_taglist){
            // ハッシュタグIDを取得
            let gURL = this.fAPI + "ig_hashtag_search?user_id="
                + this.igID + "&q=" + tag + "&access_token=" + this.token;
            let res = await fetch(encodeURI(gURL), {method: 'GET'}); // 日本語タグに対応するためエンコード
            let json = await res.json();
            const tag_id = json["data"][0]["id"];
            // TODO jsonエラーチェック
            // console.log("json : " + JSON.stringify(json));
            // console.log("tag : " + tag + " id : " + tag_id);

            // 最新投稿と人気投稿一覧を取得
            gURL = this.fAPI + tag_id + "/top_media?user_id=" +this.igID
            + "&fields=" + "id,caption" + "&access_token=" + this.token;
            res = await fetch(gURL, {method: 'GET'});
            json = await res.json();
            const top_media = json["data"];
            // TODO jsonエラーチェック
            // console.log(top_media[0]["caption"]);
            gURL = this.fAPI + tag_id + "/recent_media?user_id=" +this.igID
            + "&fields=" + "id,caption" + "&access_token=" + this.token;
            res = await fetch(gURL, {method: 'GET'});
            json = await res.json();
            // TODO jsonエラーチェック
            const recent_media = json["data"];
            // console.log(recent_media[0]["caption"]);

            // tag_infolistへpush
            let top_ids = [];
            let recent_ids = [];
            for(const media of top_media){
                top_ids.push(media['id']);
            }
            for(const media of recent_media){
                recent_ids.push(media['id']);
            }
            this.tag_infolist[tag] = {
                status:1,
                top_id:top_ids,
                recent_id:recent_ids
            };
        }
        // console.log(this.tag_infolist)
    }

    // tag_infolist + selected_taglist + post_data -> *result
    __integrateTagInfo() {
        this.result = [];
        for(const post of this.post_data){
            // 各ハッシュタグのステータスを登録
            let tag_status = [];
            for(const tag of post['tags']){
                let status = "";
                if(this.tag_infolist[tag]){
                    if(this.tag_infolist[tag]['status'] === 0){
                        // Request failure
                        status = 'fail';
                    } else {
                        // Request sucess -> 検索(top優先)
                        if(this.tag_infolist[tag]['top_id'].includes(post['id'])){
                            status = 'top';
                        } else if(this.tag_infolist[tag]['recent_id'].includes(post['id'])){
                            status = 'new';
                        } else {
                            status = 'none';
                        }
                    }
                } else {
                    // 未select -> ignore
                    status = 'ignore';
                }
                tag_status.push({
                    tag:tag,
                    status:status
                });
            }
            this.result.push({
                id:post.id,
                permalink:post.permalink,
                like_count:post.like_count,
                timestamp:post.timestamp,
                media_url:post.media_url,
                tags:tag_status
            });
        }
        // for(const res of this.result){
        //     console.log(res);
        // }
    }
}

module.exports = TagAnalyzer;
