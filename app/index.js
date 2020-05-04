'use strict';

function apply() {
    window.ipcRenderer.invoke('requestPostData', 'req');
}
