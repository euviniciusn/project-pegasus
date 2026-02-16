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

export async function createJob({ files, outputFormat, quality }) {
  return request('POST', '/jobs', { files, outputFormat, quality });
}

export async function uploadFileToPresigned(url, file) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  return response;
}

export async function startJob(jobId) {
  return request('POST', `/jobs/${jobId}/start`);
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
