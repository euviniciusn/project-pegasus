const BASE_URL = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, opts);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || `Request failed (${response.status})`);
  }

  return data.data;
}

export async function createJob({ files, outputFormat, quality, width, height, resizePercent }) {
  const body = { files, outputFormat, quality };
  if (width) body.width = width;
  if (height) body.height = height;
  if (resizePercent) body.resizePercent = resizePercent;
  return request('POST', '/jobs', body);
}

export function uploadFileWithProgress(url, file, { onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ loaded: e.loaded, total: e.total });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error('Upload network error'));

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    xhr.send(file);
  });
}

export async function startJob(jobId, excludeFileIds) {
  const body = excludeFileIds?.length ? { excludeFileIds } : undefined;
  return request('POST', `/jobs/${jobId}/start`, body);
}

export async function getJobStatus(jobId) {
  return request('GET', `/jobs/${jobId}`);
}

export async function getDownloadUrl(jobId, fileId) {
  return request('GET', `/jobs/${jobId}/download/${fileId}`);
}

export function getDownloadAllUrl(jobId) {
  return `${BASE_URL}/jobs/${jobId}/download-all`;
}
