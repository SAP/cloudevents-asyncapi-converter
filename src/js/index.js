import { PayloadConverter } from '../../lib/index.ts';

const converter = PayloadConverter.create('v2.0');

const textAreaCloudEvent = document.getElementById('textarea-cloudevent');
const textAreaAsyncApi = document.getElementById('textarea-asyncapi');

const statusCloudEvent = document.getElementById('status-cloudevent');

const buttonAsyncApi = document.getElementById('download-asyncapi');

function handleConversion(payload) {
    if (payload === '') {
        resetConversionResult();
        resetConversionStatus();
    } else {
        try {
            setConversionResult(converter.convertAsString(payload));
            resetConversionStatus();
        } catch (error) {
            setConversionResult(null);
            setConversionStatus('invalid', String(error));
        }
    }

    [textAreaCloudEvent, textAreaAsyncApi].forEach(textArea => {
        textArea.parentElement.dataset.replicatedValue = textArea.value;
    });
}

function setConversionResult(catalog) {
    if (catalog === null) {
        textAreaAsyncApi.value = '';
        textAreaCloudEvent.classList.add('invalid');
        buttonAsyncApi.setAttribute('disabled', '');
    } else {
        textAreaAsyncApi.value = catalog;
        textAreaCloudEvent.classList.remove('invalid');
        buttonAsyncApi.removeAttribute('disabled');
    }
}

function resetConversionResult() {
    textAreaAsyncApi.value = '';
    textAreaCloudEvent.classList.remove('invalid');
    buttonAsyncApi.setAttribute('disabled', '');
}

function downloadConversionResult() {
    const blob = new Blob([textAreaAsyncApi.value], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `asyncapi-${Date.now()}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function setConversionStatus(status, message) {
    statusCloudEvent.innerText = message;
    statusCloudEvent.classList.add(status);
    statusCloudEvent.removeAttribute('hidden');
}

function resetConversionStatus() {
    statusCloudEvent.classList.remove('invalid');
    statusCloudEvent.innerText = '';
}

textAreaCloudEvent.addEventListener('input', () => {
    handleConversion(textAreaCloudEvent.value);
});

textAreaAsyncApi.addEventListener('click', () => {
    textAreaAsyncApi.select();
});

buttonAsyncApi.addEventListener('click', () => {
    downloadConversionResult();
});

document.addEventListener('paste', event => {
    if (event.target === textAreaCloudEvent) {
        return;
    }

    textAreaCloudEvent.value = event.clipboardData.getData('text/plain');
    handleConversion(textAreaCloudEvent.value);
});

document.querySelectorAll('.tab-title-wrapper').forEach(tabTitle => {
    const tabName = tabTitle.getAttribute('data-tab-name');

    tabTitle.addEventListener('click', () => {
        document.body.setAttribute('data-active-tab-name', tabName);
    });

    tabTitle.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            document.body.setAttribute('data-active-tab-name', tabName);
        }
    });
});