export function copyCurrentUrlWithHash(hash) {
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    navigator.clipboard.writeText(fullUrl).catch(console.error);
}
