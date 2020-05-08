'use strict';

window.onload = function (){
    window.ipcRenderer.invoke('getGalleyData', '').then((res) => {
        genResult(res);
    });
}

function cancel() {
    window.ipcRenderer.invoke('cancel', '');
}

function genResult(res) {
    let result = document.getElementById('result');
    for(const item of res){
        let item_html = "";

        // post data
        const timestamp = new Date(item.timestamp);
        const localtime = timestamp.toLocaleString();
        item_html += `
<div class="result-item">
  <div class="result-post">
    <a href="${item.permalink}" target="_blank">
      <div class="insta-thumbnail">
        <img src="${item.media_url}"/>
      </div>
    </a>
    <div class="result-post-info">
      date: ${localtime}
    </div>
    <div class="result-post-info">
      like: ${item.like_count}
    </div>
  </div>
`;

        // tag info
        item_html +=`
  <div class="result-tags">
`;
        for(const tag of item.tags){
            const status_str =
                  tag.status === 'top'    ? '人気' :
                  tag.status === 'new'    ? '新着' :
                  tag.status === 'none'   ? '効果無し' :
                  tag.status === 'ignore' ? '対象外' :
                  tag.status === 'fail'   ? 'エラー' :
                  '---';
            // each tag status
            item_html += `
    <div class="result-tag-info ${tag.status}">
      <div class="result-tag-name">
        #${tag.tag}
      </div>
      <div class="result-tag-status">
        ${status_str}
      </div>
    </div>
`;
        }
        item_html += `
  </div>
</div>
`;
        result.innerHTML += item_html;
    }
}
