// A single local draft. Blobs preserve full-resolution alpha and the restore source.
function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('relax-and-chill', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function draftStore(value) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', value === undefined ? 'readonly' : 'readwrite');
      const request = value === undefined ? tx.objectStore('drafts').get('current') : tx.objectStore('drafts').put(value, 'current');
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error || new Error('Không lưu được bản chỉnh.'));
    });
  } finally { db.close(); }
}
