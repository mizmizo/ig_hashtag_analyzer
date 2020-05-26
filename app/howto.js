'use strict';

function cancel() {
    window.log.info('call howto.cancel()');
    window.ipcRenderer.invoke('cancel', '');
}