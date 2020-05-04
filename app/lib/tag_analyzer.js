'use strict';

const fetch = require('node-fetch');
// let gallery = new Object();

// window.onload = function(){
//     gallery = document.getElementById("gallery");
// };

class TagAnalyzer {
    num = 9;   // max 9 object
    igID  = "17841408371705236";
    token = "EAAFsQOxDEXUBAKQrPJ3VZCut6GLyRV1jx0ZAHN2hQpJFQYw8CUhBL4Y41zMZAkxjZCPJnHasL5HegmpcRQnaEF5ySbvnZAbl69VDMSb1BTzcoHwIR02lIsj3xWtZAo8Q9yvNYFwjZCr77m0oZAPBd07hHAJwV7yKGEe4ZAnVTu8gWwgZDZD";
    fAPI = "https://graph.facebook.com/v4.0/";   // Ver.4.0
    post_data; // [(post-id, permalink, like_count, timestamp, media_url, [tag])]
    all_taglist; // [{tag : count}]
    selected_taglist; // [(tag, [post-id])]
    tag_infolist; // [(tag, [popular_id], [new_id])]
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
        let res = new Object();
        // <=== generate API query ===

        try {
            // === get post data ===>
            const res = await fetch(gURL, {method: 'GET'});
            const json = await res.json();
            this.post_data = json;
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

    // [tag] + API-res -> selected_taglist + tag_infolist + post_data -> result
    async analyse(selected_tags) {
        console.log('target : ' + selected_tags);
        // todo
    }

    // result -> return innerHTML
    getGalleyData() {
    }

    // post_data -> all_taglist
    __organizeTagList() {
        this.all_taglist = {};
        const media_data = this.post_data["media"]["data"];
        for(const item of media_data) {
            // 各投稿のハッシュタグ一覧を抽出
            const hashtags = item.caption.match(/[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー._-]+/gm);
            for(const tag of hashtags) {
                let tag_str = tag.slice(1); // remove #
                if(this.all_taglist[tag_str]){
                    this.all_taglist[tag_str]++;
                } else {
                    this.all_taglist[tag_str] = 1;
                }
            };
        };
        // console.log(this.all_taglist);
    }

    // selected_taglist -> tag_infolist (with API)
    __requestTagInfo() {
    }

    // selected_taglist + tag_infolist + post_data -> result
    __integrateTagInfo() {
    }


}

// function apply(){
//     const num   = 9;   // max 9 object
//     const XHR   = new XMLHttpRequest();
//     const fAPI  = "https://graph.facebook.com/v4.0/";   // Ver.4.0
//     const query = "name,username,profile_picture_url,media_count,followers_count,follows_count,media.limit(" + num + "){caption,like_count,media_url,permalink,timestamp,thumbnail_url}";
//     const gURL   = fAPI + igID + "?fields=" + query + "&access_token=" + token;
//     let instagram_data = new Object();
//     if(XHR){
// 	XHR.open("GET", gURL, true);
//         //XHR.responseType = 'json';
//         XHR.timeout = 2000;
// 	XHR.send(null);
//         XHR.onreadystatechange = function(){
// 	    if(XHR.readyState === 4){
//                 if(XHR.status === 200){
// 	            // console.log(XHR.responseText);
// 	            instagram_data = JSON.parse(XHR.responseText);
//                     console.log(instagram_data);
//                     show_gallery(instagram_data);
//                 } else {
//                     // todo
//                     console.log(XHR.status);
//                 }
//             }
//         };
//     }
//     return instagram_data;
// };

// function show_gallery(instagram_data){
//     const gallery_data = instagram_data["media"]["data"];
//     let photos = "";
//     const photo_length = 9;
//     for(let i = 0; i < photo_length ;i++){
//         photos += gen_galleryitem(gallery_data[i]);
//     }
//     gallery.innerHTML = photos;
// };

// function gen_galleryitem(gallery_data){
//     const hashtags = gallery_data.caption.match(/[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー._-]+/gm);
//     console.log(hashtags);
//     const hashtags_str = hashtags.join("</li><li>");

//     const item_html =
//           '<li class="gallery-item">' +
//           '<a href="' +
//           gallery_data.permalink +
//           '" target="_blank"><div class="square-img"><img src="' +
//           gallery_data.media_url + '"/></div></a>' +
//           '<p><ul><li>' +
//           hashtags_str +
//           '</li></ul></p>' +
//           '</li>';
//     return item_html;
// };

module.exports = TagAnalyzer;
