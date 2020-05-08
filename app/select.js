'use strict';

window.onload = function (){
    window.ipcRenderer.invoke('getTagList', 'req').then((res) => {
        genTagList(res);
    });
}

function apply() {
    const loader = document.getElementById('loader');
    loader.classList.add('loading');
    let selected_tags = loadSelectedTags();
    window.ipcRenderer.invoke('analyse', selected_tags);
}

function cancel() {
    window.ipcRenderer.invoke('cancel', '');
}

function genTagList(res) {
    let taglist = document.getElementById('taglist');
    let checkbox_html = "";
    for(const tag in res){
        checkbox_html +=
            '<label><input type="checkbox" class="checkbox-input" name="tagselect" value="'
            + tag + '">'
            + '<span class="checkbox-parts">' + tag + ' (' + res[tag] + '回)</span></label>';
    }
    taglist.innerHTML += checkbox_html;
}

function loadSelectedTags() {
    const checkbox = document.getElementsByName("tagselect");
    let selected_tags = [];
    for(const check of checkbox){
        if(check.checked){
            selected_tags.push(check.value);
        }
    }
    return selected_tags;
}
