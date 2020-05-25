'use strict';


function cancel() {
    window.log.info('call select.cancel()');
    window.ipcRenderer.invoke('cancel', '');
}
